import React from 'react';
import { 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  TextInput 
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import WheelAmountPicker from '../WheelAmountPicker';

const AddExpenseModal = ({
  isVisible,
  onClose,
  onAdd,
  isLoading,
  addAmount,
  setAddAmount,
  addCategory,
  setAddCategory,
  addDescription,
  setAddDescription,
  styles,
  currentTheme
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleAdd = () => {
    onAdd();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
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
          <Pressable onPress={handleAdd} disabled={isLoading}>
            <Text style={[styles.modalAddButton, isLoading && styles.modalAddButtonDisabled]}>
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
              {['amazon', 'personal', 'fashion', 'food', 'furniture', 'groceries', 'monthly', 'transportation', 'travel'].map((cat) => (
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
              placeholder="What did you buy?"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddExpenseModal; 