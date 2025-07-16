import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const ExpenseItem = ({ 
  item, 
  styles, 
  groceryItems, 
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

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={showActionSheet}
          activeOpacity={0.6}
        >
          <SymbolView
            name="ellipsis"
            size={14}
            type="monochrome"
            tintColor="white"
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

export default ExpenseItem; 