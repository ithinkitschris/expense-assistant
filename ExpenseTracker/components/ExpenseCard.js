import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { shiftHue, increaseBrightness, darkenAndSaturate } from '../utils/colorUtils';
import { getLocalDateString } from '../utils/expenseUtils';
import { themes } from '../themes';

// Color utilities are now imported from utils/colorUtils.js

const ExpenseCardTotal = ({
  item,
  styles,
  onPress,
  onEdit,
  onDelete,
  getCategoryIcon,
  cardColor,
  currentTheme,
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
          (currentTheme?.statusBarStyle === 'dark' ? darkenAndSaturate(cardColor, 15, 0) : cardColor) + 'CC', // 15% darker in light mode only, 80% opacity
          shiftHue(currentTheme?.statusBarStyle === 'dark' ? darkenAndSaturate(cardColor, 20, 5) : cardColor, 15, 0.95) // 20% darker, 5% more saturated in light mode only, shifted hue, 95% opacity
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
  currentTheme,
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
      style={[
        styles.expenseCardCategory,
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
          (currentTheme?.statusBarStyle === 'dark' ? darkenAndSaturate(cardColor, 15, 0) : cardColor) + 'CC', // 15% darker in light mode only, 80% opacity
          shiftHue(currentTheme?.statusBarStyle === 'dark' ? darkenAndSaturate(cardColor, 20, 5) : cardColor, 15, 0.95) // 20% darker, 5% more saturated in light mode only, shifted hue, 95% opacity
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
          <Text style={[styles.date, styles.expenseCardCategoryDate, { color: '#FFFFFF' }]}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={[styles.expenseCardCategoryAmount, styles.expenseCardCategoryAmountFlex, { color: '#FFFFFF' }]}> 
            {Number.isInteger(item.amount) ? `$${item.amount}` : `$${Number(item.amount).toFixed(2).replace(/\.00$/, '')}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const ExpenseCardCategoryMonthGroup = ({
  monthData,
  styles,
  onEdit,
  onDelete,
  getCategoryIcon,
  getExpenseCategoryColor,
  currentTheme,
  ...rest
}) => {
  const { month, displayMonth, expenses, totalAmount } = monthData;
  
  return (
    <View style={styles.monthGroupContainer}>
      {/* Month Header */}
      <View style={styles.monthGroupHeader}>
        <Text style={styles.monthGroupTitle}>{displayMonth}</Text>
        <Text style={styles.monthGroupTotal}>Total: 
          ${Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')}
        </Text>
      </View>
      
      {/* Expenses for this month */}
      {expenses.map((expense) => (
        <ExpenseCardCategory
          key={expense.id}
          item={expense}
          styles={styles}
          onEdit={onEdit}
          onDelete={onDelete}
          getCategoryIcon={getCategoryIcon}
          cardColor={getExpenseCategoryColor(expense.category, currentTheme)}
          currentTheme={currentTheme}
        />
      ))}
    </View>
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
    const date = getLocalDateString(expense.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
  const averagePerDay = Object.keys(dayGroups).length > 0 ? totalAmount / Object.keys(dayGroups).length : 0;
  
  // Calculate dynamic background color based on weighted category colors
  const dynamicBackgroundColor = calculateWeightedCategoryColor();
  
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
  
  // Get top 3 categories
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  // Calculate gradient colors
  const getGradientColors = (brightness = 0) => {
    if (sortedCategories.length >= 2) {
      const [firstCategory] = sortedCategories[0];
      const [secondCategory] = sortedCategories[1];
      return [
        brightness > 0 ? increaseBrightness(getExpenseCategoryColor(firstCategory, currentTheme), brightness) : getExpenseCategoryColor(firstCategory, currentTheme),
        brightness > 0 ? increaseBrightness(getExpenseCategoryColor(secondCategory, currentTheme), brightness) : getExpenseCategoryColor(secondCategory, currentTheme)
      ];
    } else if (sortedCategories.length === 1) {
      const [firstCategory] = sortedCategories[0];
      const color = getExpenseCategoryColor(firstCategory, currentTheme);
      return [
        brightness > 0 ? increaseBrightness(color, brightness) : color,
        brightness > 0 ? increaseBrightness(color, brightness) : color
      ];
    } else {
      return [
        brightness > 0 ? increaseBrightness(currentTheme.appleBlue, brightness) : currentTheme.appleBlue,
        brightness > 0 ? increaseBrightness(currentTheme.appleBlue, brightness) : currentTheme.appleBlue
      ];
    }
  };

  // Individual insight square components
  const TotalSpendSquare = () => {
    const gradientColors = getGradientColors();
    
    // Calculate weekly spending data
    const getWeeklySpending = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Initialize weekly totals
      const weeklyTotals = [0, 0, 0, 0];
      
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.timestamp);
        
        // Only include expenses from current month
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
          const dayOfMonth = expenseDate.getDate();
          
          // Determine which week this expense belongs to
          if (dayOfMonth <= 7) {
            weeklyTotals[0] += expense.amount;
          } else if (dayOfMonth <= 14) {
            weeklyTotals[1] += expense.amount;
          } else if (dayOfMonth <= 21) {
            weeklyTotals[2] += expense.amount;
          } else {
            weeklyTotals[3] += expense.amount;
          }
        }
      });
      
      return weeklyTotals;
    };
    
    const weeklySpending = getWeeklySpending();
    const maxWeeklySpend = Math.max(...weeklySpending, 1); // Avoid division by zero
    
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyTotalSpendLabel]}>Total Spend</Text>
        <Text style={[styles.expenseCardMonthlyTotalSpendValue, { color: gradientColors[0] }]}>
          ${Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')}
        </Text>
        
        {/* Daily spending lines */}
        <View style={styles.expenseCardMonthlyWeeklyContainer}>
          {(() => {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            // Calculate daily spending
            const dailySpending = new Array(daysInMonth).fill(0);
            expenses.forEach(expense => {
              const expenseDate = new Date(expense.timestamp);
              if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                const dayOfMonth = expenseDate.getDate() - 1; // 0-indexed
                dailySpending[dayOfMonth] += expense.amount;
              }
            });
            
            const maxDailySpend = Math.max(...dailySpending, 1);
            const maxHeight = 60;
            const minHeight = 4;
            
            return dailySpending.map((dayTotal, index) => {
              const heightPercentage = dayTotal > 0 ? (dayTotal / maxDailySpend) : 0;
              const height = dayTotal > 0 ? Math.max(minHeight, heightPercentage * maxHeight) : minHeight;
              
              return (
                <View key={index} style={{ 
                  flex: 1, 
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: 70,
                  position: 'relative',
                }}>
                  <View 
                    style={[
                      styles.expenseCardMonthlyWeeklyRectangle,
                      { 
                        height: height,
                        backgroundColor: dayTotal > 0 ? gradientColors[0] : 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 0,
                        borderRadius: 2,
                        width: 1.5, // Use more width
                        minHeight: height, // Force the height
                        maxHeight: height, // Force the height
                      }
                    ]}
                  />
                  {/* Separator line on the left side of each day */}
                  {index < daysInMonth - 1 && (
                    <View 
                      style={{
                        position: 'absolute',
                        left: 0, // Position on the left side
                        top: 0,
                        bottom: index % 5 === 0 ? -15 : 0, // Extend down for every 5th day
                        width: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        zIndex: 0,
                      }}
                    />
                  )}
                  {/* Only show labels for every 5th day, positioned outside container */}
                  {(index % 5 === 0 && index > 0 && index < 30) || index === 0 ? (
                    <Text style={[styles.expenseCardMonthlyWeeklyLabel, { position: 'absolute', bottom: -15 }]}>
                      {(currentDate.getMonth() + 1) + '/' + (index + 1)}
                    </Text>
                  ) : null}
                </View>
              );
            });
          })()}
        </View>
      </View>
    );
  };

  const MainSquare = () => {
    const gradientColors = getGradientColors();
    const brighterColor = getGradientColors(50);
    return (
      <View style={[styles.expenseCardMonthlyInsightSquareDouble, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <SymbolView
          name="sparkles"
          size={38}
          type="monochrome"
          tintColor={gradientColors[0]}
          fallback={null}
          style={styles.expenseCardMonthlyMonthSummaryLabel}
        />
        <Text style={[styles.expenseCardMonthlySummaryText, { color: brighterColor[0] }]}>
          Track your total monthly spending here. This section will soon provide a clear summary of your expenses, explain how your total is calculated, and offer tips to help you understand your spending patterns. Use this area as a guide for future insights and budgeting advice.
        </Text>
      </View>
    );
  };

  const TransactionsSquare = () => {
    const gradientColors = getGradientColors();
    const lighterColor = getGradientColors(50);
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyTransactionsLabel, { color: lighterColor[0] }]}>Transactions</Text>
        <Text style={[styles.expenseCardMonthlyTransactionsValue, { color: gradientColors[0] }]}>{totalExpenses}</Text>
      </View>
    );
  };

  const AveragePerDaySquare = () => {
    const gradientColors = getGradientColors();
    const lighterColor = getGradientColors(50);
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyAveragePerDayLabel, { color: lighterColor[0] }]}>Avg/Day</Text>
        <Text style={[styles.expenseCardMonthlyAveragePerDayValue, { color: gradientColors[0] }]}>
          ${averagePerDay.toFixed(0)}
        </Text>
      </View>
    );
  };

  const TrendSquare = () => {
    const gradientColors = getGradientColors();
    const lighterColor = getGradientColors(50);
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyTrendLabel, { color: lighterColor[0] }]}>Since Last Month</Text>
        {lastMonthTotal > 0 ? (
          <View style={styles.expenseCardMonthlyTrendContainer}>
            <SymbolView
              name={percentageChange > 0 ? "chevron.up.circle.fill" : "chevron.down.circle.fill"}
              size={100}
              type="monochrome"
              tintColor={gradientColors[0]}
              fallback={null}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.expenseCardMonthlyTrendValue, { color: lighterColor[0] }]}>
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </Text>
          </View>
        ) : (
          <Text style={[styles.expenseCardMonthlyTrendValue, { color: lighterColor[0] }]}>N/A</Text>
        )}
      </View>
    );
  };

  const TopCategorySquare = () => {
    const gradientColors = getGradientColors();
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyTopCategoryLabel, { color: gradientColors[0] }]}>Top Category</Text>
        {sortedCategories.length > 0 ? (
          <View style={styles.expenseCardMonthlyTopCategoryContainer}>
            <SymbolView
              name={getCategoryIcon(sortedCategories[0][0])}
              size={20}
              type="monochrome"
              tintColor={gradientColors[0]}
              fallback={null}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.expenseCardMonthlyTopCategoryValue, { color: gradientColors[0] }]}>
              {sortedCategories[0][0]}
            </Text>
          </View>
        ) : (
          <Text style={[styles.expenseCardMonthlyTopCategoryValue, { color: gradientColors[0] }]}>N/A</Text>
        )}
      </View>
    );
  };

  const ActiveDaysSquare = () => {
    const gradientColors = getGradientColors();
    return (
      <View style={[styles.expenseCardMonthlyInsightSquare, { backgroundColor: currentTheme.itemCardBackground, borderColor: currentTheme.glassBorderColor, borderWidth: 1 }]}>
        <Text style={[styles.expenseCardMonthlyActiveDaysLabel, { color: gradientColors[0] }]}>Active Days</Text>
        <Text style={[styles.expenseCardMonthlyActiveDaysValue, { color: gradientColors[0] }]}>
          {Object.keys(dayGroups).length}
        </Text>
      </View>
    );
  };
  
  // RENDER COMPONENT
  return (
    <View style={styles.expenseCardMonthlyContainer}>
      {/* Row 1: Month Summary spans two columns */}
      <View style={styles.expenseCardMonthlyInsightsRow}>
        <MainSquare />
      </View>
      {/* Row 2: Total Spend and Transactions */}
      <View style={styles.expenseCardMonthlyInsightsRow}>
        <TotalSpendSquare />
        <TransactionsSquare />
      </View>
      {/* Row 3 */}
      <View style={styles.expenseCardMonthlyInsightsRow}>
        <AveragePerDaySquare />
        <TrendSquare />
      </View>
      {/* Row 4 */}
      <View style={styles.expenseCardMonthlyInsightsRow}>
        <TopCategorySquare />
        <ActiveDaysSquare />
      </View>
    </View>
  );
};

export { ExpenseCardTotal, ExpenseCardCategory, ExpenseCardMonthly, ExpenseCardCategoryMonthGroup }; 