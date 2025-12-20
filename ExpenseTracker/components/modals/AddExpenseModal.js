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
import { LinearGradient } from 'expo-linear-gradient';
import WheelAmountPicker from '../WheelAmountPicker';
import { getExpenseCategoryColor } from '../../themes';
import { shiftHue } from '../../utils/colorUtils';

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
              {['amazon', 'personal', 'fashion', 'food', 'furniture', 'groceries', 'monthly', 'transportation', 'travel'].map((cat) => {
                const isSelected = addCategory === cat;
                const categoryColor = getExpenseCategoryColor(cat, currentTheme);
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.modalCategoryOption,
                      isSelected && {
                        overflow: 'hidden',
                        backgroundColor: 'transparent'
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAddCategory(cat);
                    }}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={[
                          categoryColor + 'CC', // 80% opacity
                          shiftHue(categoryColor, 15, 0.95) // 80% opacity for the second hue
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.2, y: 2 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      />
                    )}
                    <Text style={[
                      styles.modalCategoryText,
                      isSelected && styles.modalCategoryTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              value={addDescription}
              onChangeText={setAddDescription}
              placeholder="What did you purchase now?"
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