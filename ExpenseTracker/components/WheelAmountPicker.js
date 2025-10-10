import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { PICKER_OPTIONS, VALIDATION_RULES } from '../config';

const WheelAmountPicker = ({ value, onValueChange, theme }) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Parse the current value into dollars only
  const currentValue = parseInt(value) || 0;

  // Use config values
  const dollarOptions = PICKER_OPTIONS.dollarOptions;

  const handleDollarChange = (newDollars) => {
    onValueChange(newDollars.toString());
  };

  const handleSwitchToCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomInput(currentValue.toString());
    setIsCustomMode(true);
  };

  const handleConfirmCustom = () => {
    const customValue = parseInt(customInput) || 0;
    if (customValue < VALIDATION_RULES.amount.min || customValue > VALIDATION_RULES.amount.max) {
      Alert.alert('Invalid Amount', VALIDATION_RULES.amount.errorMessage);
      return;
    }
    onValueChange(customValue.toString());
    setCustomInput('');
    setIsCustomMode(false);
  };

  const handleCustomInputChange = (text) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setCustomInput(numericText);
  };

  return (
    <View style={styles.container}>
      
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
            placeholder="Enter amount"
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
          {/* <Text style={[styles.symbol, { color: theme.text }]}>$</Text> */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={currentValue}
              onValueChange={handleDollarChange}
              style={[styles.picker, { color: theme.text }]}
              itemStyle={[styles.pickerItem, { color: theme.text }]}
            >
              {dollarOptions.map((dollar) => (
                <Picker.Item key={dollar} label={dollar.toString()} value={dollar} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Remove fixed height - let picker determine its own height
  },
  pickerWrapper: {
    flex: 1,
    position: 'relative',
    marginTop: -60,
    height: 130,
  },
  picker: {
    flex: 1,
    
  },
  pickerItem: {
    fontSize: 50,
    fontWeight: '400',
  },
  selectedItemOverlay: {
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    height:70,
    width: 100,
    backgroundColor: 'rgba(255,0,0,0)', // Temporarily visible for debugging
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    // Remove fixed height - let content determine height
  },
  customInput: {
    flex: 1,
    fontSize: 72, // Match picker item size
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 30,
    borderColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 20,
    textAlign: 'center',
  },
  symbol: {
    fontSize: 50, // Match picker scale
    fontWeight: '500',
    marginRight: 15,
  },
});

export default WheelAmountPicker; 