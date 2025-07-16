import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Animated, useColorScheme, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { expenseAPI } from './services/api';
import { createStyles, themes } from './styles';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from './components/WheelAmountPicker';
import ExpenseItem from './components/ExpenseItem';

export default function App() {
  // #region STATE & SETUP
  
  // Development Flags
  const ENABLE_SCROLL_ANIMATIONS = true;
  
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [groceryItems, setGroceryItems] = useState({});
  
  // Tab state
  const [activeTab, setActiveTab] = useState('finance'); // 'finance' or 'grocery'
  const [allGroceryItems, setAllGroceryItems] = useState([]);
  const [isLoadingGroceryItems, setIsLoadingGroceryItems] = useState(false);
  
  // Add expense modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addAmount, setAddAmount] = useState('0');
  const [addCategory, setAddCategory] = useState('');
  const [addDescription, setAddDescription] = useState('');
  
  // Grocery flow state
  const [isGroceryStep, setIsGroceryStep] = useState(1); // 1: input, 2: confirmation
  const [parsedGroceryItems, setParsedGroceryItems] = useState([]);
  const [isParsingGroceries, setIsParsingGroceries] = useState(false);
  const [existingGroceryItems, setExistingGroceryItems] = useState([]);
  
  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Calendar state
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const flatListRef = useRef(null);
  const calendarScrollRef = useRef(null);
  
  // Category navigation with horizontal scroll
  const categoryScrollRef = useRef(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  // System theme detection
  const systemColorScheme = useColorScheme();
  
  // Handle null/undefined cases and provide fallback
  const isDarkMode = systemColorScheme === 'dark';



  // Update selected category when index changes
  useEffect(() => {
    if (categories[currentCategoryIndex]) {
      setSelectedCategory(categories[currentCategoryIndex]);
    }
  }, [currentCategoryIndex, categories]);

  // Update index when category changes (from category selector taps)
  useEffect(() => {
    const newIndex = categories.indexOf(selectedCategory);
    if (newIndex !== -1 && newIndex !== currentCategoryIndex) {
      setCurrentCategoryIndex(newIndex);
      if (categoryScrollRef.current) {
        // Clear any existing timeout
        if (programmaticScrollTimeout.current) {
          clearTimeout(programmaticScrollTimeout.current);
        }
        
        isProgrammaticScroll.current = true;
        categoryScrollRef.current.scrollToIndex({ 
          index: newIndex, 
          animated: true 
        });
        // Clear the flag after animation completes
        programmaticScrollTimeout.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
          programmaticScrollTimeout.current = null;
        }, 400);
      }
    }
  }, [selectedCategory, categories]);

  // Header animation
  const expenseCategorySelectorTranslateY = useRef(new Animated.Value(0)).current;
  const viewSelectorTranslateY = useRef(new Animated.Value(0)).current;
  const fixedDayHeaderTranslateY = useRef(new Animated.Value(0)).current;
  const bottomGradientOpacity = useRef(new Animated.Value(1)).current;
  const bottomGradientTranslateY = useRef(new Animated.Value(0)).current;
  const dayTitleFontSize = useRef(new Animated.Value(32)).current; // Initial font size
  const lastScrollY = useRef(0);
  const lastScrollX = useRef(0);
  const isHeaderVisible = useRef(true);

  // Get current theme
  const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(currentTheme);
  // #endregion

  // #region DATA PROCESSING

  // Calculate totals by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Get unique categories
  const categories = ['All', ...Object.keys(categoryTotals).sort()];

  // Calculate total expenses
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by day
  const groupExpensesByDay = (expenses) => {
    const grouped = {};
    
    expenses.forEach(expense => {
      // Use the timestamp field from the API response
      const date = new Date(expense.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          displayDate: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          shortDate: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          expenses: []
        };
      }
      
      grouped[dateKey].expenses.push(expense);
    });
    
    // Convert to array and sort by date (most recent first)
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get current display amount based on selection
  const getDisplayAmount = () => {
    if (selectedCategory === 'All') {
      return totalAmount;
    }
    return categoryTotals[selectedCategory] || 0;
  };

  // Single filtering function that handles both cases
  const getFilteredExpenses = (category = selectedCategory) => {
    if (category === 'All') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === category);
  };

  // Single day grouping function that handles both cases  
  const getFilteredExpensesByDay = (category = selectedCategory) => {
    const filteredExpenses = getFilteredExpenses(category);
    return groupExpensesByDay(filteredExpenses);
  };
  // #endregion

  // #region CALENDAR LOGIC

  // Calendar helper functions
  const getWeekDays = (startDate) => {
    const days = [];
    const start = new Date(startDate);
    
    // Get the Monday of the current week
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday is first day
    start.setDate(diff);
    
    // Set time to noon to avoid timezone issues
    start.setHours(12, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getExpenseCountForDay = (date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayGroups = getFilteredExpensesByDay();
    const dayData = dayGroups.find(group => group.date === dateStr);
    return dayData ? dayData.expenses.length : 0;
  };

  const navigateToDay = (date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayGroups = getFilteredExpensesByDay();
    const dayIndex = dayGroups.findIndex(group => group.date === dateStr);
    
    if (dayIndex >= 0 && flatListRef.current) {
      setSelectedDay(dateStr);
      flatListRef.current.scrollToIndex({ index: dayIndex, animated: true });
    }
  };

  const updateCalendarFromFlatList = (index) => {
    const dayGroups = getFilteredExpensesByDay();
    if (dayGroups[index]) {
      const newSelectedDay = dayGroups[index].date;
      setSelectedDay(newSelectedDay);
      
      // Update current week if the selected day is outside current week
      const selectedDate = new Date(newSelectedDay + 'T12:00:00'); // Set to noon to avoid timezone issues
      const weekDays = getWeekDays(currentWeek);
      const isInCurrentWeek = weekDays.some(day => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dayNum = String(day.getDate()).padStart(2, '0');
        const dayStr = `${year}-${month}-${dayNum}`;
        return dayStr === newSelectedDay;
      });
      
      if (!isInCurrentWeek) {
        setCurrentWeek(selectedDate);
      }
    }
  };
  // #endregion

  // #region API OPERATIONS

  // Load expenses when app starts
  useEffect(() => {
    loadExpenses();
  }, []);

  // Load all grocery items when switching to grocery tab
  useEffect(() => {
    if (activeTab === 'grocery') {
      loadAllGroceryItems();
    }
  }, [activeTab]);

  // Initialize selected day when expenses load
  useEffect(() => {
    if (expenses.length > 0) {
      const dayGroups = getFilteredExpensesByDay();
      if (dayGroups.length > 0) {
        // Set the most recent day as selected initially
        const mostRecentDay = dayGroups[0].date;
        setSelectedDay(mostRecentDay);
        setCurrentWeek(new Date(mostRecentDay));
      }
    }
  }, [expenses]);

  // Load all grocery items from API
  const loadAllGroceryItems = async () => {
    try {
      setIsLoadingGroceryItems(true);
      const response = await expenseAPI.getAllGroceryItems();
      setAllGroceryItems(response.items || []);
    } catch (error) {
      console.log('Failed to load all grocery items:', error);
      Alert.alert('Error', 'Failed to load grocery items');
    } finally {
      setIsLoadingGroceryItems(false);
    }
  };

  // Load grocery items for grocery expenses
  const loadGroceryItems = async () => {
    try {
      const groceryExpenses = expenses.filter(expense => expense.category === 'groceries');
      const itemsMap = {};
      
      for (const expense of groceryExpenses) {
        try {
          const response = await expenseAPI.getGroceryItemsForExpense(expense.id);
          if (response.items && response.items.length > 0) {
            itemsMap[expense.id] = response.items;
          }
        } catch (error) {
          console.log(`Failed to load grocery items for expense ${expense.id}:`, error);
        }
      }
      
      setGroceryItems(itemsMap);
    } catch (error) {
      console.log('Failed to load grocery items:', error);
    }
  };

  // Load grocery items when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      loadGroceryItems();
    }
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      setIsLoadingExpenses(true);
      const data = await expenseAPI.getExpenses();
      setExpenses(data.expenses || []);
    } catch (error) {
      Alert.alert('Error', `Failed to load expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleGroceryNext = async () => {
    // Validate form fields for grocery flow
    if (!addAmount || addAmount === '0' || !addDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields and enter an amount greater than $0');
      return;
    }

    try {
      setIsParsingGroceries(true);
      
      // Parse grocery items using the API service
      const data = await expenseAPI.parseGroceryItemsFromDescription(addDescription);
      setParsedGroceryItems(data.items || []);
      
      // Load existing grocery items for context
      await loadExistingGroceryItems();
      
      setIsGroceryStep(2);
      
    } catch (error) {
      Alert.alert('Error', `Failed to parse grocery items: ${error.message}`);
    } finally {
      setIsParsingGroceries(false);
    }
  };

  const loadExistingGroceryItems = async () => {
    try {
      const response = await expenseAPI.getAllGroceryItems();
      // Get unique item names and sort them
      const uniqueItems = [...new Set(response.items.map(item => item.name))];
      setExistingGroceryItems(uniqueItems.sort());
    } catch (error) {
      console.log('Failed to load existing grocery items:', error);
      setExistingGroceryItems([]);
    }
  };

  const confirmGroceryList = async () => {
    try {
      setIsLoading(true);
      
      // Create the expense
      const amount = parseInt(addAmount);
      const response = await expenseAPI.addExpenseStructured(amount, 'groceries', addDescription);
      
      // Parse and save the grocery items
      if (response.id) {
        await expenseAPI.parseGroceryItems(response.id);
      }
      
      // Close modal and clear form
      setIsAddModalVisible(false);
      setIsGroceryStep(1);
      setParsedGroceryItems([]);
      setExistingGroceryItems([]);
      setAddAmount('0');
      setAddCategory('');
      setAddDescription('');
      
      // Reload expenses to show the new one
      await loadExpenses();
      
      // Show success alert
      Alert.alert('Success', 'Grocery expense added successfully!');
      
    } catch (error) {
      Alert.alert('Error', `Failed to add grocery expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async () => {
    // Validate form fields
    if (!addAmount || addAmount === '0' || !addCategory.trim() || !addDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields and enter an amount greater than $0');
      return;
    }

    // Convert to number for API
    const amount = parseInt(addAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      const response = await expenseAPI.addExpenseStructured(amount, addCategory, addDescription);
      
      // If this is a grocery expense, parse the items
      if (addCategory === 'groceries' && response.id) {
        try {
          await expenseAPI.parseGroceryItems(response.id);
        } catch (parseError) {
          console.log('Failed to parse grocery items:', parseError);
          // Don't show error to user, just log it
        }
      }
      
      // Close modal and clear form
      setIsAddModalVisible(false);
      setAddAmount('0');
      setAddCategory('');
      setAddDescription('');
      
      // Reload expenses to show the new one
      await loadExpenses();
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to add expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async () => {
    if (!editingExpense || !editAmount.trim() || !editDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate amount is a positive number
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData = {
        amount: amount,
        category: editCategory,
        description: editDescription.trim()
      };

      await expenseAPI.updateExpense(editingExpense.id, updateData);
      
      // Close modal and clear edit state
      setIsEditModalVisible(false);
      setEditingExpense(null);
      setEditAmount('');
      setEditCategory('');
      setEditDescription('');
      
      // Reload expenses to show the updated one
      await loadExpenses();
      
      Alert.alert('Success', 'Expense updated successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to update expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      setIsLoading(true);
      await expenseAPI.deleteExpense(expenseId);
      
      // Reload expenses to show the updated list
      await loadExpenses();
    } catch (error) {
      Alert.alert('Error', `Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  // #endregion

  // #region EVENT HANDLERS

  const handleHeaderScroll = (event) => {
    // Skip animations if disabled for development
    if (!ENABLE_SCROLL_ANIMATIONS) {
      console.log('Scroll animations disabled for development');
      return;
    }
    
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollingDown = currentScrollY > lastScrollY.current;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollingDown && scrollDifference > 10 && isHeaderVisible.current) {
      // Hide header, expense category selector, and bottom gradient
      isHeaderVisible.current = false;
      Animated.parallel([
        Animated.timing(expenseCategorySelectorTranslateY, {
          toValue: -150,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fixedDayHeaderTranslateY, {
          toValue: -60,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(viewSelectorTranslateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomGradientTranslateY, {
          toValue: 200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dayTitleFontSize, {
          toValue: 46, // Maximum font size when scrolled
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    } else if (!scrollingDown && !isHeaderVisible.current && scrollDifference > 8) {
      // Show header, expense category selector, and bottom gradient only after scrolling up by 100px
      isHeaderVisible.current = true;
      Animated.parallel([
        Animated.timing(expenseCategorySelectorTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fixedDayHeaderTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(viewSelectorTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomGradientTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dayTitleFontSize, {
          toValue: 24, // Minimum font size (initial)
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    }
    
    lastScrollY.current = currentScrollY;
  };

  const handleCategoryPress = (category) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setSelectedCategory(category);
  };

  const handleExpensePress = (expense) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Set the expense being edited
    setEditingExpense(expense);
    
    // Populate the form fields with current expense data
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDescription(expense.description);
    
    // Show the edit modal
    setIsEditModalVisible(true);
  };

  const handleCategoryScroll = (event) => {
    const currentScrollX = event.nativeEvent.contentOffset.x;
    const scrollDifference = Math.abs(currentScrollX - (lastScrollX.current || 0));
    
    // Trigger haptic feedback when scrolling more than 50px horizontally
    if (scrollDifference > 30) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastScrollX.current = currentScrollX;
    }
  };

  // Handle horizontal category scroll
  const handleCategoryHorizontalScroll = (event) => {
    // Ignore scroll events when programmatically scrolling
    if (isProgrammaticScroll.current) {
      return;
    }
    
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.x;
    const pageWidth = layoutMeasurement.width;
    
    // Use Math.round for consistent behavior in both directions
    const currentIndex = Math.round(scrollPosition / pageWidth);
    
    console.log('Scroll event:', {
      contentOffset: scrollPosition,
      layoutMeasurement: pageWidth,
      calculatedIndex: currentIndex,
      currentCategoryIndex,
      categories: categories.length
    });
    
    if (currentIndex !== currentCategoryIndex && currentIndex >= 0 && currentIndex < categories.length) {
      console.log('Updating category index from', currentCategoryIndex, 'to', currentIndex);
      setCurrentCategoryIndex(currentIndex);
    }
  };
  // #endregion

  // #region RENDER FUNCTIONS

  // Split complex render function into focused components
  const renderExpensesList = (category) => {
    const filteredExpenses = getFilteredExpenses(category);
    
    return (
      <FlatList
        data={filteredExpenses}
        renderItem={({ item: expense }) => (
          <ExpenseItem
            item={expense}
            styles={styles}
            groceryItems={groceryItems}
            onEdit={handleExpensePress}
            onDelete={deleteExpense}
          />
        )}
        keyExtractor={(expense) => `${category}-${expense.id}`}
        style={[styles.categoryExpensesList, { marginTop: -20 }]}
        contentContainerStyle={styles.categoryExpensesContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      />
    );
  };

  const renderFixedDayHeader = () => {
    const dayGroups = getFilteredExpensesByDay();
    const currentDayIndex = dayGroups.findIndex(group => group.date === selectedDay);
    const currentDayData = dayGroups[currentDayIndex];
    
    if (!currentDayData) return null;
    
    // Fix timezone issue by appending time to ensure local date interpretation
    const dateObj = new Date(currentDayData.date + 'T12:00:00');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[dateObj.getMonth()];
    const dayNum = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Add ordinal suffix (st, nd, rd, th)
    const ordinal = (() => {
      if (dayNum > 3 && dayNum < 21) return 'th';
      switch (dayNum % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    })();
    
    const total = currentDayData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return (
      <Animated.View 
        style={[
          styles.dayHeader,
          {
            transform: [{ translateY: fixedDayHeaderTranslateY }]
          }
        ]}
      >
        <View style={styles.dayHeaderContent}>
                  <Animated.Text style={[
          styles.dayTitle,
          {
            fontSize: dayTitleFontSize
          }
        ]}>
          {`${weekday}, ${monthName} ${dayNum}${ordinal}`}
        </Animated.Text>
          <Text style={styles.daySubtitle}>
            Total spend: ${Number.isInteger(total) ? total : total.toFixed(2).replace(/\.00$/, '')}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderSingleDay = ({ item: dayData }) => {
    const { height } = Dimensions.get('window');
    
    return (
      <View style={[styles.dayContainer, { height }]}>
        {/* Expenses List */}
        <FlatList
          data={dayData.expenses}
          renderItem={({ item: expense }) => (
            <ExpenseItem
              item={expense}
              styles={styles}
              groceryItems={groceryItems}
              onEdit={handleExpensePress}
              onDelete={deleteExpense}
            />
          )}
          keyExtractor={(expense) => expense.id}
          style={styles.dayExpensesList}
          contentContainerStyle={styles.dayExpensesContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        />
      </View>
    );
  };

  const renderDayPager = (category) => {
    const { height } = Dimensions.get('window');
    const dayGroups = getFilteredExpensesByDay(category);
    
    const handleDayPagerScroll = (event) => {
      // Handle header scroll animations only for 'All' category
      if (category === 'All') {
        handleHeaderScroll(event);
      }
      
      // Update day header in real-time during scroll
      const index = Math.round(event.nativeEvent.contentOffset.y / height);
      if (dayGroups[index]) {
        setSelectedDay(dayGroups[index].date);
      }
    };
    
    return (
      <FlatList
        data={dayGroups}
        renderItem={renderSingleDay}
        keyExtractor={(item) => `${category}-${item.date}`}
        style={styles.daysList}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleDayPagerScroll}
        scrollEventThrottle={16}
        bounces={false}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / height);
          updateCalendarFromFlatList(index);
        }}
      />
    );
  };

  // Main function that determines the appropriate view layout for a category
  const renderCategoryView = (category, containerStyle = {}) => {
    const { height } = Dimensions.get('window');
    const filteredExpenses = getFilteredExpenses(category);
    
    if (filteredExpenses.length === 0) {
      return (
        <View style={[styles.emptyContainer, { height }, containerStyle]}>
          <Text style={styles.emptyText}>No expenses in {category} category yet!</Text>
        </View>
      );
    }

    // Use day pager for "All" category, simple list for specific categories
    return category === 'All' 
      ? renderDayPager(category)
      : renderExpensesList(category);
  };

  // Render a full-screen page for each category
  const renderCategoryPage = ({ item: category }) => {
    const { height } = Dimensions.get('window');
    
    return (
      <View style={{ width: screenWidth, height }}>
        {renderCategoryView(category)}
      </View>
    );
  };

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>

      {/* Finance Tab */}
      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'finance' && styles.tabButtonActive
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveTab('finance');
        }}
      >
        <Text style={[
          styles.tabButtonText,
          activeTab === 'finance' && styles.tabButtonTextActive
        ]}>
          Finance
        </Text>
      </Pressable>
      
      {/* Grocery Tab */}
      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'grocery' && styles.tabButtonActive
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveTab('grocery');
        }}
      >
        <Text style={[
          styles.tabButtonText,
          activeTab === 'grocery' && styles.tabButtonTextActive
        ]}>
          Grocery List
        </Text>
      </Pressable>
    </View>
  );

  const renderGroceryItem = ({ item }) => (
    <View style={styles.groceryListItem}>
      <Text style={styles.groceryListItemName}>{item.name}</Text>
      <Text style={styles.groceryListItemDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderCalendar = () => {
    const weekDays = getWeekDays(currentWeek);
    // Use local date for today to avoid timezone issues
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return (
      <View style={styles.calendarContainer}>
        <ScrollView
          ref={calendarScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScrollView}
          contentContainerStyle={styles.calendarContent}
          pagingEnabled={false}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            // Handle week navigation when scrolling
            const scrollX = event.nativeEvent.contentOffset.x;
            const containerWidth = event.nativeEvent.layoutMeasurement.width;
            const weekOffset = Math.round(scrollX / containerWidth);
            
            if (weekOffset !== 0) {
              const newWeek = new Date(currentWeek);
              newWeek.setDate(newWeek.getDate() + (weekOffset * 7));
              setCurrentWeek(newWeek);
            }
          }}
        >
            {weekDays.map((day, index) => {
              // Use local date string to avoid timezone issues
              const year = day.getFullYear();
              const month = String(day.getMonth() + 1).padStart(2, '0');
              const dayNum = String(day.getDate()).padStart(2, '0');
              const dayStr = `${year}-${month}-${dayNum}`;
              
              const isSelected = dayStr === selectedDay;
              const isToday = dayStr === todayStr;
              const expenseCount = getExpenseCountForDay(day);
              
              return (
                <Pressable
                  key={dayStr}
                  style={[
                    styles.calendarDay,
                    isToday && styles.calendarToday,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigateToDay(day);
                  }}
                >
                  <Text style={styles.calendarDayText}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.calendarDayNumber}>
                    {day.getDate()}
                  </Text>
                  {isSelected && <View style={styles.calendarDot} />}
                </Pressable>
              );
            })}
          </ScrollView>
      </View>
    );
  };

  const renderGroceryView = () => {
    if (isLoadingGroceryItems) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading grocery items...</Text>
        </View>
      );
    }

    // Group items by name and get latest occurrence
    const groupedItems = allGroceryItems.reduce((acc, item) => {
      if (!acc[item.name] || new Date(item.created_at) > new Date(acc[item.name].created_at)) {
        acc[item.name] = item;
      }
      return acc;
    }, {});

    const uniqueItems = Object.values(groupedItems).sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    return (
      <FlatList
        data={uniqueItems}
        renderItem={renderGroceryItem}
        keyExtractor={(item) => `${item.name}-${item.created_at}`}
        style={styles.groceryList}
        contentContainerStyle={styles.groceryListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No grocery items yet. Add some expenses with groceries!</Text>
        }
      />
    );
  };

  const renderExpensesView = () => {
    const { height } = Dimensions.get('window');
    const dayGroups = getFilteredExpensesByDay();
    
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
        
        {/* Calendar View */}
        {/* {renderCalendar()} */}

        {/* Horizontal Category Pages */}
        {isLoadingExpenses ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        ) : (
          <FlatList
            ref={categoryScrollRef}
            data={categories}
            renderItem={renderCategoryPage}
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

        {/* Add Expense Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsAddModalVisible(true);
            }}
          >
            <BlurView intensity={25} tint={'light'} style={styles.blurContainer}>    
              <SymbolView
                name="plus"
                size={28}
                type="monochrome"
                tintColor={currentTheme.text}
                fallback={<Text style={styles.addButtonText}>+</Text>}
              />
            </BlurView>
          </Pressable>
        </View>
      </>
    );
  };

  const renderViewSelector = () => (
    <View style={styles.viewSelectorWrapper}>
      {/* Background Container with ScrollView inside */}
      <BlurView
        intensity={30}
        tint={currentTheme.blurTint}
        style={styles.viewSelectorBackground}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.viewSelectorScrollView}
          contentContainerStyle={styles.viewSelectorContainer}
          onScroll={handleCategoryScroll}
          scrollEventThrottle={16}
        >
          {/* Expenses Option */}
          <Pressable
            style={styles.viewOptionContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('finance');
            }}
          >
            <BlurView 
              intensity={activeTab === 'finance' ? 50 : 0} 
              tint={currentTheme.blurTint} 
              style={[
                styles.viewOption,
                activeTab === 'finance' && styles.viewOptionSelected
              ]}
            >
              <SymbolView
                name="creditcard.fill"
                size={34}
                type="monochrome"
                tintColor={activeTab === 'finance' ? currentTheme.categorySelectedText : currentTheme.text}
                fallback={null}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[
                  styles.viewOptionText,
                  activeTab === 'finance' && styles.viewOptionTextSelected
                ]}>
                  Expenses
                </Text>
                {/* <Text style={[
                  styles.viewOptionAmount,
                  activeTab === 'finance' && styles.viewOptionAmountSelected
                ]}>
                  {' '}${Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')}
                </Text> */}
              </View>
            </BlurView>
          </Pressable>

          {/* Pantry Option */}
          <Pressable
            style={styles.viewOptionContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('grocery');
            }}
          >
            <BlurView 
              intensity={activeTab === 'grocery' ? 50 : 0} 
              tint={currentTheme.blurTint} 
              style={[
                styles.viewOption,
                activeTab === 'grocery' && styles.viewOptionSelected
              ]}
            >
              <SymbolView
                name="basket.fill"
                size={34}
                type="monochrome"
                tintColor={activeTab === 'grocery' ? currentTheme.categorySelectedText : currentTheme.text}
                fallback={null}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[
                  styles.viewOptionText,
                  activeTab === 'grocery' && styles.viewOptionTextSelected
                ]}>
                  Pantry
                </Text>
                {/* <Text style={[
                  styles.viewOptionAmount,
                  activeTab === 'grocery' && styles.viewOptionAmountSelected
                ]}>
                  {' '}{allGroceryItems.length} items
                </Text> */}
              </View>
            </BlurView>
          </Pressable>
        </ScrollView>
      </BlurView>
    </View>
  );

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
      'subscriptions': 'dollarsign.circle.fill',
    };
    return iconMap[category] || 'chart.bar.fill';
  };

  const renderExpenseCategorySelector = () => (
    <View>
      {/* Background Container with ScrollView inside */}
      <BlurView
        intensity={30}
        tint={currentTheme.blurTint}
        style={styles.expenseCategorySelectorBackground}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.expenseCategorySelectorScrollView}
          contentContainerStyle={styles.expenseCategorySelectorContainer}
          onScroll={handleCategoryScroll}
          scrollEventThrottle={16}
        >
          {categories.map((category) => (
            
            // Category Container
            <Pressable
              key={category}
              style={styles.expenseCategoryOptionContainer}
              onPress={() => handleCategoryPress(category)}
            >
              {/* Category Button */}
              <BlurView 
                intensity={selectedCategory === category ? 50 : 0} 
                tint={currentTheme.blurTint} 
                style={[
                  styles.expenseCategoryOption,
                  selectedCategory === category && styles.expenseCategoryOptionSelected
                ]}
              >
                {/* Show icon when unselected, name when selected */}
                {selectedCategory === category ? (
                  <Text style={[
                    styles.expenseCategoryOptionText,
                    styles.expenseCategoryOptionTextSelected
                  ]}>
                    {category}
                  </Text>
                ) : (
                  <SymbolView
                    name={getCategoryIcon(category)}
                    size={22}
                    type="outline"
                    tintColor={currentTheme.categoryIconColor}
                    fallback={null}
                  />
                )}

                {/* Category Amount - Only show when selected */}
                {selectedCategory === category && (
                  <Text style={[
                    styles.expenseCategoryOptionAmount,
                    styles.expenseCategoryOptionAmountSelected
                  ]}>
                    ${category === 'All' ? 
                      (Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')) :
                      (Number.isInteger(categoryTotals[category] || 0) ? 
                        (categoryTotals[category] || 0) : 
                        (categoryTotals[category] || 0).toFixed(2).replace(/\.00$/, ''))
                    }
                  </Text>
                )}
              </BlurView>
            </Pressable>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );

  const renderGroceryConfirmModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
              onRequestClose={() => {
          setIsAddModalVisible(false);
          setIsGroceryStep(1);
          setParsedGroceryItems([]);
          setExistingGroceryItems([]);
        }}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Swipe indicator */}
        <View style={styles.modalPill} />
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={() => {
            setIsGroceryStep(1);
            setExistingGroceryItems([]);
          }}>
            <Text style={styles.modalCancelButton}>← Back</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Confirm Items</Text>
          <Pressable onPress={confirmGroceryList} disabled={isLoading}>
            <Text style={[styles.modalAddButton, isLoading && styles.modalAddButtonDisabled]}>
              {isLoading ? 'Adding...' : 'Confirm'}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>New Items ({parsedGroceryItems.length})</Text>
            <Text style={styles.modalSubLabel}>
              Review and confirm the items we found in your grocery list:
            </Text>
            
            <View style={styles.groceryConfirmList}>
              {parsedGroceryItems.map((item, index) => (
                <View key={index} style={styles.groceryConfirmItem}>
                  <Text style={styles.groceryConfirmItemText}>• {item}</Text>
                </View>
              ))}
            </View>
          </View>

          {existingGroceryItems.length > 0 && (
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Existing Items ({existingGroceryItems.length})</Text>
              <Text style={styles.modalSubLabel}>
                Items you already have in your grocery list:
              </Text>
              
              <View style={styles.groceryConfirmList}>
                {existingGroceryItems.map((item, index) => (
                  <View key={index} style={styles.groceryConfirmItem}>
                    <Text style={styles.groceryConfirmItemTextExisting}>• {item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAddModal = () => {
    if (addCategory === 'groceries' && isGroceryStep === 2) {
      return renderGroceryConfirmModal();
    }
    
    return (
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => {
          setIsAddModalVisible(false);
          setIsGroceryStep(1);
          setParsedGroceryItems([]);
          setExistingGroceryItems([]);
        }}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Swipe indicator */}
          <View style={styles.modalPill} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Expense</Text>
            <Pressable onPress={addCategory === 'groceries' ? handleGroceryNext : addExpense} disabled={isLoading || isParsingGroceries}>
              <Text style={[styles.modalAddButton, (isLoading || isParsingGroceries) && styles.modalAddButtonDisabled]}>
                {isLoading ? 'Adding...' : 
                 isParsingGroceries ? 'Parsing...' : 
                 addCategory === 'groceries' ? '→' : 'Add'}
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Amount */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Amount ($)</Text>
              <WheelAmountPicker
                value={addAmount}
                onValueChange={setAddAmount}
                theme={currentTheme}
              />
            </View>

            {/* Category */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['amazon', 'transportation', 'groceries', 'entertainment', 'fashion', 'travel', 'food', 'monthly', 'other'].map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.modalCategoryOption,
                      addCategory === cat && styles.modalCategoryOptionSelected
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAddCategory(cat);
                    }}
                  >
                    <Text style={[
                      styles.modalCategoryText,
                      addCategory === cat && styles.modalCategoryTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            
            {/* Description */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={styles.modalInput}
                value={addDescription}
                onChangeText={setAddDescription}
                placeholder={addCategory === 'groceries' ? 'Enter your grocery list here.' : 'What now?'}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Swipe indicator */}
        <View style={styles.modalPill} />
        
        <View style={styles.modalHeader}>
          {/* <Pressable onPress={() => setIsEditModalVisible(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </Pressable> */}
          <Text style={styles.modalTitle}>Edit Expense</Text>
          <Pressable onPress={updateExpense} disabled={isLoading}>
            <Text style={[styles.modalSaveButton, isLoading && styles.modalSaveButtonDisabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
        
        <ScrollView 
          style={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              value={editAmount}
              onChangeText={setEditAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['amazon', 'transportation', 'groceries', 'entertainment', 'fashion', 'travel', 'food', 'monthly', 'other'].map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.modalCategoryOption,
                    editCategory === cat && styles.modalCategoryOptionSelected
                  ]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text style={[
                    styles.modalCategoryText,
                    editCategory === cat && styles.modalCategoryTextSelected
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
  // #endregion

  // #region MAIN RENDER

  return (
    <View style={styles.container}>
      
             {/* Fixed Day Header - Only show for "All" category (day-based view) */}
       {!isLoadingExpenses && activeTab === 'finance' && selectedCategory === 'All' && getFilteredExpensesByDay().length > 0 && 
         renderFixedDayHeader()
       }
      
      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={[...currentTheme.topGradient].reverse()}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.topGradient,
          selectedCategory !== 'All' && { marginTop: -120 }
        ]}
        pointerEvents="none"
      />

      {/* Bottom Gradient Overlay */}
      <Animated.View
        style={[
          styles.bottomGradient,
          { 
            opacity: bottomGradientOpacity,
            transform: [{ translateY: bottomGradientTranslateY }]
          }
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={currentTheme.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      
      {/* Tab Header */}
      {/* {renderTabHeader()} */}
      
      {/* Content based on active tab */}
      {activeTab === 'finance' ? renderExpensesView() : renderGroceryView()}

      {/* Global View Selector */}
      <Animated.View 
        style={[
          {
            transform: [{ translateY: viewSelectorTranslateY }]
          }
        ]}
      >
        {renderViewSelector()}
      </Animated.View>

      {/* Add Modal */}
      {renderAddModal()}

      {/* Edit Modal */}
      {renderEditModal()}

      <StatusBar style={currentTheme.statusBarStyle} />
    </View>
  );
  // #endregion
}

