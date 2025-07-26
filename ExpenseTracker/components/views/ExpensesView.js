import React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import LoadingState from '../LoadingState';

const ExpensesView = ({
  isLoadingExpenses,
  categories,
  currentCategoryIndex,
  categoryScrollRef,
  handleCategoryHorizontalScroll,
  screenWidth,
  expenseCategorySelectorTranslateY,
  renderExpenseCategorySelector,
  renderExpenseCategories,
  styles
}) => {
  return (
    <>
      {/* Category Selector */}
      <Animated.View 
        style={[
          styles.expenseCategorySelector,
          {
            transform: [{ translateY: expenseCategorySelectorTranslateY }]
          }
        ]}
      >
        {renderExpenseCategorySelector()}
      </Animated.View>
      
      {/* Horizontal Category Pages */}
      {isLoadingExpenses ? (
        <LoadingState
          message="Loading expenses..."
          styles={styles}
        />
      ) : (
        <FlatList
          ref={categoryScrollRef}
          data={categories}
          renderItem={renderExpenseCategories}
          keyExtractor={(category) => category}
          horizontal
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={handleCategoryHorizontalScroll}
          onScrollBeginDrag={handleCategoryHorizontalScroll}
          onMomentumScrollEnd={handleCategoryHorizontalScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={false}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialScrollIndex={categories.length > 0 ? currentCategoryIndex : 0}
          style={{ flex: 1 }}
        />
      )}
    </>
  );
};

export default ExpensesView; 