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

const EditPantryModal = ({
  isVisible,
  onClose,
  onSave,
  isLoading,
  isLoadingGroceryCategories,
  editPantryItemName,
  setEditPantryItemName,
  editPantryItemCategory,
  setEditPantryItemCategory,
  groceryCategories,
  handleGroceryCategoryScroll,
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
        <View style={styles.modalPill} />
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Edit Pantry Item</Text>
          <Pressable onPress={onSave} disabled={isLoading}>
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
};

export default EditPantryModal; 