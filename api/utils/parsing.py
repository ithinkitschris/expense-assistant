from typing import List
import requests
import json
import re
import time

def categorize_grocery_item_rule_based(item_name: str) -> str:
    """Categorize grocery item based on keywords in its name"""
    item_name = item_name.lower()
    
    # Define keywords for each category
    categories = {
        'produce': ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'potato', 'onion', 'garlic', 'pepper', 'cucumber', 'avocado', 'berries'],
        'meat': ['chicken', 'beef', 'pork', 'sausage', 'bacon', 'fish', 'salmon', 'shrimp', 'eggs'],
        'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
        'bread': ['bread', 'bagel', 'croissant', 'muffin', 'tortilla'],
        'pantry': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'canned', 'soup', 'beans', 'cereal', 'oats'],
        'frozen': ['frozen', 'ice cream', 'pizza'],
        'beverages': ['water', 'juice', 'soda', 'tea', 'coffee', 'wine', 'beer'],
        'snacks': ['chips', 'crackers', 'cookies', 'nuts', 'popcorn', 'pretzels', 'wafer'],
        'condiments': ['ketchup', 'mustard', 'mayo', 'sauce', 'dressing', 'syrup', 'jam']
    }
    
    # Check for keywords
    for category, keywords in categories.items():
        if any(keyword in item_name for keyword in keywords):
            return category
            
    return 'other'


def parse_grocery_items_and_categories(description: str) -> List[dict]:
    """
    Parses a string (single or multiple items) and returns a list of
    {"item": ..., "category": ...} dicts.
    Uses LLM for both splitting and categorization, with rule-based fallback.
    """
    
    description = description.strip()
    if not description:
        return []
    
    prompt = f"""
    You are an expert grocery parser. Given a string containing one or more grocery items (possibly separated by commas, newlines, or 'and'), extract each individual grocery item and assign it to one of these categories: produce, meat, dairy, bread, pantry, frozen, beverages, snacks, condiments, other.

    Input: "{description}"

    Return ONLY valid JSON in this format:
    [
      {{"item": "lemon baton wafer", "category": "snacks"}},
      {{"item": "organic milk", "category": "dairy"}},
      {{"item": "eggs", "category": "meat"}}
    ]
    - For single items, just return a one-item list.
    - Keep brand names if they're part of the item name (e.g., "chobani yogurt").
    - For complex items, keep the full descriptive name (e.g., "lemon baton wafer").
    - If no specific items are found, return an empty list.
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
                        parsed.append({"item": item.strip(), "category": category.strip()})
                if parsed:
                    return parsed
            except Exception:
                continue
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
