from typing import List
import requests
import json
import re
import time
from .grocery_categories import categorize_grocery_item_rule_based, GROCERY_TYPES

def parse_grocery_items_and_categories(description: str) -> List[dict]:
    """
    Parses a string (single or multiple items) and returns a list of
    {"item": ..., "category": ...} dicts.
    Uses LLM for both splitting and categorization, with rule-based fallback.
    """
    
    description = description.strip()
    if not description:
        return []
    
    # Create a comprehensive category guide for the AI
    category_guide = "\n".join([
        f"- {cat}: {data['display_name']} - {', '.join(data['keywords'][:10])}{'...' if len(data['keywords']) > 10 else ''}"
        for cat, data in GROCERY_TYPES.items() if cat != 'other'
    ])
    
    prompt = f"""
    You are an expert grocery parser. Given a string containing one or more grocery items (possibly separated by commas, newlines, or 'and'), extract each individual grocery item and assign it to the most appropriate category.

    Available categories and their typical items:
    {category_guide}

    Categorization rules:
    - "produce": Fresh fruits, vegetables, herbs
    - "meat": All meat, poultry, fish, seafood, eggs
    - "dairy": Milk, cheese, yogurt, butter (but NOT nut butters like peanut butter)
    - "bread": Bread, bagels, croissants, muffins, tortillas, pita (but NOT sweet baked goods like cookies, brownies)
    - "staples": Rice, pasta, grains, legumes, potatoes
    - "pantry": Flour, sugar, oils, vinegars, spices, canned goods, baking ingredients
    - "frozen": Items that are frozen (ice cream, frozen vegetables, frozen meals)
    - "beverages": Drinks, juices, sodas, tea, coffee, alcohol
    - "snacks": Chips, crackers, nuts, cookies, candy, protein bars, sweet baked goods
    - "condiments": Sauces, dressings, spreads (including peanut butter, nut butters), jams, syrups, honey

    Special cases:
    - Peanut butter, almond butter, Nutella → condiments
    - Ice cream, gelato → frozen (not dairy)
    - Cookies, brownies, cakes → snacks (not bread)
    - Honey, maple syrup → condiments (not pantry)
    - Fish sauce, soy sauce → condiments (not pantry)

    Input: "{description}"

    Return ONLY valid JSON in this format:
    [
      {{"item": "lemon baton wafer", "category": "snacks"}},
      {{"item": "organic milk", "category": "dairy"}},
      {{"item": "peanut butter", "category": "condiments"}},
      {{"item": "eggs", "category": "meat"}}
    ]
    
    Guidelines:
    - For single items, just return a one-item list
    - Keep brand names if they're part of the item name (e.g., "chobani yogurt")
    - For complex items, keep the full descriptive name (e.g., "lemon baton wafer")
    - If no specific items are found, return an empty list
    - Be consistent with the categorization rules above
    """
    
    for attempt in range(2):
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "gemma3n:e2b", "prompt": prompt, "stream": False},
                timeout=20
            )
            if response.status_code != 200:
                if attempt < 1:
                    time.sleep(1)
                    continue
                else:
                    break
            response_data = response.json()
            if "response" not in response_data:
                if attempt < 1:
                    time.sleep(1)
                    continue
                else:
                    break
            ai_response = response_data["response"].strip()
            if "```" in ai_response:
                ai_response = ai_response.replace("```json", "").replace("```", "").strip()
            start = ai_response.find('[')
            end = ai_response.rfind(']')
            if start != -1 and end != -1 and end > start:
                ai_response = ai_response[start:end+1]
            try:
                items = json.loads(ai_response)
                # Validate and clean up
                parsed = []
                for entry in items:
                    item = entry.get('item') or entry.get('name')
                    category = entry.get('category')
                    if item and category:
                        # Validate category is one of our known categories
                        if category in GROCERY_TYPES:
                            parsed.append({"item": item.strip(), "category": category.strip()})
                        else:
                            # If AI returned unknown category, use rule-based fallback
                            fallback_category = categorize_grocery_item_rule_based(item.strip())
                            parsed.append({"item": item.strip(), "category": fallback_category})
                if parsed:
                    return parsed
            except Exception:
                continue
        except (requests.exceptions.RequestException, requests.exceptions.Timeout, requests.exceptions.ConnectionError):
            # LLM service is not available, fall back to rule-based categorization
            break
        except Exception:
            continue
    
    # Fallback: split by commas/newlines and categorize each
    fallback_items = re.split(r'[\n,]+', description)
    parsed = []
    for item in fallback_items:
        item = item.strip()
        if item:
            parsed.append({"item": item, "category": categorize_grocery_item_rule_based(item)})
    return parsed
