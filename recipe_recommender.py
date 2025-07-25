#!/usr/bin/env python3
"""
Recipe Recommender CLI

This script recommends recipes based on what you currently have in your pantry.
It uses your local Gemma3n LLM to generate personalized recipe suggestions.

Usage:
    python recipe_recommender.py [options]

Options:
    --cuisine <type>     Filter by cuisine type (e.g., italian, mexican, asian, american)
    --difficulty <level> Filter by difficulty (easy, medium, hard)
    --time <minutes>     Maximum cooking time in minutes
    --servings <number>  Number of servings needed
    --dietary <type>     Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
    --show-all           Show all pantry items (including consumed ones)
    --interactive        Interactive mode to select ingredients
"""

import sqlite3
import requests
import json
import argparse
import sys
import os
from datetime import datetime
from typing import List, Dict, Optional
import warnings
from urllib3.exceptions import NotOpenSSLWarning
warnings.simplefilter("ignore", NotOpenSSLWarning)

def query_llm(prompt: str) -> str:
    """Query the local Gemma3n LLM with retry logic"""
    max_retries = 3
    timeout = 60  # Increased timeout
    
    for attempt in range(max_retries):
        try:
            print(f"🤖 Attempting LLM request (attempt {attempt + 1}/{max_retries})...")
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "gemma3n:e2b", "prompt": prompt, "stream": False},
                timeout=timeout
            )
            
            if res.status_code != 200:
                print(f"⚠️ LLM server error (status {res.status_code}): {res.text}")
                if attempt < max_retries - 1:
                    print("🔄 Retrying...")
                    continue
                raise Exception(f"LLM server returned status {res.status_code}")
            
            response_data = res.json()
            
            if "response" not in response_data:
                print(f"⚠️ Unexpected response structure: {response_data}")
                if attempt < max_retries - 1:
                    print("🔄 Retrying...")
                    continue
                raise Exception("LLM response missing 'response' key")
            
            return response_data["response"]
            
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                print("🔄 Connection failed, retrying...")
                continue
            raise Exception("Cannot connect to LLM server. Make sure Ollama is running with the gemma3n:e2b model.")
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                print(f"🔄 Request timed out after {timeout}s, retrying...")
                continue
            raise Exception(f"LLM request timed out after {timeout} seconds. Try again.")
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"🔄 Error occurred, retrying: {str(e)}")
                continue
            raise Exception(f"LLM error: {str(e)}")
    
    raise Exception("All retry attempts failed")

def get_pantry_items(show_all: bool = False) -> List[Dict]:
    """Get current pantry items from the database"""
    db_path = os.path.join(os.path.dirname(__file__), 'expenses.db')
    
    if not os.path.exists(db_path):
        raise Exception("Database not found. Make sure you're running this from the project root directory.")
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        if show_all:
            c.execute('''
                SELECT name, quantity, unit, grocery_type, is_consumed
                FROM pantry_items
                ORDER BY grocery_type, name
            ''')
        else:
            c.execute('''
                SELECT name, quantity, unit, grocery_type, is_consumed
                FROM pantry_items
                WHERE is_consumed = FALSE AND quantity > 0
                ORDER BY grocery_type, name
            ''')
        
        items = []
        for row in c.fetchall():
            name, quantity, unit, grocery_type, is_consumed = row
            items.append({
                'name': name,
                'quantity': quantity,
                'unit': unit,
                'category': grocery_type or 'other',
                'is_consumed': bool(is_consumed)
            })
        
        return items
    finally:
        conn.close()

def format_pantry_for_llm(items: List[Dict]) -> str:
    """Format pantry items for LLM prompt"""
    if not items:
        return "No ingredients available."
    
    # Group by category
    categories = {}
    for item in items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    # Format as a nice list
    formatted = []
    for category, category_items in sorted(categories.items()):
        formatted.append(f"\n{category.upper()}:")
        for item in sorted(category_items, key=lambda x: x['name'].lower()):
            status = " (consumed)" if item['is_consumed'] else ""
            formatted.append(f"  • {item['name']} ({item['quantity']} {item['unit']}){status}")
    
    return "\n".join(formatted)

def generate_recipe_recommendations(
    pantry_items: List[Dict],
    cuisine: Optional[str] = None,
    difficulty: Optional[str] = None,
    max_time: Optional[int] = None,
    servings: Optional[int] = None,
    dietary: Optional[str] = None
) -> str:
    """Generate recipe recommendations using the LLM or fallback to simple suggestions"""
    
    # Limit pantry items to avoid overly long prompts - take only top 20 most common items
    if len(pantry_items) > 20:
        # Take a sample of diverse items, prioritizing common ingredients
        categories = {}
        for item in pantry_items:
            cat = item['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item)
        
        # Take up to 3 items from each category
        sampled_items = []
        for cat_items in categories.values():
            sampled_items.extend(cat_items[:3])
        
        pantry_items = sampled_items[:20]  # Limit to 20 total
    
    # Build the prompt
    pantry_text = format_pantry_for_llm(pantry_items)
    
    # Build constraints
    constraints = []
    if cuisine:
        constraints.append(f"cuisine: {cuisine}")
    if difficulty:
        constraints.append(f"difficulty: {difficulty}")
    if max_time:
        constraints.append(f"maximum cooking time: {max_time} minutes")
    if servings:
        constraints.append(f"servings: {servings}")
    if dietary:
        constraints.append(f"dietary restrictions: {dietary}")
    
    constraints_text = ", ".join(constraints) if constraints else "any cuisine, any difficulty"
    
    # Much shorter prompt
    prompt = f"""Suggest 3 quick recipes using: {pantry_text}

Constraints: {constraints_text}

Format: ## Recipe: [Name] | Time: [X min] | Difficulty: [Easy/Medium/Hard]

**Ingredients:** [list]
**Instructions:** [numbered steps]
**Notes:** [tips]

Start with recipes immediately."""

    try:
        response = query_llm(prompt)
        return response.strip()
    except Exception as e:
        print(f"⚠️ LLM failed: {str(e)}")
        print("🔄 Falling back to simple recipe suggestions...")
        return generate_fallback_recipes(pantry_items, cuisine, difficulty, max_time, servings, dietary)

def generate_fallback_recipes(
    pantry_items: List[Dict],
    cuisine: Optional[str] = None,
    difficulty: Optional[str] = None,
    max_time: Optional[int] = None,
    servings: Optional[int] = None,
    dietary: Optional[str] = None
) -> str:
    """Generate simple recipe suggestions without LLM"""
    
    # Simple recipe templates based on common ingredients
    recipes = []
    
    # Check for common ingredient combinations
    item_names = [item['name'].lower() for item in pantry_items]
    
    # Pasta recipes
    if any('pasta' in name or 'spaghetti' in name or 'penne' in name for name in item_names):
        if any('tomato' in name or 'sauce' in name for name in item_names):
            recipes.append({
                'name': 'Quick Pasta with Tomato Sauce',
                'time': 15,
                'difficulty': 'Easy',
                'ingredients': ['pasta', 'tomato sauce', 'garlic', 'olive oil', 'salt', 'pepper'],
                'instructions': [
                    'Boil pasta according to package directions',
                    'Heat olive oil in a pan, add minced garlic',
                    'Add tomato sauce and simmer for 5 minutes',
                    'Combine pasta with sauce, season to taste'
                ]
            })
    
    # Rice recipes
    if any('rice' in name for name in item_names):
        if any('vegetable' in name or 'carrot' in name or 'onion' in name for name in item_names):
            recipes.append({
                'name': 'Simple Fried Rice',
                'time': 20,
                'difficulty': 'Easy',
                'ingredients': ['rice', 'vegetables', 'soy sauce', 'oil', 'garlic'],
                'instructions': [
                    'Cook rice and let it cool',
                    'Heat oil in a wok or large pan',
                    'Add chopped vegetables and stir-fry',
                    'Add rice and soy sauce, stir until heated through'
                ]
            })
    
    # Salad recipes
    if any('lettuce' in name or 'spinach' in name or 'arugula' in name for name in item_names):
        recipes.append({
            'name': 'Fresh Garden Salad',
            'time': 10,
            'difficulty': 'Easy',
            'ingredients': ['lettuce', 'tomatoes', 'cucumber', 'olive oil', 'vinegar', 'salt'],
            'instructions': [
                'Wash and chop all vegetables',
                'Combine in a large bowl',
                'Drizzle with olive oil and vinegar',
                'Season with salt and pepper to taste'
            ]
        })
    
    # Sandwich recipes
    if any('bread' in name or 'bagel' in name for name in item_names):
        if any('cheese' in name or 'meat' in name for name in item_names):
            recipes.append({
                'name': 'Quick Sandwich',
                'time': 5,
                'difficulty': 'Easy',
                'ingredients': ['bread', 'cheese', 'lettuce', 'tomato', 'mayonnaise'],
                'instructions': [
                    'Toast bread if desired',
                    'Layer cheese, lettuce, and tomato',
                    'Add mayonnaise or condiments',
                    'Cut diagonally and serve'
                ]
            })
    
    # Smoothie recipes
    if any('fruit' in name or 'banana' in name or 'berry' in name for name in item_names):
        if any('milk' in name or 'yogurt' in name for name in item_names):
            recipes.append({
                'name': 'Fruit Smoothie',
                'time': 5,
                'difficulty': 'Easy',
                'ingredients': ['frozen fruit', 'milk or yogurt', 'honey', 'ice'],
                'instructions': [
                    'Add fruit, milk, and honey to blender',
                    'Blend until smooth',
                    'Add ice if needed for thickness',
                    'Pour and enjoy immediately'
                ]
            })
    
    # If no specific recipes found, suggest general cooking ideas
    if not recipes:
        recipes.append({
            'name': 'Simple Stir-Fry',
            'time': 15,
            'difficulty': 'Easy',
            'ingredients': ['any vegetables', 'protein (if available)', 'soy sauce', 'oil'],
            'instructions': [
                'Chop all ingredients into similar sizes',
                'Heat oil in a pan or wok',
                'Add ingredients in order of cooking time',
                'Season with soy sauce and serve over rice if available'
            ]
        })
        
        recipes.append({
            'name': 'Quick Soup',
            'time': 20,
            'difficulty': 'Easy',
            'ingredients': ['vegetables', 'broth or water', 'herbs', 'salt'],
            'instructions': [
                'Chop vegetables into small pieces',
                'Bring broth to a boil',
                'Add vegetables and simmer until tender',
                'Season with herbs and salt to taste'
            ]
        })
    
    # Format recipes
    result = []
    for i, recipe in enumerate(recipes[:3], 1):
        result.append(f"""## Recipe {i}: {recipe['name']}
**Time:** {recipe['time']} minutes
**Difficulty:** {recipe['difficulty']}

**Ingredients:**
{chr(10).join(f"- {ingredient}" for ingredient in recipe['ingredients'])}

**Instructions:**
{chr(10).join(f"{j+1}. {step}" for j, step in enumerate(recipe['instructions']))}

**Notes:** Use what you have available and adjust quantities as needed.

---""")
    
    return "\n".join(result)

def interactive_ingredient_selection(pantry_items: List[Dict]) -> List[Dict]:
    """Interactive mode to let user select which ingredients to use"""
    print("\n🎯 INTERACTIVE INGREDIENT SELECTION")
    print("=" * 50)
    print("Select which ingredients you'd like to use for recipe recommendations:")
    print("(Enter numbers separated by spaces, or 'all' for all ingredients)")
    print()
    
    # Show available ingredients
    available_items = [item for item in pantry_items if not item['is_consumed'] and item['quantity'] > 0]
    
    if not available_items:
        print("❌ No available ingredients found!")
        return []
    
    for i, item in enumerate(available_items, 1):
        print(f"{i:2d}. {item['name']} ({item['quantity']} {item['unit']}) - {item['category']}")
    
    print()
    
    while True:
        try:
            selection = input("Enter your selection: ").strip()
            
            if selection.lower() == 'all':
                return available_items
            
            # Parse numbers
            indices = [int(x.strip()) - 1 for x in selection.split()]
            
            # Validate indices
            if all(0 <= i < len(available_items) for i in indices):
                selected_items = [available_items[i] for i in indices]
                print(f"\n✅ Selected {len(selected_items)} ingredients:")
                for item in selected_items:
                    print(f"   • {item['name']} ({item['quantity']} {item['unit']})")
                return selected_items
            else:
                print("❌ Invalid selection. Please enter valid numbers.")
                
        except ValueError:
            print("❌ Invalid input. Please enter numbers separated by spaces.")
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            sys.exit(0)

def main():
    parser = argparse.ArgumentParser(
        description="Recipe Recommender - Get personalized recipe suggestions based on your pantry",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python recipe_recommender.py
  python recipe_recommender.py --cuisine italian --difficulty easy
  python recipe_recommender.py --time 30 --servings 2 --dietary vegetarian
  python recipe_recommender.py --interactive
        """
    )
    
    parser.add_argument('--cuisine', help='Filter by cuisine type (e.g., italian, mexican, asian, american)')
    parser.add_argument('--difficulty', choices=['easy', 'medium', 'hard'], help='Filter by difficulty level')
    parser.add_argument('--time', type=int, help='Maximum cooking time in minutes')
    parser.add_argument('--servings', type=int, help='Number of servings needed')
    parser.add_argument('--dietary', help='Dietary restrictions (e.g., vegetarian, vegan, gluten-free)')
    parser.add_argument('--show-all', action='store_true', help='Show all pantry items (including consumed ones)')
    parser.add_argument('--interactive', action='store_true', help='Interactive mode to select ingredients')
    
    args = parser.parse_args()
    
    print("🍳 RECIPE RECOMMENDER")
    print("=" * 50)
    
    try:
        # Get pantry items
        print("📦 Loading pantry items...")
        pantry_items = get_pantry_items(show_all=args.show_all)
        
        if not pantry_items:
            print("❌ No pantry items found!")
            print("\n💡 Try adding some ingredients to your pantry first:")
            print("   - Use the mobile app to add grocery items")
            print("   - Or manually add items to the database")
            return
        
        # Show pantry summary
        available_items = [item for item in pantry_items if not item['is_consumed'] and item['quantity'] > 0]
        consumed_items = [item for item in pantry_items if item['is_consumed'] or item['quantity'] <= 0]
        
        print(f"✅ Found {len(available_items)} available ingredients")
        if consumed_items:
            print(f"📝 {len(consumed_items)} consumed/empty items (use --show-all to see all)")
        
        # Interactive mode
        if args.interactive:
            selected_items = interactive_ingredient_selection(pantry_items)
            if not selected_items:
                return
            items_to_use = selected_items
        else:
            items_to_use = available_items
        
        if not items_to_use:
            print("❌ No available ingredients to work with!")
            return
        
        # Show what we're working with
        print(f"\n🎯 Generating recipes using {len(items_to_use)} ingredients...")
        
        # Show constraints
        constraints = []
        if args.cuisine:
            constraints.append(f"Cuisine: {args.cuisine}")
        if args.difficulty:
            constraints.append(f"Difficulty: {args.difficulty}")
        if args.time:
            constraints.append(f"Max time: {args.time} minutes")
        if args.servings:
            constraints.append(f"Servings: {args.servings}")
        if args.dietary:
            constraints.append(f"Dietary: {args.dietary}")
        
        if constraints:
            print(f"📋 Constraints: {', '.join(constraints)}")
        
        print("\n🤖 Querying AI for recipe suggestions...")
        print("=" * 50)
        
        # Generate recommendations
        recommendations = generate_recipe_recommendations(
            items_to_use,
            cuisine=args.cuisine,
            difficulty=args.difficulty,
            max_time=args.time,
            servings=args.servings,
            dietary=args.dietary
        )
        
        # Display results
        print(recommendations)
        print("\n" + "=" * 50)
        print("🍽️  Happy cooking!")
        
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 