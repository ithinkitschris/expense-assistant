import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';

const WheelAmountPicker = ({ value, onValueChange, theme }) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Parse the current value into dollars only
  const currentValue = parseInt(value) || 0;

  // Generate array for dollar picker (0 to 9999)
  const dollarOptions = Array.from({ length: 10000 }, (_, i) => i);

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
    if (customValue < 0 || customValue > 99999) {
      Alert.alert('Invalid Amount', 'Please enter a value between $0 and $99,999');
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
        <View style={styles.customInputContainer}>
          <Text style={[styles.symbol, { color: theme.text }]}>$</Text>
          <TextInput
            style={[styles.customInput, { 
              color: theme.text, 
              borderColor: theme.borderColor,
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
  },
  picker: {
    flex: 1,
    
  },
  pickerItem: {
    fontSize: 72,
    fontWeight: '500',
  },
  selectedItemOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    height: 40,
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
    // Remove fixed height - let content determine height
  },
  customInput: {
    flex: 1,
    fontSize: 50, // Match picker item size
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: 'center',
  },
  symbol: {
    fontSize: 50, // Match picker scale
    fontWeight: '500',
    marginRight: 15,
  },
});

export default WheelAmountPicker; 