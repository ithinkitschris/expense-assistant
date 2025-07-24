import sqlite3
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from api.dependencies import get_db
from api.models.schemas import PantryItemResponse, SuccessResponse
from api.utils.grocery_categories import get_grocery_type_sort_order, GROCERY_TYPES
from api.utils.parsing import parse_grocery_items_and_categories, categorize_grocery_item_rule_based

pantry_router = APIRouter()

def get_pantry_item_by_id(item_id: int, db: sqlite3.Connection):
    """Get pantry item details by ID"""
    c = db.cursor()
    c.execute("SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?", (item_id,))
    item = c.fetchone()
    return item

@pantry_router.get("/pantry-items", response_model=List[PantryItemResponse])
async def get_all_pantry_items(db: sqlite3.Connection = Depends(get_db)):
    """
    Get all pantry items (standalone, not linked to expenses)
    """
    try:
        c = db.cursor()
        c.execute('''
            SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type
            FROM pantry_items
            ORDER BY created_at DESC, name
        ''')
        items = c.fetchall()
        
        # Convert to response objects and sort by grocery type
        pantry_items = []
        for item in items:
            grocery_type = item[6] if item[6] else categorize_grocery_item_rule_based(item[1])
            pantry_items.append(PantryItemResponse(**{
                "id": item[0],
                "name": item[1],
                "quantity": item[2],
                "unit": item[3],
                "created_at": item[4],
                "is_consumed": item[5],
                "grocery_type": grocery_type
            }))
        
        # Sort by grocery type sort order, then by name
        pantry_items.sort(key=lambda x: (get_grocery_type_sort_order(x.grocery_type), x.name.lower()))
        
        return pantry_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pantry items: {str(e)}")

@pantry_router.post("/pantry-items/add", response_model=PantryItemResponse)
async def add_pantry_item(request: dict, db: sqlite3.Connection = Depends(get_db)):
    """
    Add a pantry item directly
    """
    try:
        name = request.get('name', '').strip()
        quantity = request.get('quantity', 1)
        unit = request.get('unit', 'pieces')
        
        if not name:
            raise HTTPException(status_code=400, detail="Item name is required")
        
        # Validate quantity
        try:
            quantity = float(quantity)
            if quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be positive")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid quantity value")
        
        # Use unified parsing function for categorization
        try:
            parsed_items = parse_grocery_items_and_categories(name)
            if parsed_items and len(parsed_items) > 0:
                grocery_type = parsed_items[0]["category"]
            else:
                grocery_type = categorize_grocery_item_rule_based(name)  # Fallback to rule-based
        except Exception as parse_error:
            # If parsing fails, use rule-based categorization as fallback
            grocery_type = categorize_grocery_item_rule_based(name)
        
        c = db.cursor()
        try:
            # Check if an item with the same name already exists (case-insensitive)
            c.execute('SELECT id, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE LOWER(name) = LOWER(?)', (name,))
            existing_item = c.fetchone()
            
            if existing_item:
                # Item exists, update quantity and other fields
                item_id, existing_quantity, existing_unit, created_at, is_consumed, existing_grocery_type = existing_item
                new_quantity = existing_quantity + quantity
                
                # Update the existing item
                c.execute('''
                    UPDATE pantry_items 
                    SET quantity = ?, unit = ?, is_consumed = ?, grocery_type = ?
                    WHERE id = ?
                ''', (new_quantity, unit, False, grocery_type, item_id))
                
                db.commit()
                item_id = int(item_id)
            else:
                # Item doesn't exist, create new one
                c.execute('''
                    INSERT INTO pantry_items (name, quantity, unit, created_at, is_consumed, grocery_type)
                    VALUES (?, ?, ?, datetime('now'), ?, ?)
                ''', (name, quantity, unit, False, grocery_type))
                item_id = c.lastrowid
                # Fetch created_at from DB
                c.execute('SELECT created_at FROM pantry_items WHERE id = ?', (item_id,))
                row = c.fetchone()
                if row and row[0]:
                    created_at = row[0]
                else:
                    created_at = datetime.now().isoformat()
                db.commit()
                item_id = int(item_id) if item_id is not None else None
                if item_id is None:
                    raise HTTPException(status_code=500, detail="Failed to insert pantry item (no ID returned)")
        except sqlite3.Error as db_error:
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        # For existing items, we need to fetch the updated data to return correct quantity
        if existing_item:
            # Fetch the updated item data
            c.execute('SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?', (item_id,))
            updated_item = c.fetchone()
            if updated_item:
                _, _, updated_quantity, updated_unit, updated_created_at, updated_is_consumed, updated_grocery_type = updated_item
                return PantryItemResponse(
                    id=item_id,
                    name=name,
                    quantity=updated_quantity,
                    unit=updated_unit,
                    created_at=updated_created_at,
                    is_consumed=updated_is_consumed,
                    grocery_type=updated_grocery_type
                )
        
        return PantryItemResponse(
            id=item_id,
            name=name,
            quantity=quantity,
            unit=unit,
            created_at=created_at,
            is_consumed=False,
            grocery_type=grocery_type
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add pantry item: {str(e)}")

@pantry_router.put("/pantry-items/{item_id}", response_model=PantryItemResponse)
async def update_pantry_item(item_id: int, request: dict, db: sqlite3.Connection = Depends(get_db)):
    """
    Update a pantry item's name, quantity, and consumed status
    """
    try:
        name = request.get('name', '').strip()
        if not name:
            raise HTTPException(status_code=400, detail="Item name is required")
        
        quantity = request.get('quantity', 1)
        unit = request.get('unit', 'pieces')
        is_consumed = request.get('is_consumed', False)
        
        # Validate quantity
        try:
            quantity = float(quantity)
            if quantity < 0:
                raise HTTPException(status_code=400, detail="Quantity cannot be negative")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid quantity value")
        
        # Auto-set consumed status based on quantity
        if quantity == 0:
            is_consumed = True
        elif quantity > 0 and is_consumed:
            is_consumed = False
        
        # Check if item exists and get current grocery_type
        c = db.cursor()
        c.execute('SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?', (item_id,))
        item = c.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail=f"Pantry item with ID {item_id} not found")
        
        # Get grocery_type from request or preserve existing
        grocery_type = request.get('grocery_type', item[6] if item[6] else 'other')
        
        # Update the item (including grocery_type)
        c.execute('UPDATE pantry_items SET name = ?, quantity = ?, unit = ?, is_consumed = ?, grocery_type = ? WHERE id = ?', 
                 (name, quantity, unit, is_consumed, grocery_type, item_id))
        db.commit()
        
        # Fetch the updated item
        c.execute('SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?', (item_id,))
        updated_item = c.fetchone()
        
        return PantryItemResponse(
            id=updated_item[0],
            name=updated_item[1],
            quantity=updated_item[2],
            unit=updated_item[3],
            created_at=updated_item[4],
            is_consumed=updated_item[5],
            grocery_type=updated_item[6] if updated_item[6] else grocery_type
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update pantry item: {str(e)}")

@pantry_router.delete("/pantry-items/{item_id}", response_model=SuccessResponse)
async def delete_pantry_item(item_id: int, db: sqlite3.Connection = Depends(get_db)):
    try:
        c = db.cursor()
        c.execute('DELETE FROM pantry_items WHERE id = ?', (item_id,))
        db.commit()
        return SuccessResponse(message=f"Deleted pantry item {item_id}", data={"item_id": item_id})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete pantry item: {str(e)}")


@pantry_router.post("/parse-grocery-items")
async def parse_grocery_items_only(request: dict):
    """
    Parse grocery items from a description (single or multiple) and return a list of {item, category} dicts.
    Used for both expense and manual pantry entry.
    """
    try:
        description = request.get('description', '')
        if not description.strip():
            raise HTTPException(
                status_code=400,
                detail="Description is required"
            )
        parsed_items = parse_grocery_items_and_categories(description)
        return {"items": parsed_items, "description": description}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse grocery items: {str(e)}"
        )

@pantry_router.get("/grocery-categories", response_model=list)
async def get_grocery_categories():
    """
    Get the canonical list of grocery categories (keys and display names)
    """
    return [
        {"key": key, "label": value["display_name"]}
        for key, value in GROCERY_TYPES.items()
    ]
