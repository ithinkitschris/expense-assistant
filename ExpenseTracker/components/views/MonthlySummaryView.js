import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ExpenseCardMonthly } from '../ExpenseCard';

const MonthlySummaryView = ({
  monthGroups,
  styles,
  currentTheme,
  getExpenseCategoryColor,
  calculateWeightedCategoryColor,
  getCategoryIcon
}) => {
  if (!monthGroups || monthGroups.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={[styles.emptyStateText, { color: currentTheme.text }]}>
          No expenses found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.monthlySummaryContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.monthlySummaryContent}
    >
      {monthGroups.map((monthData, index) => (
        <View key={monthData.month} style={styles.monthlyCardContainer}>
          {/* Month Header */}
          <View style={styles.monthlyCardHeader}>
            <Text style={[styles.monthlyCardTitle, { color: currentTheme.text }]}>
              {monthData.displayMonth}
            </Text>
          </View>
          
          {/* Monthly Summary Card */}
          <ExpenseCardMonthly
            expenses={monthData.expenses}
            styles={styles}
            currentTheme={currentTheme}
            getExpenseCategoryColor={getExpenseCategoryColor}
            calculateWeightedCategoryColor={calculateWeightedCategoryColor}
            getCategoryIcon={getCategoryIcon}
          />
        </View>
      ))}
      
      {/* Bottom Spacer */}
      <View style={{ height: 150 }} />
    </ScrollView>
  );
};

export default MonthlySummaryView; 