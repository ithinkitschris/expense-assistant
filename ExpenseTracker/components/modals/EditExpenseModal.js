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
import DateTimePicker from '@react-native-community/datetimepicker';

const EditExpenseModal = ({
  isVisible,
  onClose,
  onSave,
  isLoading,
  editAmount,
  setEditAmount,
  editCategory,
  setEditCategory,
  editDescription,
  setEditDescription,
  editTimestamp,
  setEditTimestamp,
  styles
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Swipe indicator */}
        <View style={styles.modalPill} />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Expense</Text>
          <Pressable onPress={onSave} disabled={isLoading}>
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
              {['amazon', 'personal', 'fashion', 'food', 'furniture', 'groceries', 'monthly', 'transportation', 'travel'].map((cat) => (
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
};

export default EditExpenseModal; 