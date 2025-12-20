import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, Pressable, TextInput, Alert, ScrollView, Animated, useColorScheme, Modal, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity, Share } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { expenseAPI } from './services/database';
import { importInitialData } from './services/importInitialData';
import { createStyles } from './styles';
import { themes, getGroceryCategoryColor, getExpenseCategoryColor } from './themes';
import {
  DEV_FLAGS,
  APP_CONSTANTS,
  PICKER_OPTIONS,
  VALIDATION_RULES,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CATEGORY_ICONS
} from './config';
import { shiftHue, increaseBrightness, hexToRGB, rgbToHex } from './utils/colorUtils';
import { toSentenceCase, formatCurrency } from './utils/textUtils';
import {
  calculateTotalAmount,
  calculateCategoryTotals,
  groupExpensesByDay,
  groupExpensesByMonth,
  getExpenseCountForDay,
  formatExpenseAmount
} from './utils/expenseUtils';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from './components/WheelAmountPicker';
// import QuantityPicker from './components/QuantityPicker';
// import PantryCard from './components/PantryCard';
import { ExpenseCardTotal, ExpenseCardCategory, ExpenseCardMonthly, ExpenseCardCategoryMonthGroup } from './components/ExpenseCard';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import { ActionSheetIOS } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  AddExpenseModal,
  // GroceryConfirmModal,
  EditExpenseModal,
  // AddPantryModal,
  // EditPantryModal
} from './components/modals';
import { ExpensesView, /* GroceryView, */ MonthlySummaryView } from './components/views';

export default function App() {
  // #region STATE & SETUP
  
    // Development Flags
    const ENABLE_SCROLL_ANIMATIONS = DEV_FLAGS.ENABLE_SCROLL_ANIMATIONS;

    // #region useState
    const [expenses, setExpenses] = useState([]);
    const [hideUI, setHideUI] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // #region Animated Values for Add Button
    const addButtonScale = useRef(new Animated.Value(UI_CONSTANTS.animations.addButtonScale.normal)).current;
    // #endregion
    
    // #region Animated Values for Expense Time Selector
    const expenseTimeSelectorScale = useRef(new Animated.Value(UI_CONSTANTS.animations.expenseTimeSelectorScale.hidden)).current;
    // #endregion
    
    // Tab state
    // PANTRY TAB REMOVED - Force expenses tab always
    const [activeTab, setActiveTab] = useState('expenses'); // Always expenses, pantry removed
    
    // Add expense modal state
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [addAmount, setAddAmount] = useState(APP_CONSTANTS.DEFAULT_AMOUNT);
    const [addCategory, setAddCategory] = useState('');
    const [addDescription, setAddDescription] = useState('');
    
    
    
    // Edit modal state
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editDescription, setEditDescription] = useState('');
    
    // Export/Import modal state
    const [isExportImportModalVisible, setIsExportImportModalVisible] = useState(false);
    const [importText, setImportText] = useState('');
    
    // Calendar state
    const [selectedDay, setSelectedDay] = useState(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const flatListRef = useRef(null);
    const calendarScrollRef = useRef(null);
    
    // Category navigation with horizontal scroll
    const categoryScrollRef = useRef(null);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const isProgrammaticScroll = useRef(false);
    const programmaticScrollTimeout = useRef(null);
    const { width: screenWidth } = Dimensions.get('window');

    // MinusQuantityPlus expansion state - REMOVED (pantry only)
    // const [expandedQuantityId, setExpandedQuantityId] = useState(null);

    // Add state for editTimestamp and picker visibility
    const [editTimestamp, setEditTimestamp] = useState('');

    // Add state for grocery categories (fetched from backend) - REMOVED (pantry only)
    // const [groceryCategories, setGroceryCategories] = useState([]);
    // const [isLoadingGroceryCategories, setIsLoadingGroceryCategories] = useState(true);

    // Add state for day/monthly view toggle
    const [viewMode, setViewMode] = useState(APP_CONSTANTS.DEFAULT_VIEW_MODE);

    // #endregion

    // #region useEffect / ANIMATIONS
    
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

      // Hide UI when category is not 'All' or when in monthly view
      useEffect(() => {
        if (selectedCategory !== 'All') {
          setHideUI(false);
        } else if (viewMode === 'monthly') {
          setHideUI(true);
        } else if (viewMode === 'day' && selectedCategory === 'All') {
          // When switching to day view in 'All' category, set hideUI to false
          // to show the category and view selectors
          setHideUI(false);
        }
      }, [selectedCategory, viewMode]);

      // Handle UI animations based on hideUI state
      useEffect(() => {
        if (hideUI && isHeaderVisible.current) {
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
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(bottomGradientTranslateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dayTitleFontSize, {
              toValue: 46, // Maximum font size when scrolled
              duration: 200,
              useNativeDriver: false,
            }),
            // Animated.timing(groceryHeaderTranslateY, {
            //   toValue: -200,
            //   duration: 200,
            //   useNativeDriver: true,
            // }),
            Animated.timing(topGradientTranslateY, {
              toValue: -150,
              duration: 200,
              useNativeDriver: true,
            }),
            // Add button scale animation
            Animated.spring(addButtonScale, {
              toValue: 0.75, // Scale down to 75%
              useNativeDriver: true,
              tension: 200,
              friction: 7,
            }),
            // Expense time selector scale animation
            Animated.spring(expenseTimeSelectorScale, {
              toValue: 1, // Scale up to 100%
              useNativeDriver: true,
              tension: 300,
              friction: 9,
            }),
 
  
            ]).start();
        } else if (!hideUI && !isHeaderVisible.current) {
          // Show header, expense category selector, and bottom gradient
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
            }),
            // Animated.timing(groceryHeaderTranslateY, {
            //   toValue: 0,
            //   duration: 200,
            //   useNativeDriver: true,
            // }),
            Animated.timing(topGradientTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            // Add button scale animation
            Animated.spring(addButtonScale, {
              toValue: 1, // Scale back to 100%
              useNativeDriver: true,
              tension: 200,
              friction: 6,
            }),
            // Expense time selector scale animation
            Animated.spring(expenseTimeSelectorScale, {
              toValue: 0.9, // Scale down to 0%
              useNativeDriver: true,
              tension: 200,
              friction: 6,
            }),
 
  
            ]).start();
        }
      }, [hideUI, viewMode]);

      // Animate view selector based on hideUI state
      useEffect(() => {
        if (hideUI) {
          // Compact state - animate to smaller sizes with spring
          Animated.parallel([
            Animated.spring(viewSelectorIconSize, {
              toValue: 0.8, // 70% of original size
              useNativeDriver: false,
              speed: 16,
              bounciness: 6,
            }),
            Animated.timing(viewSelectorTextOpacity, {
              toValue: 0,
              duration: 0, // Fade out text faster
              useNativeDriver: true,
            }),
            Animated.spring(viewSelectorPadding, {
              toValue: 3,
              useNativeDriver: false,
              speed: 16,
              bounciness: 6,
            }),
          ]).start();
        } else if (!hideUI) {
          // Normal state - animate to larger sizes with spring
          Animated.parallel([
            Animated.spring(viewSelectorIconSize, {
              toValue: 1, // 100% of original size
              useNativeDriver: false,
              speed: 10,
              bounciness: 15,
            }),
            Animated.spring(viewSelectorTextOpacity, {
              toValue: 1,
              useNativeDriver: true,
              speed: 1,
              bounciness: 15,
            }),
            Animated.spring(viewSelectorPadding, {
              toValue: 5,
              useNativeDriver: false,
              speed: 16,
              bounciness: 6,
            }),
          ]).start();
        }
      }, [hideUI, viewMode]);

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
      // const groceryHeaderTranslateY = useRef(new Animated.Value(0)).current; // PANTRY REMOVED
      const topGradientTranslateY = useRef(new Animated.Value(0)).current;
      const lastScrollY = useRef(0);
      const lastScrollX = useRef(0);
      const isHeaderVisible = useRef(true);

      // View selector animation values
      const viewSelectorIconSize = useRef(new Animated.Value(1)).current; // 1 = 100% scale (normal), 0.8 = 80% scale (compact)
      const viewSelectorTextOpacity = useRef(new Animated.Value(1)).current; // 1 normal, 0 compact
      const viewSelectorWidth = useRef(new Animated.Value(0)).current; // For width changes
      const viewSelectorPadding = useRef(new Animated.Value(5)).current; // 5px normal, 3px compact

      // Get current theme
      const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
      const styles = createStyles(currentTheme);

      // Fetch grocery categories from backend on mount - REMOVED (pantry only)
      // useEffect(() => {
      //   const fetchGroceryCategories = async () => {
      //     setIsLoadingGroceryCategories(true);
      //     try {
      //       const data = await expenseAPI.getGroceryCategories();
      //       setGroceryCategories(data);
      //     } catch (error) {
      //       console.error('Error fetching grocery categories:', error);
      //       setGroceryCategories([]);
      //     } finally {
      //       setIsLoadingGroceryCategories(false);
      //     }
      //   };
      //   fetchGroceryCategories();
      // }, []);

    // #endregion

  // #endregion

  // #region HELPER FUNCTIONS

  // Helper function to calculate weighted average color from top 3 expense categories
  const calculateWeightedCategoryColor = () => {
    if (expenses.length === 0) {
      return currentTheme.appleBlue; // Default color if no expenses
    }

    // Calculate total amount for weighting
    const totalAmount = calculateTotalAmount(expenses);
    
    // Group expenses by category and calculate category totals
    const categoryTotals = calculateCategoryTotals(expenses);

    // Get top 3 categories by amount
    const top3Categories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (top3Categories.length === 0) {
      return currentTheme.appleBlue; // Fallback
    }

    // Color utilities are now imported from utils/colorUtils.js

    // Calculate weighted average RGB values from top 3 categories only
    let weightedR = 0;
    let weightedG = 0;
    let weightedB = 0;
    let totalWeight = 0;

    top3Categories.forEach(([category, amount]) => {
      const categoryColor = getExpenseCategoryColor(category, currentTheme);
      const rgb = hexToRGB(categoryColor);
      
      if (rgb) {
        const weight = amount / totalAmount;
        weightedR += rgb.r * weight;
        weightedG += rgb.g * weight;
        weightedB += rgb.b * weight;
        totalWeight += weight;
      }
    });

    // Normalize and convert back to hex
    if (totalWeight > 0) {
      const finalR = Math.round(weightedR / totalWeight);
      const finalG = Math.round(weightedG / totalWeight);
      const finalB = Math.round(weightedB / totalWeight);
      return rgbToHex(finalR, finalG, finalB);
    }

    return currentTheme.appleBlue; // Fallback
  };

  // #endregion

  // #region DATA PROCESSING

    // Calculate totals by category
    const categoryTotals = calculateCategoryTotals(expenses);

    // Get unique categories
    const categories = ['All', ...Object.keys(categoryTotals).sort()];

    // Calculate total expenses
    const totalAmount = calculateTotalAmount(expenses);

    // Group expenses by day with display properties
    const groupExpensesByDayWithDisplay = (expenses) => {
      const grouped = groupExpensesByDay(expenses);
      
      // Transform the grouped data to include display properties
      return Object.entries(grouped).map(([dateKey, expenseArray]) => {
        const date = parseDateString(dateKey);
        
        return {
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
          expenses: expenseArray
        };
      }).sort((a, b) => {
        // Sort using the parsed dates to avoid timezone issues
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);
        return dateB - dateA;
      });
    };

    // Group expenses by month with display properties
    const groupExpensesByMonthWithDisplay = (expenses) => {
      const grouped = groupExpensesByMonth(expenses);
      
      // Transform the grouped data to include display properties
      return Object.entries(grouped).map(([monthKey, expenseArray]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1, 1); // month is 0-indexed
        
        return {
          month: monthKey,
          displayMonth: date.toLocaleDateString('en-US', { 
            month: 'long'
          }),
          shortMonth: date.toLocaleDateString('en-US', { 
            month: 'short'
          }),
          expenses: expenseArray
        };
      }).sort((a, b) => {
        // Sort using the month keys (newest first)
        return b.month.localeCompare(a.month);
      });
    };

    // Group expenses by month with totals for category view
    const groupExpensesByMonthWithTotals = (expenses) => {
      const grouped = groupExpensesByMonth(expenses);
      
      // Transform the grouped data to include display properties and totals
      return Object.entries(grouped).map(([monthKey, expenseArray]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1, 1); // month is 0-indexed
        const totalAmount = expenseArray.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          month: monthKey,
          displayMonth: date.toLocaleDateString('en-US', { 
            month: 'long'
          }),
          shortMonth: date.toLocaleDateString('en-US', { 
            month: 'short'
          }),
          expenses: expenseArray,
          totalAmount: totalAmount
        };
      }).sort((a, b) => {
        // Sort using the month keys (newest first)
        return b.month.localeCompare(a.month);
      });
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
      return groupExpensesByDayWithDisplay(filteredExpenses);
    };
    // #endregion

  // #region CALENDAR LOGIC

    // Helper function to parse date string and create local date
    const parseDateString = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0); // month is 0-indexed, set to noon to avoid timezone issues
    };

    // #region Calendar helper functions
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

    const getLocalExpenseCountForDay = (date) => {
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
        const selectedDate = parseDateString(newSelectedDay);
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

  // #endregion

  // #region API OPERATIONS

  // Import initial data on first launch (if database is empty)
  useEffect(() => {
    const importDataOnce = async () => {
      try {
        // Check if database is empty
        const data = await expenseAPI.getExpenses(1);
        if (data.expenses.length === 0) {
          // Database is empty, import initial data
          console.log('📥 Database is empty, importing initial data...');
          await importInitialData();
          // Reload expenses after import
          await loadExpenses();
        }
      } catch (error) {
        console.log('⚠️ Error checking/importing initial data:', error);
        // Continue anyway - app will work with empty database
      }
    };
    importDataOnce();
  }, []);

  // Load expenses when app starts
  useEffect(() => {
    loadExpenses();
  }, []);


  // Initialize selected day when expenses load
  useEffect(() => {
    if (expenses.length > 0) {
      const dayGroups = getFilteredExpensesByDay();
      if (dayGroups.length > 0) {
        // Set the most recent day as selected initially
        const mostRecentDay = dayGroups[0].date;
        setSelectedDay(mostRecentDay);
        const date = parseDateString(mostRecentDay);
        setCurrentWeek(date);
      }
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


  const addExpense = async () => {
    // Validate form fields
    if (!addAmount || addAmount === '0' || !addCategory.trim() || !addDescription.trim()) {
      Alert.alert('Unable to add expense', 'Enter a dollar amount, category and purchase description.');
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
      
      // Grocery parsing disabled - no longer automatically parse grocery items to pantry
      // if (addCategory === 'groceries' && response.id) {
      //   try {
      //     await expenseAPI.parseGroceryToPantry(response.id);
      //   } catch (parseError) {
      //     console.log('Failed to parse grocery items to pantry:', parseError);
      //     // Don't show error to user, just log it
      //   }
      // }
      
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
        description: editDescription.trim(),
        timestamp: editTimestamp ? new Date(editTimestamp).toISOString() : undefined
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

  const exportData = async () => {
    try {
      setIsLoading(true);
      const exportData = await expenseAPI.exportToJSON();
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Share the JSON data
      const result = await Share.share({
        message: jsonString,
        title: 'Export Expense Data'
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Data exported successfully! You can now share this with your TestFlight app.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async () => {
    try {
      if (!importText.trim()) {
        Alert.alert('Error', 'Please paste the exported JSON data');
        return;
      }
      
      setIsLoading(true);
      const jsonData = JSON.parse(importText);
      const result = await expenseAPI.importFromJSON(jsonData);
      
      // Reload expenses after import
      await loadExpenses();
      
      // Close modal and clear import text
      setIsExportImportModalVisible(false);
      setImportText('');
      
      Alert.alert(
        'Success', 
        `Import complete!\nExpenses: ${result.expenses.imported} imported, ${result.expenses.skipped} skipped\nPantry items: ${result.pantry_items.imported} imported, ${result.pantry_items.skipped} skipped`
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        Alert.alert('Error', 'Invalid JSON format. Please check your data and try again.');
      } else {
        Alert.alert('Error', `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // #endregion

  // #region EVENT HANDLERS

  const handleHeaderScroll = (event) => {
    // Skip animations if disabled for development
    if (!ENABLE_SCROLL_ANIMATIONS) {
      return;
    }
    
    // Handle scroll-based UI hiding for 'All' category
    if (selectedCategory !== 'All') {
      return;
    }
    
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollingDown = currentScrollY > lastScrollY.current;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
    
    // Set hideUI immediately when scrolling down starts (smaller threshold)
    if (scrollingDown && scrollDifference > 10 && !hideUI) {
      setHideUI(true);
    }
    
    // Clear hideUI when scrolling up starts
    if (!scrollingDown && scrollDifference > 5 && hideUI) {
      setHideUI(false);
    }
    
    // Animation logic is now controlled by hideUI state in a separate useEffect
    
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
    // When opening the edit modal, set editTimestamp
    setEditTimestamp(expense.timestamp ? new Date(expense.timestamp).toISOString() : new Date().toISOString());
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
    
    if (currentIndex !== currentCategoryIndex && currentIndex >= 0 && currentIndex < categories.length) {
      
      // Trigger haptic feedback when category changes
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setCurrentCategoryIndex(currentIndex);
    }
  };

  // #endregion

  // #region RENDER FUNCTIONS

    // #region RENDER VIEW SELECTOR
    
    // Helper function to render a single view option
    const renderViewOption = (optionKey, icon, label) => (
      <Pressable
        key={optionKey}
        style={styles.viewOptionContainer}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveTab(optionKey);
        }}
      >
        <BlurView 
          intensity={activeTab === optionKey && !hideUI ? 30 : 0} 
          tint={currentTheme.blurTint} 
          style={[
            styles.viewOption,
            activeTab === optionKey && (hideUI ? styles.viewOptionSelectedCompact : styles.viewOptionSelected),
            hideUI && styles.viewOptionCompact
          ]}
        >
          <Animated.View style={{ transform: [{ scale: viewSelectorIconSize }] }}>
            <SymbolView
              name={icon}
              size={34} // Keep at max size, use scale for animation
              type="monochrome"
              tintColor={activeTab === optionKey ? currentTheme.appleBlue : currentTheme.text}
              fallback={null}
            />
          </Animated.View>
          <Animated.View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              opacity: viewSelectorTextOpacity
            }}
          >
            <Animated.Text style={[
              styles.viewOptionText,
              activeTab === optionKey && styles.viewOptionTextSelected
            ]}>
              {label}
            </Animated.Text>
          </Animated.View>
        </BlurView>
      </Pressable>
    );

    const renderViewSelector = () => {
      // When UI is hidden, only show active tab, otherwise show both
      // PANTRY REMOVED - only expenses tab now
      const viewOptions = hideUI 
        ? [
            activeTab === 'expenses' && renderViewOption('expenses', 'creditcard.fill', 'Expenses'),
            // activeTab === 'pantry' && renderViewOption('pantry', 'basket.fill', 'Pantry'),
          ].filter(Boolean)
        : [
            renderViewOption('expenses', 'creditcard.fill', 'Expenses'),
            // renderViewOption('pantry', 'basket.fill', 'Pantry'),
          ];

      return (
        <Animated.View style={[
          styles.viewSelectorWrapper,
          hideUI && styles.viewSelectorWrapperCompact
        ]}>
          {/* Background Container with ScrollView inside */}
          <BlurView
            intensity={20}
            tint={currentTheme.blurTint}
            style={[
              styles.viewSelectorBackground,
              hideUI && styles.viewSelectorBackgroundCompact
            ]}
          >
            <Animated.ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.viewSelectorScrollView}
              contentContainerStyle={[
                styles.viewSelectorContainer,
                hideUI && styles.viewSelectorContainerCompact
              ]}
              onScroll={handleCategoryScroll}
              scrollEventThrottle={16}
              scrollEnabled={!hideUI} // Disable scrolling when compact
            >
              {viewOptions}
            </Animated.ScrollView>
          </BlurView>
        </Animated.View>
      );
    };

    // #endregion
    
    // #region RENDER CATEGORY SELECTOR
    const renderExpenseCategorySelector = () => (
      <View>
        {/* Background Container with ScrollView inside */}
        <BlurView
          intensity={20}
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
                  intensity={selectedCategory === category ? 30 : 0} 
                  tint={currentTheme.blurTint} 
                  style={[
                    styles.expenseCategoryOption,
                    selectedCategory === category && styles.expenseCategoryOptionSelected
                  ]}
                >
                  {/* Show icon when unselected, name when selected */}
                  {selectedCategory === category ? (
                    <>
                      <Text style={[
                        styles.expenseCategoryOptionAmount,
                        styles.expenseCategoryOptionAmountSelected,
                        { color: getExpenseCategoryColor(category, currentTheme) }
                      ]}>
                        ${category === 'All' ? 
                          (Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')) :
                          (Number.isInteger(categoryTotals[category] || 0) ? 
                            (categoryTotals[category] || 0) : 
                            (categoryTotals[category] || 0).toFixed(2).replace(/\.00$/, ''))
                        }
                      </Text>
                      <Text style={[
                        styles.expenseCategoryOptionText,
                        styles.expenseCategoryOptionTextSelected,
                        { color: currentTheme.text }
                      ]}>
                        {category}
                      </Text>
                    </>
                  ) : (
                    <>
                      <SymbolView
                        name={getCategoryIcon(category)}
                        size={22}
                        type="outline"
                        tintColor={getExpenseCategoryColor(category, currentTheme)}
                        fallback={null}
                      />
                      <Text style={[
                        styles.expenseCategoryOptionText,
                      ]}>
                        {category}
                      </Text>
                    </>
                  )}


                </BlurView>
              </Pressable>
            ))}
          </ScrollView>
        </BlurView>
      </View>
    );
    // #endregion

    // #region RENDER EXPENSE TIME SELECTOR
         const renderExpenseTimeSelector = () => {
       // Only show when on expenses tab, 'All' category is selected, and UI is hidden
       if (activeTab !== 'expenses' || selectedCategory !== 'All' || !hideUI) {
         return null;
       }

      const renderModeOption = (mode, icon, label) => (
        <Pressable
          key={mode}
          style={styles.expenseTimeSelectorOptionContainer}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode(mode);
          }}
        >
          <BlurView 
            intensity={viewMode === mode ? 30 : 0} 
            tint={currentTheme.blurTint} 
            style={[
              styles.expenseTimeSelectorOption,
              viewMode === mode && styles.expenseTimeSelectorOptionSelected
            ]}
          >
            {/* <SymbolView
              name={icon}
              size={18}
              type="monochrome"
              tintColor={viewMode === mode ? currentTheme.appleBlue : currentTheme.textSecondary}
              fallback={null}
            /> */}
            <Text style={[
              styles.expenseTimeSelectorOptionText,
              viewMode === mode && styles.expenseTimeSelectorOptionTextSelected
            ]}>
              {label}
            </Text>
          </BlurView>
        </Pressable>
      );

      return (
        <Animated.View 
          style={[
            styles.expenseTimeSelector,
            {
              transform: [
                { translateY: bottomGradientTranslateY },
                { scale: expenseTimeSelectorScale }
              ]
            }
          ]}
        >
          <BlurView
            intensity={20}
            tint={currentTheme.blurTint}
            style={styles.expenseTimeSelectorBackground}
          >
            <View style={styles.expenseTimeSelectorContainer}>
              {renderModeOption('day', 'calendar', 'Days')}
              {renderModeOption('monthly', 'chart.bar.fill', 'Months')}
            </View>
          </BlurView>
        </Animated.View>
      );
    };
    // #endregion

    // #region RENDER FULLSCREEN CONTENT PAGES

    // Main function that determines the appropriate view layout for a category
    const renderCategoryView = (category, containerStyle = {}) => {
      const { height } = Dimensions.get('window');
      const filteredExpenses = getFilteredExpenses(category);
      
      if (filteredExpenses.length === 0) {
        return (
          <View style={[{ height }, containerStyle]}>
            <EmptyState
              title={`No expenses in ${category} category yet!`}
              subtitle="Add your first expense to get started"
              icon="chart.bar"
              styles={styles}
              theme={currentTheme}
            />
          </View>
        );
      }

      // Always use simple list view for all categories (day view disabled)
      return renderExpenseTotal(category);
    };

    // Render Expenses Categories View
    const renderExpenseCategories = ({ item: category }) => {
      const { height } = Dimensions.get('window');
      
      return (
        <View style={{ width: screenWidth, height }}>
          {renderCategoryView(category)}
        </View>
      );
    };

    // Render Expenses Monthly Card
    const renderMonthlySummaryCard = () => {
      const monthGroups = groupExpensesByMonthWithDisplay(expenses);
      
      return (
        <MonthlySummaryView
          monthGroups={monthGroups}
          styles={styles}
          currentTheme={currentTheme}
          getExpenseCategoryColor={getExpenseCategoryColor}
          calculateWeightedCategoryColor={calculateWeightedCategoryColor}
          getCategoryIcon={getCategoryIcon}
        />
      );
    };

    // Render Expenses Total View
    const renderExpenseTotal = (category) => {
      const filteredExpenses = getFilteredExpenses(category);
      
      // For "All" category, check view mode
      if (category === 'All') {
        // If monthly view mode is selected, show monthly summary
        if (viewMode === 'monthly') {
          return renderMonthlySummaryCard();
        }
        
        // Otherwise show day view (default behavior)
        const dayGroups = getFilteredExpensesByDay(category);
        
        return (
          <FlatList
            data={dayGroups}
            renderItem={({ item: dayData }) => (
              <View style={styles.daySectionContainer}>
                {/* Day Header */}
                <View style={styles.daySectionHeader}>
                  <Text style={styles.daySectionTitle}>
                    {(() => {
                      const dateObj = parseDateString(dayData.date);
                      const dayNum = dateObj.getDate();
                      const monthName = dateObj.toLocaleString('en-US', { month: 'long' });
                      // Helper to get ordinal suffix
                      const getOrdinal = (n) => {
                        if (n > 3 && n < 21) return 'th';
                        switch (n % 10) {
                          case 1: return 'st';
                          case 2: return 'nd';
                          case 3: return 'rd';
                          default: return 'th';
                        }
                      };
                      return `${dayNum} ${monthName}`;
                    })()}
                  </Text>
                  <Text style={styles.daySectionSubtitle}>
                    ${dayData.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                  </Text>
                </View>
                
                {/* Expenses for this day */}
                {dayData.expenses.map((expense) => (
                  <ExpenseCardTotal
                    key={expense.id}
                    item={expense}
                    styles={styles}
                    onEdit={handleExpensePress}
                    onDelete={deleteExpense}
                    getCategoryIcon={getCategoryIcon}
                    cardColor={getExpenseCategoryColor(expense.category, currentTheme)}
                    currentTheme={currentTheme}
                  />
                ))}
              </View>
            )}
            keyExtractor={(dayData) => `${category}-${dayData.date}`}
            style={[styles.categoryExpensesList, { marginTop: -10 }]}
            contentContainerStyle={styles.categoryExpensesContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleHeaderScroll}
          />
        );
      }
      
      // For other categories, show month-grouped list
      const monthGroups = groupExpensesByMonthWithTotals(filteredExpenses);
      
      return (
        <FlatList
          data={monthGroups}
          renderItem={({ item: monthData }) => (
            <ExpenseCardCategoryMonthGroup
              monthData={monthData}
              styles={styles}
              onEdit={handleExpensePress}
              onDelete={deleteExpense}
              getCategoryIcon={getCategoryIcon}
              getExpenseCategoryColor={getExpenseCategoryColor}
              currentTheme={currentTheme}
            />
          )}
          keyExtractor={(monthData) => `${category}-${monthData.month}`}
          style={[styles.categoryExpensesList, { marginTop: -10 }]}
          contentContainerStyle={styles.categoryExpensesContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        />
      );
    };

    // #endregion

    // #region HELPER FUNCTIONS
    // Helper function to get SF Symbol for category
    const getCategoryIcon = (category) => CATEGORY_ICONS[category] || CATEGORY_ICONS.default;


    // #endregion
  
  // #endregion

  // #region MAIN RENDER

  return (
    <View style={styles.container}>
      
       {/* Fixed Day Header - Disabled since day view is disabled */}
      {/* {!isLoadingExpenses && activeTab === 'expenses' && selectedCategory === 'All' && getFilteredExpensesByDay().length > 0 && 
         renderFixedDayHeader()
       } */}
      
      {/* Top Gradient Overlay */}
      <Animated.View
        style={[
          styles.topGradient,
          {
            transform: [{ translateY: topGradientTranslateY }],
            height: selectedCategory !== 'All' ? 150 : 200
          }
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[...currentTheme.topGradient].reverse()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
          pointerEvents="none"
        />
      </Animated.View>
      
      {/* Content - Always expenses tab (pantry removed) */}
      <ExpensesView
        isLoadingExpenses={isLoadingExpenses}
        categories={categories}
        currentCategoryIndex={currentCategoryIndex}
        categoryScrollRef={categoryScrollRef}
        handleCategoryHorizontalScroll={handleCategoryHorizontalScroll}
        screenWidth={screenWidth}
        expenseCategorySelectorTranslateY={expenseCategorySelectorTranslateY}
        renderExpenseCategorySelector={renderExpenseCategorySelector}
        renderExpenseCategories={renderExpenseCategories}
        styles={styles}
      />

      {/* Global Add Button */}
      <Animated.View style={[
        styles.addButtonContainer,
        hideUI && styles.addButtonContainerCompact,
        {
          transform: [{ scale: addButtonScale }]
        }
      ]}>
        <Pressable
          style={[
            styles.addButton,
            hideUI && styles.addButtonCompact
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsAddModalVisible(true);
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsExportImportModalVisible(true);
          }}
        >
          <BlurView intensity={20} tint={'light'} style={styles.blurContainer}>
            <SymbolView
              name="plus"
              size={32}
              type="monochrome"
              tintColor={currentTheme.text}
              fallback={<Text style={styles.addButtonText}>+</Text>}
            />
          </BlurView>
        </Pressable>
      </Animated.View>



      {/* Bottom Gradient Overlay */}
      <Animated.View
        style={[
          styles.bottomGradient,
          { 
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

      {/* Expense Time Selector */}
      {renderExpenseTimeSelector()}

      {/* Global View Selector - HIDDEN (code kept for future use) */}
      {/* <Animated.View 
        style={[
          {
            transform: [{ translateY: viewSelectorTranslateY }]
          }
        ]}
      >
        {renderViewSelector()}
      </Animated.View> */}

      {/* Add Modal */}
      <AddExpenseModal
        isVisible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
        }}
        onAdd={addExpense}
        isLoading={isLoading}
        addAmount={addAmount}
        setAddAmount={setAddAmount}
        addCategory={addCategory}
        setAddCategory={setAddCategory}
        addDescription={addDescription}
        setAddDescription={setAddDescription}
        styles={styles}
        currentTheme={currentTheme}
      />

      {/* Edit Modal */}
      <EditExpenseModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={updateExpense}
        isLoading={isLoading}
        editAmount={editAmount}
        setEditAmount={setEditAmount}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editTimestamp={editTimestamp}
        setEditTimestamp={setEditTimestamp}
        styles={styles}
      />

      {/* Export/Import Modal */}
      <Modal
        visible={isExportImportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsExportImportModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} tint="light" style={styles.modalBlurContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Export / Import Data</Text>
                  <Pressable
                    onPress={() => {
                      setIsExportImportModalVisible(false);
                      setImportText('');
                    }}
                    style={styles.modalCloseButton}
                  >
                    <SymbolView
                      name="xmark"
                      size={24}
                      type="monochrome"
                      tintColor={currentTheme.text}
                    />
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  {/* Export Section */}
                  <View style={styles.exportImportSection}>
                    <Text style={styles.sectionTitle}>Export</Text>
                    <Text style={styles.sectionDescription}>
                      Export your data to share with TestFlight app. Long-press the + button to access this menu.
                    </Text>
                    <Pressable
                      onPress={exportData}
                      disabled={isLoading}
                      style={[styles.exportImportButton, isLoading && styles.buttonDisabled]}
                    >
                      <SymbolView
                        name="square.and.arrow.up"
                        size={20}
                        type="monochrome"
                        tintColor={currentTheme.background}
                      />
                      <Text style={styles.exportImportButtonText}>Export Data</Text>
                    </Pressable>
                  </View>

                  {/* Import Section */}
                  <View style={styles.exportImportSection}>
                    <Text style={styles.sectionTitle}>Import</Text>
                    <Text style={styles.sectionDescription}>
                      Paste the exported JSON data below to import into this app.
                    </Text>
                    <TextInput
                      style={styles.importTextInput}
                      multiline
                      numberOfLines={10}
                      placeholder="Paste exported JSON data here..."
                      placeholderTextColor={currentTheme.textSecondary}
                      value={importText}
                      onChangeText={setImportText}
                      textAlignVertical="top"
                    />
                    <Pressable
                      onPress={importData}
                      disabled={isLoading || !importText.trim()}
                      style={[
                        styles.exportImportButton,
                        (!importText.trim() || isLoading) && styles.buttonDisabled
                      ]}
                    >
                      <SymbolView
                        name="square.and.arrow.down"
                        size={20}
                        type="monochrome"
                        tintColor={currentTheme.background}
                      />
                      <Text style={styles.exportImportButtonText}>Import Data</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <StatusBar style={currentTheme.statusBarStyle} />
    </View>
  );
  // #endregion
}

