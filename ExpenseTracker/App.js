import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, Pressable, TextInput, Alert, ScrollView, Animated, useColorScheme, Modal, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { expenseAPI } from './services/api';
import { createStyles } from './styles';
import { themes } from './themes';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from './components/WheelAmountPicker';
import QuantityPicker from './components/QuantityPicker';
import PantryCard from './components/PantryCard';
import { ExpenseCardTotal, ExpenseCardCategory } from './components/ExpenseCard';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import { ActionSheetIOS } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  // #region STATE & SETUP
  
    // Development Flags
    const ENABLE_SCROLL_ANIMATIONS = true;

    // #region useState
    const [expenses, setExpenses] = useState([]);
    const [hideUI, setHideUI] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [groceryItems, setGroceryItems] = useState({});
    
    // Tab state
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'pantry'
    const [allPantryItems, setAllPantryItems] = useState([]);
    const [isLoadingPantryItems, setIsLoadingPantryItems] = useState(false);
    
    // Add expense modal state
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [addAmount, setAddAmount] = useState('0');
    const [addCategory, setAddCategory] = useState('');
    const [addDescription, setAddDescription] = useState('');
    
    // Grocery flow state
    const [isGroceryStep, setIsGroceryStep] = useState(1); // 1: input, 2: confirmation
    const [parsedGroceryItems, setParsedGroceryItems] = useState([]);
    const [isParsingGroceries, setIsParsingGroceries] = useState(false);
    const [existingPantryItems, setExistingPantryItems] = useState([]);
    
    // Grocery item editing state
    const [editingGroceryItemIndex, setEditingGroceryItemIndex] = useState(-1);
    const [editingGroceryItemText, setEditingGroceryItemText] = useState('');
    const [isAddingNewItem, setIsAddingNewItem] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    
    // Add pantry item modal state
    const [isAddPantryModalVisible, setIsAddPantryModalVisible] = useState(false);
    const [addPantryItemName, setAddPantryItemName] = useState('');
    const [addPantryItemQuantity, setAddPantryItemQuantity] = useState('1');
    const [addPantryItemUnit, setAddPantryItemUnit] = useState('pieces');
  
    // Multi-item pantry entry state
    const [isPantryStep, setIsPantryStep] = useState(1); // 1: input, 2: confirmation
    const [parsedPantryItems, setParsedPantryItems] = useState([]);
    const [isParsingPantryItems, setIsParsingPantryItems] = useState(false);
    
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

    // Add state for pantry edit modal
    const [isEditPantryModalVisible, setIsEditPantryModalVisible] = useState(false);
    const [editingPantryItem, setEditingPantryItem] = useState(null);
    const [editPantryItemName, setEditPantryItemName] = useState('');
    const [editPantryItemQuantity, setEditPantryItemQuantity] = useState('1');
    const [editPantryItemUnit, setEditPantryItemUnit] = useState('pieces');
    const [editPantryItemCategory, setEditPantryItemCategory] = useState('other');
    
    // MinusQuantityPlus expansion state
    const [expandedQuantityId, setExpandedQuantityId] = useState(null);

    // Add state for editTimestamp and picker visibility
    const [editTimestamp, setEditTimestamp] = useState('');

    // Add state for grocery categories (fetched from backend)
    const [groceryCategories, setGroceryCategories] = useState([]);
    const [isLoadingGroceryCategories, setIsLoadingGroceryCategories] = useState(true);

    // #endregion

    // #region useEffect
    
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

      // Hide UI when category is not 'All'
      useEffect(() => {
        if (selectedCategory !== 'All') {
          setHideUI(false);
        }
      }, [selectedCategory]);

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
            Animated.timing(groceryHeaderTranslateY, {
              toValue: -200,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(topGradientTranslateY, {
              toValue: -100,
              duration: 200,
              useNativeDriver: true,
            })
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
            Animated.timing(groceryHeaderTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(topGradientTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        }
      }, [hideUI]);

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
      const groceryHeaderTranslateY = useRef(new Animated.Value(0)).current;
      const topGradientTranslateY = useRef(new Animated.Value(0)).current;
      const lastScrollY = useRef(0);
      const lastScrollX = useRef(0);
      const isHeaderVisible = useRef(true);

      // Get current theme
      const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
      const styles = createStyles(currentTheme);

      // Fetch grocery categories from backend on mount
      useEffect(() => {
        const fetchGroceryCategories = async () => {
          setIsLoadingGroceryCategories(true);
          try {
            const response = await fetch('http://192.168.1.172:8000/api/v1/grocery-categories');
            if (!response.ok) throw new Error('Failed to fetch grocery categories');
            const data = await response.json();
            console.log('Fetched groceryCategories:', data); // Debug log
            setGroceryCategories(data);
          } catch (error) {
            console.error('Error fetching grocery categories:', error);
            setGroceryCategories([]);
          } finally {
            setIsLoadingGroceryCategories(false);
          }
        };
        fetchGroceryCategories();
      }, []);

    // #endregion

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

  // #endregion

  // #region API OPERATIONS

  // Load expenses when app starts
  useEffect(() => {
    loadExpenses();
  }, []);

  // Load all pantry items when switching to pantry tab
  useEffect(() => {
    if (activeTab === 'pantry') {
      loadAllPantryItems();
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

  // Load all pantry items from API
  const loadAllPantryItems = async () => {
    try {
      setIsLoadingPantryItems(true);
      const response = await expenseAPI.getAllPantryItems();
      setAllPantryItems(response || []);
    } catch (error) {
      console.log('Failed to load all pantry items:', error);
      Alert.alert('Error', 'Failed to load pantry items');
    } finally {
      setIsLoadingPantryItems(false);
    }
  };

  // Load grocery items for grocery expenses
  const loadGroceryItems = async () => {
    // This function is deprecated since we're using the new pantry system
    // Grocery items are now stored in the pantry_items table
    // We'll keep this function for backward compatibility but it won't do anything
    console.log('loadGroceryItems called - using new pantry system instead');
    setGroceryItems({});
  };

  // Load grocery items when expenses change
  // This useEffect is deprecated since we're using the new pantry system
  // useEffect(() => {
  //   if (expenses.length > 0) {
  //     loadGroceryItems();
  //   }
  // }, [expenses]);

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
      // Always use {name, category} structure
      const items = (data.items || []).map(item => ({
        name: (item.item || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        category: item.category || 'other'
      }));
      setParsedGroceryItems(items);
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
      const response = await expenseAPI.getAllPantryItems();
      // Get unique item names and sort them
      const uniqueItems = [...new Set(response.map(item => item.name))];
      setExistingPantryItems(uniqueItems.sort());
    } catch (error) {
      console.log('Failed to load existing pantry items:', error);
      setExistingPantryItems([]);
    }
  };

  // Grocery item editing functions
  const startEditingGroceryItem = (index, currentText) => {
    setEditingGroceryItemIndex(index);
    setEditingGroceryItemText(currentText.name);
  };

  const saveGroceryItemEdit = () => {
    if (editingGroceryItemText.trim()) {
      const updatedItems = [...parsedGroceryItems];
      // Only update the name, keep the category
      updatedItems[editingGroceryItemIndex] = {
        ...updatedItems[editingGroceryItemIndex],
        name: editingGroceryItemText.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      };
      setParsedGroceryItems(updatedItems);
    }
    setEditingGroceryItemIndex(-1);
    setEditingGroceryItemText('');
  };

  const cancelGroceryItemEdit = () => {
    setEditingGroceryItemIndex(-1);
    setEditingGroceryItemText('');
  };

  const deleteGroceryItem = (index) => {
    const itemName = parsedGroceryItems[index].name;
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          const updatedItems = parsedGroceryItems.filter((_, i) => i !== index);
          setParsedGroceryItems(updatedItems);
        }}
      ]
    );
  };

  const startAddingNewItem = () => {
    setIsAddingNewItem(true);
    setNewItemText('');
  };

  const saveNewItem = () => {
    if (newItemText.trim()) {
      // Add with default category 'other'
      const sentenceCaseText = newItemText.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      setParsedGroceryItems([...parsedGroceryItems, { name: sentenceCaseText, category: 'other' }]);
    }
    setIsAddingNewItem(false);
    setNewItemText('');
  };

  const cancelAddingNewItem = () => {
    setIsAddingNewItem(false);
    setNewItemText('');
  };

  const confirmGroceryList = async () => {
    try {
      setIsLoading(true);
      console.log('🛒 Starting grocery expense confirmation...');
      console.log('📝 Description:', addDescription);
      console.log('💰 Amount:', addAmount);
      console.log('📦 Items to add:', parsedGroceryItems);
      
      // Test API connection first
      console.log('🔍 Testing API connection...');
      const isConnected = await expenseAPI.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to API server. Please check your network connection.');
      }
      
      // Create the expense
      const amount = parseInt(addAmount);
      console.log('🚀 Creating expense...');
      const response = await expenseAPI.addExpenseStructured(amount, 'groceries', addDescription);
      console.log('✅ Expense created:', response);
      
      // Save the grocery items to pantry using parsedGroceryItems (array of {name, category})
      console.log('🛒 Adding items to pantry...');
      for (const item of parsedGroceryItems) {
        console.log('📦 Adding item:', item.name);
        try {
          await expenseAPI.addPantryItemDirectly(
            item.name,
            1, // Default quantity to 1 for each grocery item
            'pieces' // Default unit to 'pieces', or adjust as needed
          );
          console.log('✅ Item added successfully:', item.name);
        } catch (itemError) {
          console.log('❌ Failed to add item:', item.name, itemError);
          throw itemError; // Re-throw to be caught by outer catch
        }
      }
      
      console.log('🎉 All items added successfully!');
      
      // Close modal and clear form
      setIsAddModalVisible(false);
      setIsGroceryStep(1);
      setParsedGroceryItems([]);
      setExistingPantryItems([]);
      setAddAmount('0');
      setAddCategory('');
      setAddDescription('');
      // Clear editing state
      setEditingGroceryItemIndex(-1);
      setEditingGroceryItemText('');
      setIsAddingNewItem(false);
      setNewItemText('');
      // Reload expenses to show the new one
      await loadExpenses();
      // Show success alert
      Alert.alert('Success', 'Grocery expense and pantry items added successfully!');
    } catch (error) {
      console.log('❌ Error in confirmGroceryList:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error stack:', error.stack);
      console.log('❌ Error toString:', error.toString());
      console.log('❌ Error constructor:', error.constructor.name);
      
      // Try to get more details about the error
      if (error.response) {
        console.log('❌ Error response status:', error.response.status);
        console.log('❌ Error response data:', error.response.data);
        console.log('❌ Error response headers:', error.response.headers);
      }
      
      if (error.request) {
        console.log('❌ Error request:', error.request);
      }
      
      let errorMessage = 'Unknown error';
      try {
        if (error instanceof Error) {
          errorMessage = error.message || 'Unknown error occurred';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          // Try to extract meaningful information from the error object
          if (error.message) {
            errorMessage = error.message;
          } else if (error.detail) {
            errorMessage = error.detail;
          } else if (error.error) {
            errorMessage = error.error;
          } else {
            errorMessage = JSON.stringify(error);
          }
        }
      } catch (stringifyError) {
        console.log('❌ Error stringifying error:', stringifyError);
        errorMessage = 'Failed to process error message';
      }
      
      console.log('📤 Final error message:', errorMessage);
      Alert.alert('Error', `Failed to add grocery expense: ${errorMessage}`);
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
      
      // If this is a grocery expense, parse the items to pantry
      if (addCategory === 'groceries' && response.id) {
        try {
          await expenseAPI.parseGroceryToPantry(response.id);
        } catch (parseError) {
          console.log('Failed to parse grocery items to pantry:', parseError);
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

  const addPantryItem = async () => {
    // Validate form fields
    if (!addPantryItemName.trim()) {
      Alert.alert('Error', 'Please enter pantry item(s)');
      return;
    }

    try {
      setIsLoading(true);
      // Parse the items using the unified parsing function
      const data = await expenseAPI.parseGroceryItemsFromDescription(addPantryItemName.trim());
      
      // Convert items to the format we need
      const items = (data.items || []).map(item => ({
        name: item.item || '',
        category: item.category || 'other'
      }));
      
      // Add each item to the pantry
      for (const item of items) {
        await expenseAPI.addPantryItemDirectly(
          item.name,
          parseFloat(addPantryItemQuantity),
          addPantryItemUnit
        );
      }
      
      // Close modal and clear form
      setIsAddPantryModalVisible(false);
      setAddPantryItemName('');
      setAddPantryItemQuantity('1');
      setAddPantryItemUnit('pieces');
      setIsPantryStep(1);
      setParsedPantryItems([]);
      
      // Reload pantry items to show the new one
      await loadAllPantryItems();
      
      Alert.alert('Success', `Added ${items.length} item(s) to pantry successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to add pantry item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePantryNext = async () => {
    // Validate form fields for pantry flow
    if (!addPantryItemName.trim()) {
      Alert.alert('Error', 'Please enter pantry item(s)');
      return;
    }
  
    try {
      setIsParsingPantryItems(true);
      
      // Parse pantry items using the API service
      const data = await expenseAPI.parseGroceryItemsFromDescription(addPantryItemName.trim());
      // Convert all items to sentence case (first letter capitalized)
      const sentenceCaseItems = (data.items || []).map(item => ({
        name: (item.item || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        category: item.category || 'other'
      }));
      setParsedPantryItems(sentenceCaseItems);
      
      setIsPantryStep(2);
      
    } catch (error) {
      Alert.alert('Error', `Failed to parse pantry items: ${error.message}`);
    } finally {
      setIsParsingPantryItems(false);
    }
  };
  
  const confirmPantryList = async () => {
    try {
      setIsLoading(true);
      
      // Add each item to the pantry
      for (const item of parsedPantryItems) {
        await expenseAPI.addPantryItemDirectly(
          item.name,
          parseFloat(addPantryItemQuantity),
          addPantryItemUnit
        );
      }
      
      // Close modal and clear form
      setIsAddPantryModalVisible(false);
      setIsPantryStep(1);
      setParsedPantryItems([]);
      setAddPantryItemName('');
      setAddPantryItemQuantity('1');
      setAddPantryItemUnit('pieces');
      
      // Reload pantry items to show the new ones
      await loadAllPantryItems();
      
      // Show success alert
      Alert.alert('Success', `Added ${parsedPantryItems.length} item(s) to pantry successfully!`);
      
    } catch (error) {
      Alert.alert('Error', `Failed to add pantry items: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Handle scroll-based UI hiding for 'All' category and pantry view
    if (selectedCategory !== 'All' && activeTab !== 'pantry') {
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
    
    console.log('Scroll event:', {
      contentOffset: scrollPosition,
      layoutMeasurement: pageWidth,
      calculatedIndex: currentIndex,
      currentCategoryIndex,
      categories: categories.length
    });
    
    if (currentIndex !== currentCategoryIndex && currentIndex >= 0 && currentIndex < categories.length) {
      console.log('Updating category index from', currentCategoryIndex, 'to', currentIndex);
      
      // Trigger haptic feedback when category changes
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setCurrentCategoryIndex(currentIndex);
    }
  };

  // Handle quantity changes (increase/decrease)
  const handleQuantityChange = async (item, change) => {
    const newQuantity = Math.max(0, item.quantity + change);
    const isConsumed = newQuantity === 0;

    // Optimistic update: update UI immediately
    const updatedItems = allPantryItems.map(pantryItem => {
      if (pantryItem.id === item.id) {
        return {
          ...pantryItem,
          quantity: newQuantity,
          is_consumed: isConsumed
        };
      }
      return pantryItem;
    });
    setAllPantryItems(updatedItems);

    try {
      await expenseAPI.updatePantryItem(
        item.id,
        item.name,
        newQuantity,
        item.unit,
        isConsumed,
        item.grocery_type // Always use the item's current category
      );
    } catch (error) {
      // Revert optimistic update on error
      await loadAllPantryItems();
      Alert.alert('Error', `Failed to update quantity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handler to show ActionSheet for pantry item
  const showPantryActionSheet = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Edit
            setEditingPantryItem(item);
            setEditPantryItemName(item.name);
            setEditPantryItemQuantity(item.quantity ? item.quantity.toString() : '1');
            setEditPantryItemUnit(item.unit || 'pieces');
            setEditPantryItemCategory(item.grocery_type || 'other');
            setIsEditPantryModalVisible(true);
          } else if (buttonIndex === 2) {
            // Delete
            Alert.alert(
              'Delete Pantry Item',
              `Are you sure you want to delete "${item.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deletePantryItem(item.id) },
              ]
            );
          }
        }
      );
    } else {
      console.log('Action sheet not supported on Android');
    }
  };

  // Delete pantry item handler
  const deletePantryItem = async (itemId) => {
    try {
      setIsLoading(true);
      await expenseAPI.deletePantryItem(itemId);
      await loadAllPantryItems();
      Alert.alert('Success', 'Pantry item deleted successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to delete pantry item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit pantry item handler
  const updatePantryItem = async () => {
    if (!editingPantryItem || !editPantryItemName.trim()) {
      Alert.alert('Error', 'Please enter a pantry item name');
      return;
    }
    try {
      setIsLoading(true);
      await expenseAPI.updatePantryItem(
        editingPantryItem.id, 
        editPantryItemName.trim(),
        parseFloat(editPantryItemQuantity),
        editPantryItemUnit,
        editingPantryItem.is_consumed,
        editPantryItemCategory // Always use the selected/edited category
      );
      setIsEditPantryModalVisible(false);
      setEditingPantryItem(null);
      setEditPantryItemName('');
      setEditPantryItemQuantity('1');
      setEditPantryItemUnit('pieces');
      setEditPantryItemCategory('other');
      await loadAllPantryItems();
      Alert.alert('Success', 'Pantry item updated successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to update pantry item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle grocery category scroll with haptic feedback
  const handleGroceryCategoryScroll = (event) => {
    const currentScrollX = event.nativeEvent.contentOffset.x;
    const scrollDifference = Math.abs(currentScrollX - (lastScrollX.current || 0));
    
    // Trigger haptic feedback when scrolling more than 30px horizontally
    if (scrollDifference > 30) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastScrollX.current = currentScrollX;
    }
  };
  // #endregion

  // #region RENDER FUNCTIONS

    // #region RENDER MAIN APP 
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
            <LoadingState
              message="Loading expenses..."
              styles={styles}
            />
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
        </>
      );
    };

    const renderGroceryView = () => {
      if (isLoadingPantryItems) {
        return (
          <LoadingState
            message="Loading pantry items..."
            styles={styles}
          />
        );
      }

      // Split items into active and consumed
      const activeItems = allPantryItems.filter(item => item.quantity > 0 || !item.is_consumed);
      const consumedItems = allPantryItems.filter(item => item.quantity === 0 && item.is_consumed);

      // Group active items by name and get latest occurrence
      const groupedActiveItems = activeItems.reduce((acc, item) => {
        if (!acc[item.name] || new Date(item.created_at) > new Date(acc[item.name].created_at)) {
          acc[item.name] = item;
        }
        return acc;
      }, {});

      const uniqueActiveItems = Object.values(groupedActiveItems);

      // Group consumed items by name and get latest occurrence
      const groupedConsumedItems = consumedItems.reduce((acc, item) => {
        if (!acc[item.name] || new Date(item.created_at) > new Date(acc[item.name].created_at)) {
          acc[item.name] = item;
        }
        return acc;
      }, {});

      const uniqueConsumedItems = Object.values(groupedConsumedItems);

      // Get sort order for grocery types
      const getGroceryTypeSortOrder = (type) => {
        const sortOrders = {
          'produce': 1,
          'meat': 2,
          'dairy': 3,
          'bread': 4,
          'pantry': 5,
          'frozen': 6,
          'beverages': 7,
          'snacks': 8,
          'condiments': 9,
          'other': 10,
          'consumed': 11
        };
        return sortOrders[type] || 10;
      };

      // Group active items by grocery type
      const activeItemsByType = uniqueActiveItems.reduce((acc, item) => {
        const type = item.grocery_type || 'other';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(item);
        return acc;
      }, {});

      // Sort items within each type by name
      Object.keys(activeItemsByType).forEach(type => {
        activeItemsByType[type].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      });

      // Create sections for active items by type and sort by type order
      const activeSections = Object.keys(activeItemsByType)
        .filter(type => activeItemsByType[type].length > 0)
        .map(type => ({
          type: 'active',
          groceryType: type,
          items: activeItemsByType[type]
        }))
        .sort((a, b) => getGroceryTypeSortOrder(a.groceryType) - getGroceryTypeSortOrder(b.groceryType));

      // Create consumed section if there are consumed items
      const consumedSection = uniqueConsumedItems.length > 0 ? [{
        type: 'consumed',
        groceryType: 'consumed',
        items: uniqueConsumedItems.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      }] : [];

      const allSections = [...activeSections, ...consumedSection];

      return (
        <>
          {/* Floating Grocery Header */}
          <Animated.View 
            style={[
              styles.groceryHeader,
              {
                transform: [{ translateY: groceryHeaderTranslateY }]
              }
            ]}
          >
            <Text style={styles.groceryHeaderTitle}>Pantry</Text>
            <Text style={styles.groceryHeaderSubtitle}>
              {uniqueActiveItems.length} active, {uniqueConsumedItems.length} consumed
            </Text>
          </Animated.View>
          
          <FlatList
            data={allSections}
            renderItem={renderPantrySection}
            keyExtractor={(section) => `${section.type}-${section.groceryType}`}
            style={styles.groceryList}
            contentContainerStyle={styles.groceryListContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleHeaderScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <EmptyState
                title="No grocery items yet"
                subtitle="Tap the + button to add items to your pantry!"
                icon="basket"
                styles={styles}
              />
            }
          />
        </>
      );
    };
    // #endregion

    // #region RENDER VIEW SELECTOR
    const renderViewSelector = () => (
      <View style={styles.viewSelectorWrapper}>
        {/* Background Container with ScrollView inside */}
        <BlurView
          intensity={35}
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
                setActiveTab('expenses');
              }}
            >
                              <BlurView 
                  intensity={activeTab === 'expenses' ? 50 : 0} 
                  tint={currentTheme.blurTint} 
                  style={[
                    styles.viewOption,
                    activeTab === 'expenses' && styles.viewOptionSelected
                  ]}
                >
                  <SymbolView
                    name="creditcard.fill"
                    size={34}
                    type="monochrome"
                    tintColor={activeTab === 'expenses' ? currentTheme.appleBlue : currentTheme.text}
                    fallback={null}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[
                      styles.viewOptionText,
                      activeTab === 'expenses' && styles.viewOptionTextSelected
                    ]}>
                      Expenses
                    </Text>
                    {/* <Text style={[
                      styles.viewOptionAmount,
                      activeTab === 'expenses' && styles.viewOptionAmountSelected
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
                setActiveTab('pantry');
              }}
            >
              <BlurView 
                intensity={activeTab === 'pantry' ? 50 : 0} 
                tint={currentTheme.blurTint} 
                style={[
                  styles.viewOption,
                  activeTab === 'pantry' && styles.viewOptionSelected
                ]}
              >
                <SymbolView
                  name="basket.fill"
                  size={34}
                  type="monochrome"
                  tintColor={activeTab === 'pantry' ? currentTheme.appleBlue : currentTheme.text}
                  fallback={null}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.viewOptionText,
                    activeTab === 'pantry' && styles.viewOptionTextSelected
                  ]}>
                    Pantry
                  </Text>
                </View>
              </BlurView>
            </Pressable>
          </ScrollView>
        </BlurView>
      </View>
    );
    // #endregion

    // #region RENDER CATEGORY SELECTOR
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
                      styles.expenseCategoryOptionTextSelected,
                      { color: getCategoryColor(category) }
                    ]}>
                      {category}
                    </Text>
                  ) : (
                    <SymbolView
                      name={getCategoryIcon(category)}
                      size={22}
                      type="outline"
                      tintColor="white"
                      fallback={null}
                    />
                  )}

                  {/* Category Amount - Only show when selected */}
                  {selectedCategory === category && (
                    <Text style={[
                      styles.expenseCategoryOptionAmount,
                      styles.expenseCategoryOptionAmountSelected,
                      { color: getCategoryColor(category) }
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
    // #endregion

    // #region RENDER CONTENT VIEWS

    // Render a full-screen page for each category
    const renderCategoryPage = ({ item: category }) => {
      const { height } = Dimensions.get('window');
      
      return (
        <View style={{ width: screenWidth, height }}>
          {renderCategoryView(category)}
        </View>
      );
    };

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
            />
          </View>
        );
      }

      // Use day pager for "All" category, simple list for specific categories
      return category === 'All' 
        ? renderDayView(category)
        : renderExpensesList(category);
    };

    const renderDayView = (category) => {
      const { height } = Dimensions.get('window');
      const dayGroups = getFilteredExpensesByDay(category);
      
      const handleDayPagerScroll = (event) => {
        // Handle header scroll animations only for 'All' category
        if (category === 'All') {
          handleHeaderScroll(event);
        }
        
        // Update day header in real-time during scroll
        const index = Math.round(event.nativeEvent.contentOffset.y / height);
        if (dayGroups[index] && dayGroups[index].date !== selectedDay) {
          // Trigger haptic feedback when day changes
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          setSelectedDay(dayGroups[index].date);
        }
      };
      
      return (
        <FlatList
          data={dayGroups}
          renderItem={renderDayCard}
          keyExtractor={(item) => `${category}-${item.date}`}
          style={[
            styles.daysList,
            hideUI && { marginTop: -5 }
          ]}
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

    const renderDayCard = ({ item: dayData }) => {
      const { height } = Dimensions.get('window');
      
      return (
        <View style={[styles.dayContainer, { height }]}> 
          {/* Expenses List */}
          <FlatList
            data={dayData.expenses}
            renderItem={({ item: expense }) => (
              <ExpenseCardTotal
                item={expense}
                styles={styles}
                groceryItems={groceryItems}
                onEdit={handleExpensePress}
                onDelete={deleteExpense}
                getCategoryIcon={getCategoryIcon}
                cardColor={getCategoryColor(expense.category)}
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

    const renderExpensesList = (category) => {
      const filteredExpenses = getFilteredExpenses(category);
      
      return (
        <FlatList
          data={filteredExpenses}
          renderItem={({ item: expense }) => (
            <ExpenseCardCategory
              item={expense}
              styles={styles}
              groceryItems={groceryItems}
              onEdit={handleExpensePress}
              onDelete={deleteExpense}
              getCategoryIcon={getCategoryIcon}
              cardColor={getCategoryColor(expense.category)}
            />
          )}
          keyExtractor={(expense) => `${category}-${expense.id}`}
          style={[styles.categoryExpensesList, { marginTop: -10 }]}
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

    const renderPantrySection = ({ item: section }) => {
      if (section.items.length === 0) return null;
      
      // Debug: Log the categories and section
      console.log('Rendering pantry section:', section.groceryType, groceryCategories);
      
      // Get display name for grocery type
      const getGroceryTypeDisplayName = (type) => {
        if (type === 'consumed') return 'Consumed';
        const found = groceryCategories.find(cat => cat.key === type);
        return found ? found.label : type;
      };
      
      // Get SF Symbol for grocery type
      const getGroceryTypeIcon = (type) => {
        const iconMap = {
          'produce': 'leaf.fill',           // Leaf for fresh produce
          'meat': 'fork.knife',             // Fork and knife for meat
          'dairy': 'waterbottle.fill',      // Water bottle for dairy
          'bread': 'birthday.cake.fill',    // Cake for bread/bakery
          'pantry': 'shippingbox.fill',     // Box for pantry staples
          'frozen': 'snowflake',            // Snowflake for frozen
          'beverages': 'cup.and.saucer.fill', // Cup for beverages
          'snacks': 'popcorn.fill',         // Popcorn for snacks
          'condiments': 'drop.circle.fill',   // Circle drop for condiments
          'other': 'questionmark.circle.fill', // Question mark for other
          'consumed': 'checkmark.circle.fill'  // Checkmark for consumed items
        };
        return iconMap[type] || iconMap['other'];
      };

      // Get color for grocery type
      const getGroceryTypeColor = (type) => {
        const colorMap = {
          'all': currentTheme.appleBlue,
          'produce': currentTheme.systemMint,      // Green for fresh produce
          'meat': currentTheme.systemPink,           // Red for meat
          'dairy': currentTheme.systemGray,          // Blue for dairy
          'bread': currentTheme.systemBrown,       // Orange for bread/bakery
          'pantry': currentTheme.systemOrange,        // Gray for pantry staples
          'frozen': currentTheme.systemCyan,        // Light blue for frozen
          'beverages': currentTheme.systemIndigo,   // Purple for beverages
          'snacks': currentTheme.systemPurple,      // Yellow for snacks
          'condiments': currentTheme.systemPink,    // Pink for condiments
          'other': currentTheme.systemGray,         // Gray for other
          'consumed': currentTheme.systemGray       // Gray for consumed items
        };
        return colorMap[type] || colorMap['other'];
      };
      
      // Split items into two columns for vertical flow layout
      const leftColumn = [];
      const rightColumn = [];
      
      section.items.forEach((item, index) => {
        if (index % 2 === 0) {
          leftColumn.push(item);
        } else {
          rightColumn.push(item);
        }
      });
      
      // Helper: Convert hex to HSL
      function hexToHSL(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const r = parseInt(hex.substring(0,2), 16) / 255;
        const g = parseInt(hex.substring(2,4), 16) / 255;
        const b = parseInt(hex.substring(4,6), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h = h * 60;
        }
        return { h, s: s * 100, l: l * 100 };
      }

      // Helper: Convert HSL to hex (with alpha)
      function hslToHex(h, s, l, alpha = 1) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        let hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        if (alpha < 1) {
          hex += Math.round(alpha * 255).toString(16).padStart(2, '0');
        }
        return hex;
      }

      // Helper: Shift hue
      function shiftHue(hex, degree, alpha = 1) {
        const { h, s, l } = hexToHSL(hex);
        const newH = (h + degree) % 360;
        return hslToHex(newH, s, l, alpha);
      }

      return (
        <View style={styles.pantrySectionContainer}>
          <LinearGradient
            colors={[
              getGroceryTypeColor(section.groceryType), // 80% opacity
              shiftHue(getGroceryTypeColor(section.groceryType), 20) // 18 degree hue shift, 85% opacity
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.pantrySectionBackground,
              { borderColor: getGroceryTypeColor(section.groceryType) }
            ]}
          >
            <View style={styles.pantrySection}>
              <View style={styles.pantrySectionHeader}>
                <SymbolView
                  name={getGroceryTypeIcon(section.groceryType)}
                  size={24}
                  type="monochrome"
                  tintColor={currentTheme.text}
                  fallback={<Text style={[styles.fallbackIcon, { color: currentTheme.text }]}>•</Text>}
                />
                <Text style={[
                  styles.pantrySectionTitle,
                  { color: currentTheme.text } // Use theme text color for pantry section header
                ]}>
                  {getGroceryTypeDisplayName(section.groceryType)}
                </Text>
              </View>
              <View style={styles.pantryColumnsContainer}>
                {/* Left Column */}
                <View style={styles.pantryColumn}>
                  {leftColumn.map((item) => (
                    <View key={item.id} style={styles.pantryCardContainer}>
                      <PantryCard
                        item={item}
                        theme={currentTheme}
                        disabled={isLoading}
                        isExpanded={expandedQuantityId === item.id}
                        onExpand={() => setExpandedQuantityId(item.id)}
                        onCollapse={() => setExpandedQuantityId(null)}
                        onDecrease={() => handleQuantityChange(item, -1)}
                        onIncrease={() => handleQuantityChange(item, 1)}
                        onLongPress={() => showPantryActionSheet(item)}
                        isConsumed={section.type === 'consumed'}
                        groceryType={section.groceryType}
                      />
                    </View>
                  ))}
                </View>
                
                {/* Right Column */}
                <View style={styles.pantryColumn}>
                  {rightColumn.map((item) => (
                    <View key={item.id} style={styles.pantryCardContainer}>
                      <PantryCard
                        item={item}
                        theme={currentTheme}
                        disabled={isLoading}
                        isExpanded={expandedQuantityId === item.id}
                        onExpand={() => setExpandedQuantityId(item.id)}
                        onCollapse={() => setExpandedQuantityId(null)}
                        onDecrease={() => handleQuantityChange(item, -1)}
                        onIncrease={() => handleQuantityChange(item, 1)}
                        onLongPress={() => showPantryActionSheet(item)}
                        isConsumed={section.type === 'consumed'}
                        groceryType={section.groceryType}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    };
    // #endregion

    // #region RENDER MODALS
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
            setExistingPantryItems([]);
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
                  {['amazon', 'entertainment', 'fashion', 'food', 'furniture', 'groceries', 'monthly', 'other', 'transportation', 'travel'].map((cat) => (
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

    const renderGroceryConfirmModal = () => (
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => {
          setIsAddModalVisible(false);
          setIsGroceryStep(1);
          setParsedGroceryItems([]);
          setExistingPantryItems([]);
          // Clear editing state
          setEditingGroceryItemIndex(-1);
          setEditingGroceryItemText('');
          setIsAddingNewItem(false);
          setNewItemText('');
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
              setExistingPantryItems([]);
              // Clear editing state
              setEditingGroceryItemIndex(-1);
              setEditingGroceryItemText('');
              setIsAddingNewItem(false);
              setNewItemText('');
            }}>
              <Text style={styles.modalCancelButton}>← Back</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Items</Text>
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
              <Text style={styles.modalLabel}>Grocery Items ({parsedGroceryItems.length})</Text>
              <Text style={styles.modalSubLabel}>
                Review and edit the items we found, or add new ones:
              </Text>
              
              <View style={styles.groceryConfirmList}>
                {parsedGroceryItems.map((item, index) => (
                  <View key={index} style={styles.groceryConfirmItem}>
                    {editingGroceryItemIndex === index ? (
                      <View style={styles.groceryItemEditContainer}>
                        <TextInput
                          style={styles.groceryItemEditInput}
                          value={editingGroceryItemText}
                          onChangeText={setEditingGroceryItemText}
                          placeholder="Enter item name"
                          autoFocus
                          onSubmitEditing={saveGroceryItemEdit}
                        />
                        <View style={styles.groceryItemEditButtons}>
                          <Pressable onPress={saveGroceryItemEdit} style={styles.groceryItemEditButton}>
                            <Text style={styles.groceryItemEditButtonText}>✓</Text>
                          </Pressable>
                          <Pressable onPress={cancelGroceryItemEdit} style={styles.groceryItemEditButton}>
                            <Text style={styles.groceryItemEditButtonText}>✕</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.groceryItemDisplayContainer}>
                        <Text style={styles.groceryConfirmItemText}>• {item.name}</Text>
                        <View style={styles.groceryItemActions}>
                          <Pressable onPress={() => startEditingGroceryItem(index, item)} style={styles.groceryItemActionButton}>
                            <Text style={styles.groceryItemActionButtonText}>✏️</Text>
                          </Pressable>
                          <Pressable onPress={() => deleteGroceryItem(index)} style={styles.groceryItemActionButton}>
                            <Text style={styles.groceryItemActionButtonText}>🗑️</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
                
                {isAddingNewItem && (
                  <View style={styles.groceryConfirmItem}>
                    <View style={styles.groceryItemEditContainer}>
                      <TextInput
                        style={styles.groceryItemEditInput}
                        value={newItemText}
                        onChangeText={setNewItemText}
                        placeholder="Enter new item name"
                        autoFocus
                        onSubmitEditing={saveNewItem}
                      />
                      <View style={styles.groceryItemEditButtons}>
                        <Pressable onPress={saveNewItem} style={styles.groceryItemEditButton}>
                          <Text style={styles.groceryItemEditButtonText}>✓</Text>
                        </Pressable>
                        <Pressable onPress={cancelAddingNewItem} style={styles.groceryItemEditButton}>
                          <Text style={styles.groceryItemEditButtonText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
                
                <View style={styles.addItemContainer}>
                  <Pressable onPress={startAddingNewItem} style={styles.addItemButton}>
                    <Text style={styles.addItemButtonText}>+ Add Item</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {existingPantryItems.length > 0 && (
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Existing Items ({existingPantryItems.length})</Text>
                <Text style={styles.modalSubLabel}>
                  Items you already have in your grocery list:
                </Text>
                
                <View style={styles.groceryConfirmList}>
                  {existingPantryItems.map((item, index) => (
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
            <Text style={styles.modalTitle}>Edit Expense</Text>
            <Pressable onPress={updateExpense} disabled={isLoading}>
              <Text style={[styles.modalSaveButton, isLoading && styles.modalSaveButtonDisabled]}>
                {isLoading ? 'Saving...' : 'Save'}
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
              <Text style={styles.modalLabel}>Amount</Text>
              <TextInput
                style={styles.modalInput}
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            {/* Category */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['amazon', 'entertainment', 'fashion', 'food', 'furniture', 'groceries', 'monthly', 'other', 'transportation', 'travel'].map((cat) => (
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

            {/* Date */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Date</Text>
              <DateTimePicker
                value={editTimestamp && !isNaN(new Date(editTimestamp)) ? new Date(editTimestamp) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    // Only update the date part, keep the original time
                    const current = editTimestamp && !isNaN(new Date(editTimestamp)) ? new Date(editTimestamp) : new Date();
                    current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setEditTimestamp(current.toISOString());
                  }
                }}
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
              />
            </View>

            {/* Description */}
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

    const renderAddPantryModal = () => (
      <Modal
        visible={isAddPantryModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => {
          setIsAddPantryModalVisible(false);
          setIsPantryStep(1);
          setParsedPantryItems([]);
          setAddPantryItemName('');
          setAddPantryItemQuantity('1');
          setAddPantryItemUnit('pieces');
        }}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Swipe indicator */}
          <View style={styles.modalPill} />
          
          <View style={styles.modalHeader}>
            <Pressable onPress={() => {
              if (isPantryStep === 2) {
                setIsPantryStep(1);
                setParsedPantryItems([]);
              } else {
                setIsAddPantryModalVisible(false);
                setAddPantryItemName('');
                setAddPantryItemQuantity('1');
                setAddPantryItemUnit('pieces');
              }
            }}>
              <Text style={styles.modalCancelButton}>{isPantryStep === 2 ? '← Back' : 'Cancel'}</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{isPantryStep === 1 ? 'Add Pantry Items' : 'Confirm Items'}</Text>
            <Pressable onPress={isPantryStep === 1 ? handlePantryNext : confirmPantryList} disabled={isLoading || isParsingPantryItems}>
              <Text style={[styles.modalAddButton, (isLoading || isParsingPantryItems) && styles.modalAddButtonDisabled]}>
                {isLoading || isParsingPantryItems ? 'Parsing...' : isPantryStep === 1 ? 'Next' : 'Add'}
              </Text>
            </Pressable>
          </View>

          <ScrollView 
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isPantryStep === 1 ? (
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Pantry Items</Text>
                <Text style={styles.modalSubLabel}>
                  Enter one or more items, separated by commas, newlines, or "and":
                </Text>
                <TextInput
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  value={addPantryItemName}
                  onChangeText={setAddPantryItemName}
                  placeholder="e.g., lemon baton wafer, organic milk, eggs&#10;or&#10;apples and bananas&#10;or&#10;bread, butter, cheese"
                  multiline
                  numberOfLines={4}
                />
              </View>
            ) : (
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Parsed Items ({parsedPantryItems.length})</Text>
                <Text style={styles.modalSubLabel}>
                  Review the items we found:
                </Text>
                
                <View style={styles.groceryConfirmList}>
                  {parsedPantryItems.map((item, index) => (
                    <View key={index} style={styles.groceryConfirmItem}>
                      <View style={styles.groceryItemDisplayContainer}>
                        <Text style={styles.groceryConfirmItemText}>• {item.name}</Text>
                        <Text style={[styles.groceryConfirmItemText, { fontSize: 12, opacity: 0.7 }]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/*
            <View style={styles.modalField}>
              <QuantityPicker
                value={addPantryItemQuantity}
                unit={addPantryItemUnit}
                onValueChange={setAddPantryItemQuantity}
                onUnitChange={setAddPantryItemUnit}
                theme={currentTheme}
              />
            </View>
            */}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );

    // Add edit pantry modal
    const renderEditPantryModal = () => (
      <Modal
        visible={isEditPantryModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setIsEditPantryModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalPill} />
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsEditPantryModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Pantry Item</Text>
            <Pressable onPress={updatePantryItem} disabled={isLoading}>
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
              <Text style={styles.modalLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editPantryItemName}
                onChangeText={setEditPantryItemName}
                placeholder="e.g., Apples, Milk, Bread"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                onScroll={handleGroceryCategoryScroll}
                scrollEventThrottle={16}
              >
                {console.log('Rendering category options:', groceryCategories)}
                {isLoadingGroceryCategories ? (
                  <Text style={styles.modalLabel}>Loading categories...</Text>
                ) : (
                  groceryCategories.map((category) => (
                    <Pressable
                      key={category.key}
                      style={[
                        styles.modalCategoryOption,
                        editPantryItemCategory === category.key && styles.modalCategoryOptionSelected
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEditPantryItemCategory(category.key);
                      }}
                    >
                      <Text style={[
                        styles.modalCategoryText,
                        editPantryItemCategory === category.key && styles.modalCategoryTextSelected
                      ]}>
                        {category.label}
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>

            {/*
            <View style={styles.modalField}>
              <QuantityPicker
                value={editPantryItemQuantity}
                unit={editPantryItemUnit}
                onValueChange={setEditPantryItemQuantity}
                onUnitChange={setEditPantryItemUnit}
                theme={currentTheme}
              />
            </View>
            */}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
    // #endregion

    // #region HELPER FUNCTIONS
    // Helper function to get SF Symbol for category
    const getCategoryIcon = (category) => {
      const iconMap = {
        'amazon': 'shippingbox.fill',
        'furniture': 'chair.fill',
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

    // Helper function to get a color for each expense category
    const getCategoryColor = (category) => {
      const colorMap = {
        'all': currentTheme.appleBlue,
        'amazon': currentTheme.systemBrown,
        'entertainment': currentTheme.systemPurple,
        'fashion': currentTheme.systemPink,
        'food': currentTheme.systemRed,
        'furniture': currentTheme.systemOrange,
        'groceries': currentTheme.systemGreen,
        'monthly': currentTheme.systemGray,
        'other': currentTheme.systemGray,
        'transportation': currentTheme.systemIndigo,
        'travel': currentTheme.systemCyan,
        'subscriptions': currentTheme.systemYellow,
      };
      return colorMap[category] || currentTheme.appleBlue;
    };
    // #endregion
  
  // #endregion

  // #region MAIN RENDER

  return (
    <View style={styles.container}>
      
       {/* Fixed Day Header - Only show for "All" category (day-based view) */}
       {!isLoadingExpenses && activeTab === 'expenses' && selectedCategory === 'All' && getFilteredExpensesByDay().length > 0 && 
         renderFixedDayHeader()
       }
      
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
      
      {/* Content based on active tab */}
              {activeTab === 'expenses' ? renderExpensesView() : renderGroceryView()}

      {/* Global Add Button */}
      <View style={styles.addButtonContainer}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (activeTab === 'pantry') {
              setIsAddPantryModalVisible(true);
            } else {
              setIsAddModalVisible(true);
            }
          }}
        >
          <BlurView intensity={20} tint={'light'} style={styles.blurContainer}>    
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

      {/* Add Grocery Item Modal */}
      {renderAddPantryModal()}

      {/* Edit Pantry Item Modal */}
      {renderEditPantryModal()}

      <StatusBar style={currentTheme.statusBarStyle} />
    </View>
  );
  // #endregion
}

