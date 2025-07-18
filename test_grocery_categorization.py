#!/usr/bin/env python3
"""
Test script for AI-enhanced grocery categorization
Run this to test the improved categorization capabilities
"""

import sys
import os

# Import the grocery categorization functions
from api.utils.grocery_categories import categorize_grocery_item, categorize_grocery_item_ai, categorize_grocery_item_rule_based

def test_grocery_categorization():
    """Test various grocery items to demonstrate improved categorization"""
    
    test_cases = [
        # Basic cases that should work with both AI and rules
        "apple",
        "milk",
        "bread",
        "chicken",
        
        # Edge cases that should benefit from AI
        "organic whole grain bread",
        "frozen chicken breast",
        "protein bar",
        "chicken soup",
        "ice cream cake",
        "greek yogurt",
        "fresh spinach",
        "canned tomatoes",
        "gluten-free pasta",
        "vegan cheese",
        "organic bananas",
        "2% milk",
        "whole wheat bread",
        "free-range eggs",
        "wild salmon",
        "extra virgin olive oil",
        "dark chocolate",
        "green tea",
        "hot sauce",
        
        # Complex cases
        "organic free-range chicken breast",
        "gluten-free whole grain bread",
        "non-dairy almond milk yogurt",
        "fresh organic strawberries",
        
        # Brand names and variations
        "chobani greek yogurt",
        "trader joe's organic milk",
        "dave's killer bread",
        "beyond meat burger",
        
        # Ambiguous cases
        "protein shake",
        "energy bar",
        "fruit snack",
        "granola bar",
    ]
    
    print("🧪 Testing AI-Enhanced Grocery Categorization\n")
    print("=" * 80)
    
    for i, test_input in enumerate(test_cases, 1):
        print(f"\n🎯 Test {i}: {test_input}")
        print("-" * 60)
        
        try:
            # Test AI categorization
            ai_result = categorize_grocery_item_ai(test_input)
            print(f"🤖 AI Result: {ai_result['category']} (confidence: {ai_result['confidence']:.2f})")
            print(f"   Reasoning: {ai_result['reasoning']}")
            
            # Test rule-based categorization
            rule_result = categorize_grocery_item_rule_based(test_input)
            print(f"📋 Rule Result: {rule_result}")
            
            # Test hybrid categorization
            hybrid_result = categorize_grocery_item(test_input)
            print(f"🎯 Hybrid Result: {hybrid_result}")
            
            # Show if AI and rules differ
            if ai_result['category'] != rule_result:
                print(f"⚠️  AI and rules differ! AI: {ai_result['category']}, Rules: {rule_result}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 60)
    
    print(f"\n🎉 Completed testing {len(test_cases)} different grocery items!")
    print("\nKey improvements:")
    print("• AI handles complex descriptions and brand names")
    print("• AI understands context (e.g., 'frozen' vs 'fresh')")
    print("• AI provides confidence scoring")
    print("• Rule-based system provides reliable fallback")
    print("• Hybrid approach ensures best of both worlds")

if __name__ == "__main__":
    test_grocery_categorization() 