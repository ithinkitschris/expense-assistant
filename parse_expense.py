import requests
import json
import warnings
import re
from datetime import datetime, timedelta
from urllib3.exceptions import NotOpenSSLWarning
warnings.simplefilter("ignore", NotOpenSSLWarning)


def query_llm(prompt: str):
    res = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "gemma3n:e2b", "prompt": prompt, "stream": False}
    )
    return res.json()["response"]

def parse_relative_date(text: str):
    """Parse relative dates like 'last week', 'yesterday', '3 days ago'"""
    text = text.lower()
    now = datetime.now()
    
    if 'yesterday' in text:
        return (now - timedelta(days=1)).isoformat()
    elif 'last week' in text or 'a week ago' in text:
        return (now - timedelta(weeks=1)).isoformat()
    elif 'last month' in text or 'a month ago' in text:
        return (now - timedelta(days=30)).isoformat()
    elif 'days ago' in text:
        match = re.search(r'(\d+)\s+days?\s+ago', text)
        if match:
            days = int(match.group(1))
            return (now - timedelta(days=days)).isoformat()
    elif 'weeks ago' in text:
        match = re.search(r'(\d+)\s+weeks?\s+ago', text)
        if match:
            weeks = int(match.group(1))
            return (now - timedelta(weeks=weeks)).isoformat()
    
    return None

def parse_multiple_expenses(natural_input: str):
    """Parse multiple expenses from a single input like 'I spent $20 on groceries and $5 on coffee'"""
    parsed_date = parse_relative_date(natural_input)
    
    prompt = f"""
You are an expert expense parser. Parse this natural language description that may contain MULTIPLE expenses.

Input: "{natural_input}"

Instructions:
1. Identify ALL separate expenses mentioned in the input
2. For each expense, extract the EXACT dollar amount (no estimation)
3. Determine the most appropriate category from the input and sort into ONLY the following categories: amazon, uber, groceries, entertainment, fashion, travel, food, rent, insurance, subscriptions, other. DO NOT CREATE NEW CATEGORIES.
4. If a date/time reference is mentioned, it applies to all expenses

Return ONLY valid JSON array in this exact format:
[
    {{"amount": 20.00, "category": "groceries", "description": "groceries"}},
    {{"amount": 5.00, "category": "coffee", "description": "coffee"}}
]

If only ONE expense is found, still return an array with one item.

Examples:
        - "I spent $20 on groceries at trader joes last week" → {{"amount": 20.00, "category": "groceries", "description": "groceries at Trader Joe's"}}
        - "bought coffee for $4.50 this morning" → {{"amount": 4.50, "category": "food", "description": "coffee"}}
        - "$38 COS, T Shirt" → {{"amount": 38.00, "category": "fashion", "description": "COS, T Shirt"}}
        - "$235 KLM, Flight Ticket" → {{"amount": 235.00, "category": "travel", "description": "KLM, Flight Ticket"}}
        - "$8 Amazon, Method Body Soap" → {{"amount": 8.00, "category": "amazon", "description": "Method Body Soap"}}
        """
    
    response = query_llm(prompt)
    
    # Remove markdown code blocks if present
    if "```" in response:
        response = response.replace("```json", "").replace("```", "").strip()
    
    # Try to extract just the JSON part - find first [ and last ]
    start = response.find('[')
    end = response.rfind(']')
    if start != -1 and end != -1 and end > start:
        response = response[start:end+1]
    
    try:
        results = json.loads(response)
        if not isinstance(results, list):
            results = [results]  # Convert single object to list
        
        processed_results = []
        for result in results:
            # Validate and clean up each expense
            if not isinstance(result.get('amount'), (int, float)) or result['amount'] <= 0:
                continue  # Skip invalid expenses
            
            if not result.get('category'):
                result['category'] = 'other'
            
            if not result.get('description'):
                result['description'] = 'expense'
            
            if parsed_date:
                result['parsed_date'] = parsed_date
            
            processed_results.append(result)
        
        return processed_results if processed_results else None
        
    except Exception as e:
        print("⚠️ Failed to parse multiple expenses response:", response)
        print("⚠️ Error:", str(e))
        return None

def parse_expense(natural_input: str):
    # Check if the input might contain multiple expenses
    multiple_indicators = ['and', '&', 'also', 'plus', 'then']
    might_be_multiple = any(indicator in natural_input.lower() for indicator in multiple_indicators)
    
    # Also check for multiple dollar signs
    dollar_count = natural_input.count('$')
    
    if might_be_multiple or dollar_count > 1:
        print("🔍 Attempting to parse multiple expenses...")
        multiple_results = parse_multiple_expenses(natural_input)
        if multiple_results and len(multiple_results) > 1:
            return multiple_results  # Return list for multiple expenses
        elif multiple_results and len(multiple_results) == 1:
            return multiple_results[0]  # Return single object for one expense
    
    # Fallback to single expense parsing
    parsed_date = parse_relative_date(natural_input)
    
    prompt = f"""
        You are an expert expense parser. Parse this natural language expense description into structured data.

        Input: "{natural_input}"

        Instructions:
        1. Extract the EXACT dollar amount mentioned (no estimation)
        2. Determine the most appropriate category from the input and sort into ONLY the following categories: amazon, uber, groceries, entertainment, fashion, travel, food, rent, insurance, subscriptions, other. DO NOT CREATE NEW CATEGORIES.
        3. Create a clear, concise description including relevant details like store names, items, etc.
        4. If a date/time reference is mentioned (like "last week", "yesterday"), note it but don't include it in the description

        Return ONLY valid JSON in this exact format:
        {{"amount": 20.00, "category": "groceries", "description": "groceries at Trader Joe's"}}

        Examples:
        - "I spent $20 on groceries at trader joes last week" → {{"amount": 20.00, "category": "groceries", "description": "groceries at Trader Joe's"}}
        - "bought coffee for $4.50 this morning" → {{"amount": 4.50, "category": "food", "description": "coffee"}}
        - "$38 COS, T Shirt" → {{"amount": 38.00, "category": "fashion", "description": "COS, T Shirt"}}
        - "$235 KLM, Flight Ticket" → {{"amount": 235.00, "category": "travel", "description": "KLM, Flight Ticket"}}
        - "$8 Amazon, Method Body Soap" → {{"amount": 8.00, "category": "amazon", "description": "Method Body Soap"}}
        """
    
    response = query_llm(prompt)
    
    # Remove markdown code blocks if present
    if "```" in response:
        response = response.replace("```json", "").replace("```", "").strip()
    
    # Try to extract just the JSON part - find first { and last }
    start = response.find('{')
    end = response.rfind('}')
    if start != -1 and end != -1 and end > start:
        response = response[start:end+1]
    
    try:
        result = json.loads(response)
        print(f"🔍 Debug - Raw parsed result: {result}")
        
        # Validate required fields
        if not isinstance(result.get('amount'), (int, float)) or result['amount'] <= 0:
            # Fallback: try to extract amount from input
            amount_match = re.search(r'\$?(\d+(?:\.\d{1,2})?)', natural_input)
            if amount_match:
                result['amount'] = float(amount_match.group(1))
                print(f"🔍 Fallback extracted amount: {result['amount']}")
            else:
                print("⚠️ No valid amount found")
                return None
        
        # Ensure we have required fields
        if not result.get('category'):
            result['category'] = 'other'
        
        if not result.get('description'):
            result['description'] = natural_input[:50]  # Fallback to truncated input
        
        # Add parsed date if available
        if parsed_date:
            result['parsed_date'] = parsed_date
            print(f"🔍 Parsed relative date: {parsed_date}")
        
        return result
        
    except Exception as e:
        print("⚠️ Failed to parse response:", response)
        print("⚠️ Error:", str(e))
        
        # Ultimate fallback: try basic regex parsing
        amount_match = re.search(r'\$?(\d+(?:\.\d{1,2})?)', natural_input)
        if amount_match:
            return {
                'amount': float(amount_match.group(1)),
                'category': 'other',
                'description': natural_input[:50],
                'parsed_date': parsed_date
            }
        
        return None
