import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Animated, useColorScheme, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { expenseAPI } from './services/api';
import { createStyles, themes } from './styles';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from './components/WheelAmountPicker';
import SwipeableExpenseItem from './components/SwipeableExpenseItem';

export default function App() {
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
  

  
  // System theme detection
  const systemColorScheme = useColorScheme();
  
  // Handle null/undefined cases and provide fallback
  const isDarkMode = systemColorScheme === 'dark';


  
  // Debug logging
  useEffect(() => {
    console.log('System color scheme:', systemColorScheme);
    console.log('Is dark mode:', isDarkMode);
    console.log('Current theme being used:', isDarkMode ? 'dark' : 'light');
  }, [systemColorScheme, isDarkMode]);

  // Header animation
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const lastScrollX = useRef(0);
  const isHeaderVisible = useRef(true);

  // Get current theme
  const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
  const styles = createStyles(currentTheme);

  // Calculate totals by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Get unique categories
  const categories = ['All', ...Object.keys(categoryTotals).sort()];

  // Calculate total expenses
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Get current display amount based on selection
  const getDisplayAmount = () => {
    if (selectedCategory === 'All') {
      return totalAmount;
    }
    return categoryTotals[selectedCategory] || 0;
  };

  // Filter expenses based on selected category
  const getFilteredExpenses = () => {
    if (selectedCategory === 'All') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === selectedCategory);
  };

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

  const handleHeaderScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollingDown = currentScrollY > lastScrollY.current;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollingDown && scrollDifference > 10 && isHeaderVisible.current) {
      // Hide header
      isHeaderVisible.current = false;
      Animated.timing(headerTranslateY, {
        toValue: -200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (!scrollingDown && !isHeaderVisible.current && scrollDifference > 8) {
      // Show header only after scrolling up by 100px
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
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

  const renderExpense = ({ item }) => (
    <SwipeableExpenseItem
      item={item}
      styles={styles}
      groceryItems={groceryItems}
      onEdit={handleExpensePress}
      onDelete={deleteExpense}
    />
  );

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

  const renderGroceryList = () => {
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

  const renderFinanceView = () => (
    <>
      {/* Expenses List */}
      {isLoadingExpenses ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredExpenses()}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id.toString()}
          style={styles.expenseList}
          contentContainerStyle={styles.expenseListBottomPadding}
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No expenses yet. Add one above!</Text>
          }
        />
      )}

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {renderCategorySelector()}
      </View>

      {/* Add Expense Button */}
      <View style={styles.addButtonContainer}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsAddModalVisible(true);
          }}
        >
          <BlurView intensity={10} tint={'light'} style={styles.blurContainer}>    
            <Text style={styles.addButtonText}>+</Text>
          </BlurView>
        </Pressable>
      </View>
    </>
  );

  const renderCategorySelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
      contentContainerStyle={styles.categorySelectorContent}
      onScroll={handleCategoryScroll}
      scrollEventThrottle={16}
    >
      {categories.map((category) => (
        
        // Category Container
        <Pressable
          key={category}
          style={styles.categoryOptionContainer}
          onPress={() => handleCategoryPress(category)}
        >
          {/* Category Button */}
          <BlurView 
            intensity={selectedCategory === category ? 10 : 20} 
            tint={currentTheme.blurTint} 
            style={[
              styles.categoryOption,
              selectedCategory === category && styles.categoryOptionSelected
            ]}
          >
            {/* Category Name */}
            <Text style={[
              styles.categoryOptionText,
              selectedCategory === category && styles.categoryOptionTextSelected
            ]}>
              {category}
            </Text>

            {/* Category Amount */}
            <Text style={[
              styles.categoryOptionAmount,
              selectedCategory === category && styles.categoryOptionAmountSelected
            ]}>
              ${category === 'All' ? 
                (Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2).replace(/\.00$/, '')) :
                (Number.isInteger(categoryTotals[category] || 0) ? 
                  (categoryTotals[category] || 0) : 
                  (categoryTotals[category] || 0).toFixed(2).replace(/\.00$/, ''))
              }
            </Text>
          </BlurView>
        </Pressable>
      ))}
    </ScrollView>
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/* Tab Header */}
        {renderTabHeader()}
        
        {/* Content based on active tab */}
        {activeTab === 'finance' ? renderFinanceView() : renderGroceryList()}

        {/* Top Gradient Overlay */}
        <LinearGradient
          colors={[...currentTheme.topGradient].reverse()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGradient}
          pointerEvents="none"
        />

        {/* Bottom Gradient Overlay */}
        <LinearGradient
          colors={currentTheme.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Add Modal */}
        {renderAddModal()}

        {/* Edit Modal */}
        {renderEditModal()}

        <StatusBar style={currentTheme.statusBarStyle} />
      </View>
    </GestureHandlerRootView>
  );
}

