import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { shiftHue, increaseBrightness } from '../utils/colorUtils';

// Color utilities are now imported from utils/colorUtils.js

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

const ExpenseCardMonthly = ({
  expenses,
  styles,
  currentTheme,
  getExpenseCategoryColor,
  calculateWeightedCategoryColor,
  getCategoryIcon
}) => {
  // DATA CALCULATIONS
  
  // Calculate total amount spent across all expenses
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Count total number of expense transactions
  const totalExpenses = expenses.length;
  
  // Group expenses by day to calculate average spending per day
  // This only counts days that actually have expenses (not all calendar days)
  const dayGroups = expenses.reduce((groups, expense) => {
    const date = new Date(expense.timestamp).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
  const averagePerDay = Object.keys(dayGroups).length > 0 ? totalAmount / Object.keys(dayGroups).length : 0;
  
  // Calculate dynamic background color based on weighted category colors
  const dynamicBackgroundColor = calculateWeightedCategoryColor();
  
  // Debug: Log the calculated color and top 3 categories
  console.log('🎨 Dynamic background color (top 3):', dynamicBackgroundColor);
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const top3Categories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  console.log('📊 Top 3 categories contributing to color:', top3Categories);
  
  // RENDER COMPONENT
  return (

    // Main container with padding and positioning
    <View style={styles.expenseCardMonthlyContainer}>
      
      {/* Single card container with linear gradient background */}
      <View style={[
        styles.cardBase, 
        styles.expenseCardMonthlyCard,
        { 
          borderWidth: 1,
          overflow: 'hidden',
          borderColor: (() => {
            const categoryTotals = expenses.reduce((acc, expense) => {
              acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
              return acc;
            }, {});
            
            const sortedCategories = Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a);
            
            if (sortedCategories.length > 0) {
              const [topCategory] = sortedCategories[0];
              return getExpenseCategoryColor(topCategory, currentTheme);
            } else {
              return currentTheme.appleBlue;
            }
          })()
        }
      ]}>
        <LinearGradient
          colors={(() => {
            const categoryTotals = expenses.reduce((acc, expense) => {
              acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
              return acc;
            }, {});
            
            const sortedCategories = Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 2);
            
            if (sortedCategories.length >= 2) {
              const [firstCategory] = sortedCategories[0];
              const [secondCategory] = sortedCategories[1];
              return [
                getExpenseCategoryColor(firstCategory, currentTheme) + 'E6', // 70% opacity
                getExpenseCategoryColor(secondCategory, currentTheme) + 'E6' // 70% opacity
              ];
            } else if (sortedCategories.length === 1) {
              const [firstCategory] = sortedCategories[0];
              const color = getExpenseCategoryColor(firstCategory, currentTheme);
              return [color + 'E6', color + 'E6']; // 90% opacity
            } else {
              return [currentTheme.appleBlue + 'E6', currentTheme.appleBlue + 'E6']; // 90% opacity
            }
          })()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        
        {/* HEADER SECTION - Inside card, top left */}
        <View style={styles.expenseCardMonthlyHeader}>
          {/* Main title of the card */}
          <Text style={styles.expenseCardMonthlyTitle}>
            {new Date().toLocaleString('en-US', { month: 'long' })} 
            {/* {new Date().toLocaleString('en-US', { year: '2-digit' })} */}
          </Text>
        </View>

        {/* FEATURE 1: Up/Down from last month - Top right corner */}
        <View style={styles.expenseCardMonthlyTrendContainer}>
          {(() => {
            // Calculate last month's total for comparison
            const currentDate = new Date();
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            
            const lastMonthExpenses = expenses.filter(expense => {
              const expenseDate = new Date(expense.timestamp);
              return expenseDate >= lastMonth && expenseDate <= lastMonthEnd;
            });
            
            const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const percentageChange = lastMonthTotal > 0 ? ((totalAmount - lastMonthTotal) / lastMonthTotal) * 100 : 0;
            
            if (lastMonthTotal > 0) {
              return (
                <>
                  <SymbolView
                    name={percentageChange > 0 ? "chevron.up.circle.fill" : "chevron.down.circle.fill"}
                    size={52}
                    type="monochrome"
                    tintColor={currentTheme.text}
                    fallback={null}
                    style={styles.expenseCardMonthlyTrendIcon}
                  />
                  <Text style={styles.expenseCardMonthlyTrendText}>
                    {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </Text>
                  {/* <Text style={styles.expenseCardMonthlyTrendLabel}>
                    vs last month
                  </Text> */}
                </>
              );
            }
            return null;
          })()}
        </View>

        {/* FEATURE 2: Top 3 categories - Bottom left corner */}
        <View style={styles.expenseCardMonthlyCategoriesContainer}>
          {(() => {
            const categoryTotals = expenses.reduce((acc, expense) => {
              acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
              return acc;
            }, {});
            
            const sortedCategories = Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3);
            
            if (sortedCategories.length > 0) {
              return (
                <>
                  <Text style={styles.expenseCardMonthlyCategoriesLabel}>Top 3</Text>
                  {sortedCategories.map(([category, amount], index) => (
                    <View key={category} style={styles.expenseCardMonthlyCategoryItem}>
                      <SymbolView
                        name={getCategoryIcon(category)}
                        size={20}
                        type="monochrome"
                        tintColor="white"
                        fallback={null}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.expenseCardMonthlyCategoryText}>
                        {category}
                      </Text>
                    </View>
                  ))}
                </>
              );
            }
            return null;
          })()}
        </View>
        
        {/* TOTAL AMOUNT - Bottom right */}
        <View style={styles.expenseCardMonthlyTotalContainer}>
          <Text style={styles.expenseCardMonthlyTotalSubtitle}>Total Spend</Text>
          <Text style={styles.expenseCardMonthlyTotalAmount}>
            ${Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export { ExpenseCardTotal, ExpenseCardCategory, ExpenseCardMonthly }; 