import React from 'react';
import { View, FlatList, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import LoadingState from '../LoadingState';
import EmptyState from '../EmptyState';
import { PICKER_OPTIONS } from '../../config';

const GroceryView = ({
  isLoadingPantryItems,
  allPantryItems,
  groceryHeaderTranslateY,
  renderPantrySection,
  handleHeaderScroll,
  styles
}) => {
  if (isLoadingPantryItems) {
    return (
      <LoadingState
        message="Loading pantry items..."
        styles={styles}
      />
    );
  }

  // Split items into active and consumed
  const activeItems = allPantryItems.filter(item => item.quantity > 0 || !item.is_consumed);
  const consumedItems = allPantryItems.filter(item => item.quantity === 0 && item.is_consumed);

  // Group active items by name and get latest occurrence
  const groupedActiveItems = activeItems.reduce((acc, item) => {
    if (!acc[item.name] || new Date(item.created_at) > new Date(acc[item.name].created_at)) {
      acc[item.name] = item;
    }
    return acc;
  }, {});

  const uniqueActiveItems = Object.values(groupedActiveItems);

  // Group consumed items by name and get latest occurrence
  const groupedConsumedItems = consumedItems.reduce((acc, item) => {
    if (!acc[item.name] || new Date(item.created_at) > new Date(acc[item.name].created_at)) {
      acc[item.name] = item;
    }
    return acc;
  }, {});

  const uniqueConsumedItems = Object.values(groupedConsumedItems);

  // Get sort order for grocery types
  const getGroceryTypeSortOrder = (type) => {
    const sortOrders = {
      ...PICKER_OPTIONS.groceryTypeSortOrder,
      'consumed': 12
    };
    return sortOrders[type] || 10;
  };

  // Group active items by grocery type
  const activeItemsByType = uniqueActiveItems.reduce((acc, item) => {
    const type = item.grocery_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  // Sort items within each type by name
  Object.keys(activeItemsByType).forEach(type => {
    activeItemsByType[type].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  });

  // Create sections for active items by type and sort by type order
  const activeSections = Object.keys(activeItemsByType)
    .filter(type => activeItemsByType[type].length > 0)
    .map(type => ({
      type: 'active',
      groceryType: type,
      items: activeItemsByType[type]
    }))
    .sort((a, b) => getGroceryTypeSortOrder(a.groceryType) - getGroceryTypeSortOrder(b.groceryType));

  // Create consumed section if there are consumed items
  const consumedSection = uniqueConsumedItems.length > 0 ? [{
    type: 'consumed',
    groceryType: 'consumed',
    items: uniqueConsumedItems.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }] : [];

  const allSections = [...activeSections, ...consumedSection];

  return (
    <>
      {/* Floating Grocery Header */}
      <Animated.View 
        style={[
          styles.groceryHeader,
          {
            transform: [{ translateY: groceryHeaderTranslateY }]
          }
        ]}
      >
        <Text style={styles.groceryHeaderTitle}>Pantry</Text>
        <Text style={styles.groceryHeaderSubtitle}>
          {uniqueActiveItems.length} active, {uniqueConsumedItems.length} consumed
        </Text>
      </Animated.View>
      
      <FlatList
        data={allSections}
        renderItem={renderPantrySection}
        keyExtractor={(section) => `${section.type}-${section.groceryType}`}
        style={styles.groceryList}
        contentContainerStyle={styles.groceryListContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <EmptyState
            title="No grocery items yet"
            subtitle="Tap the + button to add items to your pantry!"
            icon="basket"
            styles={styles}
          />
        }
      />
    </>
  );
};

export default GroceryView; 