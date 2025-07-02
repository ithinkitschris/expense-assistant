#!/usr/bin/env python3
"""
Demo script showing the enhanced expense reporting capabilities
"""

from summarize import summarize
import time

def demo_reports():
    """Demonstrate different report types"""
    
    print("🚀 EXPENSE ASSISTANT - ENHANCED REPORTING DEMO")
    print("=" * 60)
    
    # Demo 1: Quick Summary
    print("\n1️⃣ QUICK SUMMARY")
    print("-" * 30)
    summarize(report_type="quick")
    
    time.sleep(2)
    
    # Demo 2: Comprehensive Analysis  
    print("\n2️⃣ COMPREHENSIVE ANALYSIS")
    print("-" * 30)
    summarize(report_type="comprehensive")
    
    time.sleep(2)
    
    # Demo 3: Insights Focus
    print("\n3️⃣ SPENDING INSIGHTS")
    print("-" * 30)
    summarize(report_type="insights")
    
    time.sleep(2)
    
    # Demo 4: Budget Analysis
    print("\n4️⃣ BUDGET ANALYSIS")
    print("-" * 30)
    summarize(report_type="budget_analysis")
    
    time.sleep(2)
    
    # Demo 5: Weekly Report
    print("\n5️⃣ WEEKLY REPORT (Last 7 days)")
    print("-" * 30)
    summarize(report_type="comprehensive", timeframe_days=7)
    
    time.sleep(2)
    
    # Demo 6: Custom Prompt
    print("\n6️⃣ CUSTOM ANALYSIS")
    print("-" * 30)
    custom_prompt = """
    I'm trying to save money for a vacation. 
    Analyze my spending and tell me:
    1. Where I'm spending too much money
    2. What categories I could cut back on
    3. How much I could potentially save per month
    Be specific with dollar amounts and actionable advice.
    """
    summarize(prompt=custom_prompt)

if __name__ == "__main__":
    demo_reports() 