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

const AddPantryModal = ({
  isVisible,
  onClose,
  onNext,
  onConfirm,
  isLoading,
  isParsingPantryItems,
  isPantryStep,
  addPantryItemName,
  setAddPantryItemName,
  parsedPantryItems,
  styles
}) => {
  const handleClose = () => {
    if (isPantryStep === 2) {
      onNext(); // Go back to step 1
    } else {
      onClose(); // Close modal
    }
  };

  const handleAction = () => {
    if (isPantryStep === 1) {
      onNext();
    } else {
      onConfirm();
    }
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
        
        <View style={styles.modalHeader}>
          <Pressable onPress={handleClose}>
            <Text style={styles.modalCancelButton}>{isPantryStep === 2 ? '← Back' : 'Cancel'}</Text>
          </Pressable>
          <Text style={styles.modalTitle}>{isPantryStep === 1 ? 'Add Pantry Items' : 'Confirm Items'}</Text>
          <Pressable onPress={handleAction} disabled={isLoading || isParsingPantryItems}>
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
};

export default AddPantryModal; 