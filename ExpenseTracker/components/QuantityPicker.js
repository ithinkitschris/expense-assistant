import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { PICKER_OPTIONS, VALIDATION_RULES } from '../config';

const QuantityPicker = ({ value, unit, onValueChange, onUnitChange, theme }) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Parse the current value
  const currentValue = parseFloat(value) || 1;

  // Use config values
  const quantityOptions = PICKER_OPTIONS.quantityOptions;
  const unitOptions = PICKER_OPTIONS.unitOptions;

  const handleQuantityChange = (newQuantity) => {
    onValueChange(newQuantity.toString());
  };

  const handleUnitChange = (newUnit) => {
    onUnitChange(newUnit);
  };

  const handleSwitchToCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomInput(currentValue.toString());
    setIsCustomMode(true);
  };

  const handleConfirmCustom = () => {
    const customValue = parseFloat(customInput) || 1;
    if (customValue <= VALIDATION_RULES.quantity.min || customValue > VALIDATION_RULES.quantity.max) {
      Alert.alert('Invalid Quantity', VALIDATION_RULES.quantity.errorMessage);
      return;
    }
    onValueChange(customValue.toString());
    setCustomInput('');
    setIsCustomMode(false);
  };

  const handleCustomInputChange = (text) => {
    // Allow numbers and decimal points
    const numericText = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length <= 2) {
      setCustomInput(numericText);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Quantity Picker */}
        <View style={styles.quantityContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
          
          {isCustomMode ? (
            // Custom Input
            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.customInput, { 
                  color: theme.text, 
                  borderColor: theme.borderColorLighter,
                  backgroundColor: theme.background 
                }]}
                value={customInput}
                onChangeText={handleCustomInputChange}
                placeholder="Enter quantity"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleConfirmCustom}
                onBlur={handleConfirmCustom}
              />
            </View>
          ) : (
            // Picker
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={currentValue}
                  onValueChange={handleQuantityChange}
                  style={[styles.picker, { color: theme.text }]}
                  itemStyle={[styles.pickerItem, { color: theme.text }]}
                >
                  {quantityOptions.map((quantity) => (
                    <Picker.Item key={quantity} label={quantity.toString()} value={quantity} />
                  ))}
                </Picker>
                
                {/* Pressable overlay over the selected item area */}
                <Pressable 
                  style={styles.selectedItemOverlay}
                  onPress={handleSwitchToCustom}
                />
              </View>
            </View>
          )}
        </View>

        {/* Unit Picker */}
        <View style={styles.unitContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Unit</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={unit}
              onValueChange={handleUnitChange}
              style={[styles.picker, { color: theme.text }]}
              itemStyle={[styles.pickerItem, { color: theme.text }]}
            >
              {unitOptions.map((unitOption) => (
                <Picker.Item key={unitOption} label={unitOption} value={unitOption} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  quantityContainer: {
    flex: 2,
  },
  unitContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrapper: {
    flex: 1,
    position: 'relative',
    marginTop: -30,
    height: 120,
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 24,
    fontWeight: '500',
  },
  selectedItemOverlay: {
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    height: 50,
    width: 80,
    backgroundColor: 'rgba(255,0,0,0)', // Transparent for debugging
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  customInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 15,
    textAlign: 'center',
  },
});

export default QuantityPicker; 