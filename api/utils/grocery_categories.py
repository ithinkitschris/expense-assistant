"""
Grocery Item Categorization Utility

This module provides functions to categorize grocery items into food types
for better organization and sorting in the pantry list.
"""

# Define grocery type categories with their display names and sort order
GROCERY_TYPES = {
    'produce': {
        'display_name': 'Produce',
        'keywords': ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'potato', 'onion', 'garlic', 'pepper', 'cucumber', 'avocado', 'berries'],
        'sort_order': 1
    },
    'meat': {
        'display_name': 'Meat & Seafood',
        'keywords': ['chicken', 'beef', 'pork', 'sausage', 'bacon', 'fish', 'salmon', 'shrimp', 'eggs'],
        'sort_order': 2
    },
    'dairy': {
        'display_name': 'Dairy & Cheese',
        'keywords': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
        'sort_order': 3
    },
    'bread': {
        'display_name': 'Bakery & Bread',
        'keywords': ['bread', 'bagel', 'croissant', 'muffin', 'tortilla'],
        'sort_order': 4
    },
    'pantry': {
        'display_name': 'Pantry',
        'keywords': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'canned', 'soup', 'beans', 'cereal', 'oats'],
        'sort_order': 5
    },
    'frozen': {
        'display_name': 'Frozen Foods',
        'keywords': ['frozen', 'ice cream', 'pizza'],
        'sort_order': 6
    },
    'beverages': {
        'display_name': 'Beverages',
        'keywords': ['water', 'juice', 'soda', 'tea', 'coffee', 'wine', 'beer'],
        'sort_order': 7
    },
    'snacks': {
        'display_name': 'Snacks',
        'keywords': ['chips', 'crackers', 'cookies', 'nuts', 'popcorn', 'pretzels', 'wafer'],
        'sort_order': 8
    },
    'condiments': {
        'display_name': 'Condiments & Spices',
        'keywords': ['ketchup', 'mustard', 'mayo', 'sauce', 'dressing', 'syrup', 'jam'],
        'sort_order': 9
    },
    'other': {
        'display_name': 'Other',
        'keywords': [],
        'sort_order': 10
    }
}


def get_grocery_type_display_name(grocery_type):
    """
    Get the display name for a grocery type.
    
    Args:
        grocery_type (str): The grocery type category
        
    Returns:
        str: The display name for the grocery type
    """
    return GROCERY_TYPES.get(grocery_type, GROCERY_TYPES['other'])['display_name']


def get_grocery_type_sort_order(grocery_type: str) -> int:
    """
    Returns a sort order for a given grocery type.
    """
    order = {
        'produce': 1,
        'meat': 2,
        'dairy': 3,
        'bread': 4,
        'pantry': 5,
        'frozen': 6,
        'beverages': 7,
        'snacks': 8,
        'condiments': 9,
        'other': 10
    }
    return order.get(grocery_type, 99)


def get_all_grocery_types():
    """
    Get all grocery types with their metadata.
    
    Returns:
        dict: A dictionary of all grocery types
    """
    return GROCERY_TYPES 