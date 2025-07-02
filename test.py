#!/usr/bin/env python3
"""
Test script for enhanced natural language expense parsing
Run this to test the improved parsing capabilities
"""

from add_expense import add_expense

def test_enhanced_parsing():
    """Test various natural language inputs to demonstrate improved parsing"""
    
    test_cases = [
        # Basic cases
        "$38 Groceries, Trader Joe's",
        "$4.80 Starbucks, Coffee",
        "$15 Uber, Ride",
        "$12.38 Chipotle",
        "$8 Amazon, Method Body Soap",
        "$58 Amazon, MyProtein Powder",
        "$83 Adidas, Shoes",
        "$28 Movie Ticket, In The Mood For Love",

        # Complex descriptions
        "$528 Flight Ticket to Amsterdam, $238 Hotel in Amsterdam, $340 Hotel in Frankfurt, $500 Hotel in Paris",
        "$830 Car Rental",
        "$150 Leica Repair",

    ]
    
    print("🧪 Testing Enhanced Natural Language Expense Parsing\n")
    print("=" * 60)
    
    for i, test_input in enumerate(test_cases, 1):
        print(f"\n🎯 Test {i}: {test_input}")
        print("-" * 50)
        
        try:
            add_expense(test_input)
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 50)
    
    print(f"\n🎉 Completed testing {len(test_cases)} different natural language inputs!")
    print("\nTo see all added expenses, run: python main.py list")

if __name__ == "__main__":
    test_enhanced_parsing() 