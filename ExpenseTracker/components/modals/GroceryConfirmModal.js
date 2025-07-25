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

const GroceryConfirmModal = ({
  isVisible,
  onClose,
  onConfirm,
  onBack,
  isLoading,
  parsedGroceryItems,
  existingPantryItems,
  editingGroceryItemIndex,
  editingGroceryItemText,
  setEditingGroceryItemText,
  isAddingNewItem,
  newItemText,
  setNewItemText,
  onStartEditingGroceryItem,
  onSaveGroceryItemEdit,
  onCancelGroceryItemEdit,
  onDeleteGroceryItem,
  onStartAddingNewItem,
  onSaveNewItem,
  onCancelAddingNewItem,
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
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={onBack}>
            <Text style={styles.modalCancelButton}>← Back</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Edit Items</Text>
          <Pressable onPress={onConfirm} disabled={isLoading}>
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
                        onSubmitEditing={onSaveGroceryItemEdit}
                      />
                      <View style={styles.groceryItemEditButtons}>
                        <Pressable onPress={onSaveGroceryItemEdit} style={styles.groceryItemEditButton}>
                          <Text style={styles.groceryItemEditButtonText}>✓</Text>
                        </Pressable>
                        <Pressable onPress={onCancelGroceryItemEdit} style={styles.groceryItemEditButton}>
                          <Text style={styles.groceryItemEditButtonText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.groceryItemDisplayContainer}>
                      <Text style={styles.groceryConfirmItemText}>• {item.name}</Text>
                      <View style={styles.groceryItemActions}>
                        <Pressable onPress={() => onStartEditingGroceryItem(index, item)} style={styles.groceryItemActionButton}>
                          <Text style={styles.groceryItemActionButtonText}>✏️</Text>
                        </Pressable>
                        <Pressable onPress={() => onDeleteGroceryItem(index)} style={styles.groceryItemActionButton}>
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
                      onSubmitEditing={onSaveNewItem}
                    />
                    <View style={styles.groceryItemEditButtons}>
                      <Pressable onPress={onSaveNewItem} style={styles.groceryItemEditButton}>
                        <Text style={styles.groceryItemEditButtonText}>✓</Text>
                      </Pressable>
                      <Pressable onPress={onCancelAddingNewItem} style={styles.groceryItemEditButton}>
                        <Text style={styles.groceryItemEditButtonText}>✕</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.addItemContainer}>
                <Pressable onPress={onStartAddingNewItem} style={styles.addItemButton}>
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
};

export default GroceryConfirmModal; 