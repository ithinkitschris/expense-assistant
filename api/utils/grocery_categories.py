"""
Grocery Item Categorization Utility

This module provides functions to categorize grocery items into food types
for better organization and sorting in the pantry list.
"""

# Define grocery type categories with their display names and sort order
GROCERY_TYPES = {
    'produce': {
        'display_name': 'Produce',
        'keywords': [
            # Fruits
            'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'mango', 'pineapple', 'kiwi', 'peach', 'pear', 'plum', 'cherry', 'apricot', 'nectarine', 'fig', 'date', 'prune', 'raisin', 'cranberry', 'currant',
            # Vegetables
            'lettuce', 'tomato', 'potato', 'onion', 'garlic', 'pepper', 'cucumber', 'avocado', 'carrot', 'celery', 'broccoli', 'cauliflower', 'spinach', 'kale', 'cabbage', 'brussels', 'asparagus', 'zucchini', 'eggplant', 'mushroom', 'corn', 'peas', 'beans', 'green bean', 'squash', 'pumpkin', 'sweet potato', 'yam',
            # Herbs
            'basil', 'parsley', 'cilantro', 'mint', 'rosemary', 'thyme', 'oregano', 'sage', 'dill', 'chive', 'scallion', 'green onion', 'leek', 'shallot',
            # Generic terms
            'fruit', 'vegetable', 'fresh', 'organic'
        ],
        'sort_order': 1
    },
    'meat': {
        'display_name': 'Meat',
        'keywords': [
            # Poultry
            'chicken', 'turkey', 'duck', 'quail', 'pheasant',
            # Red meat
            'beef', 'pork', 'lamb', 'veal', 'bison', 'venison',
            # Processed meat
            'sausage', 'bacon', 'ham', 'salami', 'pepperoni', 'prosciutto', 'pastrami', 'corned beef', 'hot dog', 'burger', 'meatball',
            # Seafood
            'fish', 'salmon', 'tuna', 'cod', 'halibut', 'mackerel', 'sardine', 'anchovy', 'shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'octopus',
            # Eggs
            'egg', 'eggs'
        ],
        'sort_order': 2
    },
    'dairy': {
        'display_name': 'Dairy',
        'keywords': [
            # Milk products
            'milk', 'cream', 'half and half', 'heavy cream', 'whipping cream', 'sour cream', 'buttermilk',
            # Cheese
            'cheese', 'cheddar', 'mozzarella', 'parmesan', 'brie', 'camembert', 'feta', 'goat cheese', 'blue cheese', 'gouda', 'swiss', 'provolone', 'ricotta', 'cottage cheese', 'cream cheese',
            # Yogurt
            'yogurt', 'yoghurt', 'greek yogurt', 'plain yogurt', 'vanilla yogurt', 'fruit yogurt',
            # Butter and spreads
            'butter', 'margarine', 'ghee',
            # Other dairy
            'ice cream', 'gelato', 'sorbet', 'pudding', 'custard'
        ],
        'sort_order': 3
    },
    'bread': {
        'display_name': 'Bread',
        'keywords': [
            # Bread types
            'bread', 'white bread', 'wheat bread', 'whole wheat bread', 'sourdough', 'rye bread', 'pumpernickel', 'french bread', 'italian bread', 'baguette', 'ciabatta', 'focaccia',
            # Pastries
            'bagel', 'croissant', 'muffin', 'danish', 'donut', 'doughnut', 'pastry', 'bun', 'roll',
            # Wraps and flatbreads
            'tortilla', 'pita', 'naan', 'flatbread', 'wrap', 'lavash',
            # Cakes and sweet breads
            'cake', 'brownie', 'cookie', 'biscuit'
        ],
        'sort_order': 4
    },
    'staples': {
        'display_name': 'Staples',
        'keywords': [
            # Grains
            'rice', 'white rice', 'brown rice', 'basmati rice', 'jasmine rice', 'wild rice', 'quinoa', 'couscous', 'bulgur', 'barley', 'farro', 'millet', 'oats', 'oatmeal', 'steel cut oats',
            # Pasta
            'pasta', 'noodles', 'spaghetti', 'macaroni', 'penne', 'linguine', 'fettuccine', 'rigatoni', 'lasagna', 'ravioli', 'tortellini', 'ramen', 'udon', 'soba', 'vermicelli',
            # Legumes
            'lentils', 'chickpeas', 'garbanzo beans', 'black beans', 'kidney beans', 'pinto beans', 'navy beans', 'lima beans', 'split peas', 'black eyed peas',
            # Other staples
            'potato', 'sweet potato', 'yam'
        ],
        'sort_order': 5
    },
    'pantry': {
        'display_name': 'Pantry',
        'keywords': [
            # Baking ingredients
            'flour', 'all purpose flour', 'bread flour', 'cake flour', 'whole wheat flour', 'almond flour', 'coconut flour', 'sugar', 'brown sugar', 'powdered sugar', 'confectioners sugar', 'honey', 'maple syrup', 'agave', 'molasses',
            # Oils and fats
            'oil', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'avocado oil', 'grapeseed oil',
            # Vinegars and acids
            'vinegar', 'apple cider vinegar', 'balsamic vinegar', 'white vinegar', 'red wine vinegar', 'rice vinegar',
            # Canned goods
            'canned', 'can of', 'soup', 'broth', 'stock', 'tomato sauce', 'tomato paste', 'crushed tomatoes', 'diced tomatoes',
            # Cereals and breakfast
            'cereal', 'granola', 'muesli',
            # Spices and seasonings
            'salt', 'pepper', 'black pepper', 'white pepper', 'cinnamon', 'nutmeg', 'cardamom', 'cloves', 'bay leaves', 'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'cumin', 'coriander', 'turmeric', 'paprika', 'chili powder', 'cayenne', 'garlic powder', 'onion powder', 'msg', 'monosodium glutamate',
            # Other pantry staples
            'baking soda', 'baking powder', 'yeast', 'vanilla extract', 'almond extract', 'food coloring'
        ],
        'sort_order': 6
    },
    'frozen': {
        'display_name': 'Frozen',
        'keywords': [
            # Explicitly frozen items
            'frozen', 'frozen vegetables', 'frozen fruit', 'frozen meat', 'frozen fish', 'frozen pizza', 'frozen dinner', 'frozen meal',
            # Common frozen items
            'ice cream', 'gelato', 'sorbet', 'popsicle', 'ice pop', 'frozen yogurt',
            # Frozen convenience foods
            'frozen waffles', 'frozen pancakes', 'frozen french fries', 'frozen onion rings', 'frozen chicken nuggets', 'frozen fish sticks'
        ],
        'sort_order': 7
    },
    'beverages': {
        'display_name': 'Beverages',
        'keywords': [
            # Non-alcoholic
            'water', 'sparkling water', 'mineral water', 'juice', 'orange juice', 'apple juice', 'grape juice', 'cranberry juice', 'lemonade', 'limeade', 'soda', 'pop', 'cola', 'sprite', 'ginger ale', 'root beer', 'tea', 'green tea', 'black tea', 'herbal tea', 'chamomile tea', 'peppermint tea', 'coffee', 'espresso', 'latte', 'cappuccino', 'hot chocolate', 'cocoa',
            # Alcoholic
            'wine', 'red wine', 'white wine', 'beer', 'ale', 'lager', 'stout', 'whiskey', 'vodka', 'rum', 'gin', 'tequila', 'brandy', 'cognac',
            # Energy and sports drinks
            'energy drink', 'sports drink', 'protein shake', 'smoothie'
        ],
        'sort_order': 8
    },
    'snacks': {
        'display_name': 'Snacks',
        'keywords': [
            # Chips and crackers
            'chips', 'potato chips', 'tortilla chips', 'corn chips', 'crackers', 'saltine crackers', 'ritz crackers', 'wheat crackers', 'pretzels',
            # Nuts and seeds
            'nuts', 'almonds', 'walnuts', 'pecans', 'cashews', 'pistachios', 'peanuts', 'sunflower seeds', 'pumpkin seeds', 'chia seeds', 'flax seeds',
            # Sweet snacks
            'cookies', 'biscuits', 'crackers', 'popcorn', 'wafer', 'chocolate', 'candy', 'gum', 'mints',
            # Dried fruits
            'raisins', 'dried cranberries', 'dried apricots', 'dried mango', 'dried pineapple',
            # Protein bars and snacks
            'protein bar', 'energy bar', 'granola bar', 'fruit snack', 'trail mix'
        ],
        'sort_order': 9
    },
    'condiments': {
        'display_name': 'Condiments',
        'keywords': [
            # Sauces and spreads
            'ketchup', 'mustard', 'mayo', 'mayonnaise', 'sauce', 'soy sauce', 'fish sauce', 'oyster sauce', 'hoisin sauce', 'sriracha', 'hot sauce', 'tabasco', 'worcestershire sauce', 'bbq sauce', 'teriyaki sauce', 'marinara sauce', 'alfredo sauce', 'pesto sauce',
            # Dressings and dips
            'dressing', 'salad dressing', 'ranch dressing', 'italian dressing', 'vinaigrette', 'dip', 'hummus', 'guacamole', 'salsa',
            # Sweet condiments
            'syrup', 'maple syrup', 'chocolate syrup', 'caramel syrup', 'jam', 'jelly', 'preserves', 'marmalade', 'peanut butter', 'almond butter', 'cashew butter', 'nutella', 'honey', 'agave nectar',
            # Other condiments
            'relish', 'pickles', 'olives', 'capers', 'anchovy paste', 'tomato paste'
        ],
        'sort_order': 10
    },
    'other': {
        'display_name': 'Other',
        'keywords': [],
        'sort_order': 11
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
    return GROCERY_TYPES.get(grocery_type, GROCERY_TYPES['other'])['sort_order']


def get_all_grocery_types():
    """
    Get all grocery types with their metadata.
    
    Returns:
        dict: A dictionary of all grocery types
    """
    return GROCERY_TYPES


def categorize_grocery_item_rule_based(item_name: str) -> str:
    """
    Categorize grocery item based on keywords in its name.
    This is an improved version with more comprehensive keyword matching.
    
    Args:
        item_name (str): The name of the grocery item
        
    Returns:
        str: The category the item belongs to
    """
    item_name = item_name.lower().strip()

    # Always categorize anything with 'broth' as pantry
    if 'broth' in item_name:
        return 'pantry'
    # Always categorize anything with 'yogurt' as dairy
    if 'yogurt' in item_name:
        return 'dairy'
    # Always categorize anything with 'granola' as snacks
    if 'granola' in item_name:
        return 'snacks'
    
    # Cooking sauces (should be pantry)
    COOKING_SAUCES = [
        'soy sauce', 'oyster sauce', 'fish sauce', 'hoisin sauce', 'hoi sin sauce', 'tomato sauce', 'marinara sauce', 'alfredo sauce',
        'worcestershire sauce', 'shaoxing wine', 'mirin', 'cooking wine', 'black bean sauce', 'doubanjiang', 'teriyaki sauce',
        'ponzu', 'mole sauce', 'curry sauce', 'pasta sauce', 'bolognese sauce', 'carbonara sauce', 'demi glace', 'gravy',
        'sukiyaki sauce', 'bulgogi sauce', 'gochujang', 'sambal', 'nam pla', 'maggi seasoning', 'liquid aminos', 'miso paste'
    ]
    for sauce in COOKING_SAUCES:
        if sauce in item_name:
            return 'pantry'
    
    # Condiment sauces (should be condiments)
    CONDIMENT_SAUCES = [
        'ketchup', 'mustard', 'mayonnaise', 'mayo', 'bbq sauce', 'barbecue sauce', 'sriracha', 'hot sauce', 'tabasco',
        'ranch dressing', 'salad dressing', 'thousand island', 'caesar dressing', 'blue cheese dressing', 'aioli', 'tartar sauce',
        'cocktail sauce', 'remoulade', 'chili sauce', 'sweet chili sauce', 'honey mustard', 'chipotle sauce', 'buffalo sauce',
        'fry sauce', 'burger sauce', 'special sauce', 'tzatziki', 'hummus', 'guacamole', 'salsa', 'pico de gallo', 'relish',
        'pickles', 'olives', 'capers', 'anchovy paste', 'tomato ketchup', 'dijon', 'yellow mustard', 'spicy mustard'
    ]
    for sauce in CONDIMENT_SAUCES:
        if sauce in item_name:
            return 'condiments'
    
    # Special cases that need to be checked first
    special_cases = {
        'peanut butter': 'condiments',
        'almond butter': 'condiments',
        'cashew butter': 'condiments',
        'nutella': 'condiments',
        'kaya': 'condiments',
        'fish sauce': 'condiments',
        'soy sauce': 'condiments',
        'oyster sauce': 'condiments',
        'hoisin sauce': 'condiments',
        'sriracha': 'condiments',
        'hot sauce': 'condiments',
        'tabasco': 'condiments',
        'worcestershire sauce': 'condiments',
        'bbq sauce': 'condiments',
        'teriyaki sauce': 'condiments',
        'marinara sauce': 'condiments',
        'alfredo sauce': 'condiments',
        'pesto sauce': 'condiments',
        'honey': 'condiments',
        'maple syrup': 'condiments',
        'agave nectar': 'condiments',
        'ice cream': 'frozen',
        'gelato': 'frozen',
        'sorbet': 'frozen',
        'frozen': 'frozen',
        'brownie': 'snacks',
        'cookie': 'snacks',
        'cookies': 'snacks',
        'cake': 'snacks',
        'chocolate': 'snacks',
        'candy': 'snacks',
        'gum': 'snacks',
        'mints': 'snacks',
        'protein bar': 'snacks',
        'energy bar': 'snacks',
        'granola bar': 'snacks',
        'fruit snack': 'snacks',
        'trail mix': 'snacks',
        'chips': 'snacks',
        'crackers': 'snacks',
        'popcorn': 'snacks',
        'pretzels': 'snacks',
        'nuts': 'snacks',
        'almonds': 'snacks',
        'walnuts': 'snacks',
        'pecans': 'snacks',
        'cashews': 'snacks',
        'pistachios': 'snacks',
        'peanuts': 'snacks',
        'sunflower seeds': 'snacks',
        'pumpkin seeds': 'snacks',
        'chia seeds': 'snacks',
        'flax seeds': 'snacks',
        'raisins': 'snacks',
        'dried cranberries': 'snacks',
        'dried apricots': 'snacks',
        'dried mango': 'snacks',
        'dried pineapple': 'snacks',
        'wafer': 'snacks',
        'mango black tea': 'beverages',
        'nespresso': 'beverages',
        'old town white coffee': 'beverages',
        'blueberry yogurt': 'dairy',
        'honey yogurt': 'dairy',
        'mango yogurt': 'dairy',
        'greek yogurt': 'dairy',
        'plain yogurt': 'dairy',
        'vanilla yogurt': 'dairy',
        'fruit yogurt': 'dairy',
        'organic milk': 'dairy',
        '2% milk': 'dairy',
        'whole milk': 'dairy',
        'skim milk': 'dairy',
        'canned tomatoes': 'pantry',
        'canned': 'pantry',
        'can of': 'pantry',
        'soup': 'pantry',
        'broth': 'pantry',
        'stock': 'pantry',
        'tomato sauce': 'pantry',
        'tomato paste': 'pantry',
        'crushed tomatoes': 'pantry',
        'diced tomatoes': 'pantry',
        # Additional specific cases from the database
        'red grapes': 'produce',
        'minced garlic': 'pantry',
        'seaweed flakes': 'pantry',
        'radish cake': 'frozen',
        'kang kong': 'produce',
        'mid joint wings': 'meat',
        'vegetable gyoza': 'frozen',
        'impossible nuggets': 'frozen',
        'nuggets': 'frozen',
        'hash browns': 'frozen',
        'blueberries': 'produce',
        'parmigiano reggiano': 'dairy',
        'rosemary ham': 'meat',
        'shaoxing cooking wine': 'beverages',
        'mirin wine': 'beverages',
        'rice vinegar': 'pantry',
        'red wine': 'beverages',
        'white wine': 'beverages',
        'ikan bilis': 'pantry',
        'lemon chilli sauce': 'condiments',
        'star anise': 'pantry',
        'dried chilli': 'pantry',
        'red peppercorn': 'pantry',
        'peanut butter chocolate granola': 'snacks',
        'chickpea fusili': 'staples',
        'shredded hash browns': 'frozen',
        'baby bella mushrooms': 'produce',
        'campari tomatoes': 'produce',
        'nespresso rich chocolate': 'beverages',
    }
    
    # Check special cases first (exact matches)
    for keyword, category in special_cases.items():
        if keyword in item_name:
            return category
    
    # Check for frozen items (must contain "frozen" explicitly)
    if 'frozen' in item_name:
        return 'frozen'
    
    # Now check category keywords with more precise matching
    for category, category_data in GROCERY_TYPES.items():
        if category == 'other':
            continue
            
        keywords = category_data['keywords']
        for keyword in keywords:
            # Use word boundary matching to avoid false positives
            # Check if the keyword appears as a whole word or at the beginning/end
            if (keyword == item_name or 
                item_name.startswith(keyword + ' ') or 
                item_name.endswith(' ' + keyword) or 
                ' ' + keyword + ' ' in item_name):
                # Combine bread and staples - redirect bread items to staples
                if category == 'bread':
                    return 'staples'
                return category
    
    return 'other' 