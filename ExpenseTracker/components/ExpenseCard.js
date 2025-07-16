import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const ExpenseCard = ({ 
  item, 
  styles, 
  onPress,
  onEdit,
  onDelete
}) => {
  // Helper function to get SF Symbol for category
  const getCategoryIcon = (category) => {
    const iconMap = {
      'amazon': 'shippingbox.fill',
      'transportation': 'tram.fill',
      'groceries': 'cart.fill',
      'entertainment': 'gamecontroller.fill',
      'fashion': 'tshirt.fill',
      'travel': 'airplane',
      'food': 'fork.knife',
      'monthly': 'calendar',
      'other': 'ellipsis.circle.fill'
    };
    return iconMap[category] || 'dollarsign.circle.fill';
  };

  const showActionSheet = () => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 && onEdit) {
            onEdit(item);
          } else if (buttonIndex === 2 && onDelete) {
            // Show confirmation dialog before deleting
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(item.id),
                },
              ]
            );
          }
        }
      );
    } else {
      // Fallback for Android - you could implement a custom modal here
      // or use a cross-platform library like react-native-action-sheet
      console.log('Action sheet not supported on Android');
    }
  };

  // Expense Card
  return (
    <Pressable 
      style={styles.expenseCard}
      onPress={onPress}
    >
      {/* Expense Header */}
      <View style={styles.expenseHeader}>

        {/* Category */}
        <View style={styles.category}>
          <SymbolView
            name={getCategoryIcon(item.category)}
            size={24}
            type="monochrome"
            tintColor={styles.categoryIconColor.color}
            fallback={null}
          />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={showActionSheet}
          activeOpacity={0.6}
        >
          <SymbolView
            name="ellipsis"
            size={14}
            type="monochrome"
            tintColor={styles.categoryIconColor.color}
            fallback={null}
          />
        </TouchableOpacity>
        
      </View>

      {/* Expense Description and Amount Container */}
      <View style={styles.expenseContentContainer}>
        <Text style={styles.expenseTitle}>{item.description}</Text>
        <Text style={styles.amount}>${Number(item.amount).toFixed()}</Text>
      </View>
    </Pressable>
  );
};

// Component for displaying date instead of category
const ExpenseCardWithDate = ({ 
  item, 
  styles, 
  onPress,
  onEdit,
  onDelete
}) => {
  const showActionSheet = () => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 && onEdit) {
            onEdit(item);
          } else if (buttonIndex === 2 && onDelete) {
            // Show confirmation dialog before deleting
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(item.id),
                },
              ]
            );
          }
        }
      );
    } else {
      // Fallback for Android - you could implement a custom modal here
      // or use a cross-platform library like react-native-action-sheet
      console.log('Action sheet not supported on Android');
    }
  };
  // Array of SF Symbol calendar icons for days 1-31
  const calendarIcons = [
    '1.calendar', '2.calendar', '3.calendar', '4.calendar', '5.calendar',
    '6.calendar', '7.calendar', '8.calendar', '9.calendar', '10.calendar',
    '11.calendar', '12.calendar', '13.calendar', '14.calendar', '15.calendar',
    '16.calendar', '17.calendar', '18.calendar', '19.calendar', '20.calendar',
    '21.calendar', '22.calendar', '23.calendar', '24.calendar', '25.calendar',
    '26.calendar', '27.calendar', '28.calendar', '29.calendar', '30.calendar',
    '31.calendar'
  ];

  // Get the day of the month from the expense timestamp
  const getDayOfMonth = (timestamp) => {
    const date = new Date(timestamp);
    return date.getDate(); // Returns 1-31
  };

  // Get the appropriate calendar icon for the day
  const getCalendarIcon = (timestamp) => {
    const day = getDayOfMonth(timestamp);
    // Array is 0-indexed, so subtract 1 from day
    return calendarIcons[day - 1] || 'calendar';
  };
  return (
    <Pressable
      style={styles.expenseCard}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onEdit && onEdit(item)}
    >
      {/* Header */}
      <View style={styles.expenseHeader}>
        
        {/* Date */}
        <View style={styles.category}>
          <SymbolView
            name={getCalendarIcon(item.timestamp)}
            size={18}
            type="monochrome"
            tintColor={styles.categoryIconColor.color}
            fallback={null}
          />
          <Text style={styles.date}>
          {new Date(item.timestamp).toLocaleDateString('en-US', { 
            month: 'long', 
            // day: 'numeric' 
          })}
        </Text>
        </View>

        

        {/* Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={showActionSheet}
          activeOpacity={0.6}
        >
          <SymbolView
            name="ellipsis"
            size={16}
            type="monochrome"
            tintColor={styles.categoryIconColor.color}
            fallback={null}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.expenseContentContainer}>
        <Text style={styles.expenseTitle}>
          {item.description}
        </Text>
        <Text style={styles.amount}>
          ${Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(2).replace(/\.00$/, '')}
        </Text>
      </View>

      {/* Grocery Items */}
      {item.category === 'groceries' && item.groceryItems && item.groceryItems.length > 0 && (
        <View style={styles.groceryItemsContainer}>
          <Text style={styles.groceryItemsHeader}>Items:</Text>
          <Text style={styles.groceryItems}>
            {item.groceryItems.map(groceryItem => groceryItem.name).join(', ')}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default ExpenseCard;
export { ExpenseCardWithDate }; 