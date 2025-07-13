import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Animated, useColorScheme, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { expenseAPI } from './services/api';
import { createStyles, themes } from './styles';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from './components/WheelAmountPicker';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Add expense modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addAmount, setAddAmount] = useState('0');
  const [addCategory, setAddCategory] = useState('');
  const [addDescription, setAddDescription] = useState('');
  
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
      await expenseAPI.addExpenseStructured(amount, addCategory, addDescription);
      
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
    <Pressable 
      style={styles.expenseItem}
      onPress={() => handleExpensePress(item)}
      onLongPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      {/* Expense Header */}
        <View style={styles.expenseHeader}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.date}>
            {new Date(item.timestamp).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            })}
            </Text>
        </View>

        {/* Expense Description */} 
        <Text style={styles.expenseTitle}>{item.description}</Text>

        {/* Expense Amount */}
        <Text style={styles.amount}>${Number(item.amount).toFixed()}</Text>
        
    </Pressable>
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
        <Pressable
          key={category}
          style={styles.categoryOptionContainer}
          onPress={() => handleCategoryPress(category)}
        >
          <BlurView 
            intensity={selectedCategory === category ? 10 : 20} 
            tint={currentTheme.blurTint} 
            style={[
              styles.categoryOption,
              selectedCategory === category && styles.categoryOptionSelected
            ]}
          >
            <Text style={[
              styles.categoryOptionText,
              selectedCategory === category && styles.categoryOptionTextSelected
            ]}>
              {category}
            </Text>
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

  const renderAddModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Expense</Text>
          <Pressable onPress={addExpense} disabled={isLoading}>
            <Text style={[styles.modalSaveButton, isLoading && styles.modalSaveButtonDisabled]}>
              {isLoading ? 'Adding...' : 'Add'}
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
              placeholder="What now?"
              multiline
              numberOfLines={3}
            />
          </View>
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
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setIsEditModalVisible(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </Pressable>
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
    <View style={styles.container}>
        
      {/* Total Amount Header */}
      {/* <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
        <BlurView intensity={30} tint={currentTheme.blurTint} style={styles.headerBlur}>
          <Text style={styles.totalAmountLabel}>
            {selectedCategory === 'All' 
              ? 'Total Expenses' 
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).toLowerCase()}`}
          </Text>
          <Text style={styles.totalAmount}>
            ${Number.isInteger(getDisplayAmount()) ? getDisplayAmount() : getDisplayAmount().toFixed(2).replace(/\.00$/, '')}
          </Text>
        </BlurView>
      </Animated.View> */}

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
      
      <View style={styles.categorySelector}>
        {renderCategorySelector()}
      </View>

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={currentTheme.gradient}
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
  );
}

