import sqlite3
from datetime import datetime, timedelta
from parse_expense import query_llm

def get_all_expenses():
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("SELECT amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
    data = c.fetchall()
    conn.close()
    return data

def get_expenses_by_timeframe(days=None):
    """Get expenses within a specific timeframe"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    if days:
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        c.execute("SELECT amount, category, description, timestamp FROM expenses WHERE timestamp >= ? ORDER BY timestamp DESC", (cutoff_date,))
    else:
        c.execute("SELECT amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
    
    data = c.fetchall()
    conn.close()
    return data

def calculate_category_totals(entries):
    """Calculate totals by category"""
    category_totals = {}
    for entry in entries:
        amount, category, _, _ = entry
        if amount is not None:
            category_totals[category] = category_totals.get(category, 0) + amount
    return category_totals

def format_time_context(entries):
    """Add time context to the data"""
    if not entries:
        return "No expenses in timeframe."
    
    timestamps = [datetime.fromisoformat(entry[3]) for entry in entries if entry[3]]
    if timestamps:
        earliest = min(timestamps)
        latest = max(timestamps)
        timespan = (latest - earliest).days
        return f"Data spans {timespan + 1} days from {earliest.strftime('%m/%d/%Y')} to {latest.strftime('%m/%d/%Y')}"
    return ""

def summarize(prompt=None, report_type="comprehensive", timeframe_days=None):
    """
    Generate expense summary with improved prompt engineering
    
    Args:
        prompt: Custom prompt (if None, uses report_type)
        report_type: "quick", "comprehensive", "insights", "budget_analysis"
        timeframe_days: Number of days to look back (None for all time)
    """
    
    entries = get_expenses_by_timeframe(timeframe_days)
    if not entries:
        print("No expenses found.")
        return

    # Calculate totals and context
    category_totals = calculate_category_totals(entries)
    total_spent = sum(category_totals.values())
    time_context = format_time_context(entries)
    
    # Format entries more cleanly
    formatted_entries = []
    for entry in entries:
        amount, category, description, timestamp = entry
        if amount is not None:
            date_str = datetime.fromisoformat(timestamp).strftime('%m/%d') if timestamp else 'Unknown'
            formatted_entries.append(f"${amount:.2f} - {category} - {description} ({date_str})")

    if not formatted_entries:
        print("No valid expenses found.")
        return

    # Category breakdown
    category_breakdown = "\n".join([f"  {cat}: ${total:.2f}" for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)])

    # Build context-rich prompt based on report type
    if prompt is None:
        if report_type == "quick":
            prompt = """
Provide a quick 1-2 sentence summary of my spending, highlighting the top category and total amount.
"""
        elif report_type == "comprehensive":
            prompt = f"""
Analyze my expense data and provide:

1. **Overview**: Total spent and timeframe summary
2. **Category Breakdown**: List each category with totals, ranked by spending
3. **Spending Patterns**: Identify trends, frequent purchases, or notable expenses
4. **Insights**: 2-3 key observations about my spending habits
5. **Recommendations**: 1-2 actionable suggestions for better financial management

Context: {time_context}
Total Expenses: {len(entries)} transactions
"""
        elif report_type == "insights":
            prompt = f"""
Focus on providing actionable insights about my spending patterns:

1. What are my biggest spending categories and why might that be concerning or positive?
2. Are there any unusual or standout expenses I should be aware of?
3. What spending trends do you notice? (frequency, amounts, timing)
4. What are 2-3 specific, actionable recommendations for optimizing my spending?

Be specific and practical in your analysis.
"""
        elif report_type == "budget_analysis":
            avg_daily = total_spent / max(1, len(set(datetime.fromisoformat(e[3]).date() for e in entries if e[3])))
            prompt = f"""
Perform a budget-focused analysis:

1. **Daily Average**: ${avg_daily:.2f} per day
2. **Category Distribution**: What percentage of spending goes to each category?
3. **Essential vs Discretionary**: Categorize expenses as needs vs wants
4. **Budget Recommendations**: Suggest realistic spending limits for each category
5. **Savings Opportunities**: Identify specific areas where I could reduce spending

Focus on practical budgeting advice and specific dollar amounts.
"""

    # Build the full prompt with rich context
    full_prompt = f"""
You are a personal finance advisor analyzing expense data. Be specific, actionable, and insightful.

EXPENSE DATA:
{time_context}
Total Spent: ${total_spent:.2f}
Number of Transactions: {len(entries)}

CATEGORY TOTALS:
{category_breakdown}

DETAILED TRANSACTIONS:
{chr(10).join(formatted_entries[:20])}{'...(more transactions)' if len(formatted_entries) > 20 else ''}

ANALYSIS REQUEST:
{prompt}

Please format your response clearly with headers and bullet points where appropriate. Be concise but thorough.
"""
    
    try:
        response = query_llm(full_prompt)
        print(f"\n📊 EXPENSE REPORT - {report_type.upper()}")
        print("=" * 50)
        print(response)
        print("=" * 50)
    except Exception as e:
        print(f"Error generating summary: {e}")
        print(f"\nFallback Summary:")
        print(f"Total Spent: ${total_spent:.2f}")
        print(f"Categories:")
        for cat, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: ${total:.2f}")
