import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

const ExpenseItem = ({ 
  item, 
  styles, 
  groceryItems, 
  onPress 
}) => {
  // Helper function to get SF Symbol for category
  const getCategoryIcon = (category) => {
    const iconMap = {
      'amazon': 'shippingbox.fill',
      'transportation': 'car.fill',
      'groceries': 'cart.fill',
      'entertainment': 'tv.fill',
      'fashion': 'tshirt.fill',
      'travel': 'airplane',
      'food': 'fork.knife',
      'monthly': 'calendar',
      'other': 'ellipsis.circle.fill'
    };
    return iconMap[category] || 'dollarsign.circle.fill';
  };

  return (
    <Pressable 
      style={styles.expenseItem}
      onPress={onPress}
    >
      {/* Expense Header */}
      <View style={styles.expenseHeader}>
        <View style={styles.category}>
          <SymbolView
            name={getCategoryIcon(item.category)}
            size={20}
            type="monochrome"
            tintColor="white"
            fallback={null}
          />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Expense Description and Amount Container */}
      <View style={styles.expenseContentContainer}>
        <Text style={styles.expenseTitle}>{item.description}</Text>
        <Text style={styles.amount}>${Number(item.amount).toFixed()}</Text>
      </View>
    </Pressable>

    
  );
};

export default ExpenseItem; 