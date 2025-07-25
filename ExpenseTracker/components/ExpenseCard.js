import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { shiftHue, increaseBrightness } from '../utils/colorUtils';

// Color utilities are now imported from utils/colorUtils.js

// ExpenseCardTotal Component - Completely independent
const ExpenseCardTotal = ({
  item,
  styles,
  onPress,
  onEdit,
  onDelete,
  getCategoryIcon,
  cardColor,
  ...rest
}) => {

  const showActionSheet = () => {
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
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
              ]
            );
          }
        }
      );
    } else {
      console.log('Action sheet not supported on Android');
    }
  };

  // Render 
  return (
    <Pressable
      style={[
        styles.expenseCardTotal, 
        { 
          padding: 0, 
          overflow: 'hidden',
          borderColor: increaseBrightness(cardColor, 5)
        }
      ]}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onEdit && onEdit(item)}
    >
      <LinearGradient
        colors={[
          cardColor + 'CC', // 80% opacity
          shiftHue(cardColor, 15, 0.95) // 80% opacity for the second hue
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 2 }}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }
        ]}
      />
      {/* Header with category and menu button */}
      <View style={styles.expenseHeaderTotal}>
        <View style={styles.category}>
          <SymbolView
            name={getCategoryIcon(item.category)}
            size={18}
            type="monochrome"
            tintColor="#FFFFFF"
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
      <View style={styles.expenseContentContainerTotal}>
        <Text style={styles.expenseCardTotalTitle}>{item.description}</Text>
        <Text style={styles.expenseCardTotalAmount}>
          {Number.isInteger(item.amount) ? `$${item.amount}` : `$${Number(item.amount).toFixed(2).replace(/\.00$/, '')}`}
        </Text>
      </View>
    </Pressable>
  );
};

// ExpenseCardCategory Component - Completely independent
const ExpenseCardCategory = ({
  item,
  styles,
  onPress,
  onEdit,
  onDelete,
  getCategoryIcon,
  cardColor,
  ...rest
}) => {

  const showActionSheet = () => {
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
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
              ]
            );
          }
        }
      );
    } else {
      console.log('Action sheet not supported on Android');
    }
  };

  // Helper to get color for the icon
  const iconColor = cardColor || (styles.expenseCardCategoryAmount && styles.expenseCardCategoryAmount.color) || '#000';

  return (
    <Pressable
      style={styles.expenseCardCategory}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onEdit && onEdit(item)}
    >
      {/* Main content container with icon, title on left, date + amount on right */}
      <View style={styles.expenseContentContainerCategory}>
        {/* Icon and Title Row */}
        <View style={styles.expenseCardCategoryLeft}>
          {/* <SymbolView
            name={getCategoryIcon(item.category)}
            size={28}
            type="monochrome"
            tintColor={iconColor}
            fallback={null}
            style={{ alignSelf: 'flex-start' }}
          /> */}
          <View style={styles.expenseCardCategoryTitleContainer}>
            <Text style={[styles.expenseCardCategoryName]}>{item.category}</Text>
            <Text style={[styles.expenseCardCategoryTitle, styles.expenseCardCategoryTitleFlex]}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.expenseCardCategoryRightContainer}>
          <Text style={[styles.date, styles.expenseCardCategoryDate]}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={[styles.expenseCardCategoryAmount, styles.expenseCardCategoryAmountFlex, { color: cardColor || styles.expenseCardCategoryAmount.color }]}> 
            {Number.isInteger(item.amount) ? `$${item.amount}` : `$${Number(item.amount).toFixed(2).replace(/\.00$/, '')}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export { ExpenseCardTotal, ExpenseCardCategory }; 