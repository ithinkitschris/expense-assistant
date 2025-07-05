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
        "$83 Adidas, Shoes",
        "$28 Movie Ticket, In The Mood For Love",

        # Complex descriptions
        "I finally made a decision to purchase the 2025 Porsche 911 GTS for $193,000 last month and I am so glad I did it. The flight to the dealership cost me $8,200 on Delta First Class, and the accommodations for that trip totaled $9,899 for 4 nights at the Waldorf Astoria.",

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