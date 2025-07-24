import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Helper to shift hue of a hex color
function hexToHSL(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0,2), 16) / 255;
  const g = parseInt(hex.substring(2,4), 16) / 255;
  const b = parseInt(hex.substring(4,6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h * 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l, alpha = 1) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  let hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  if (alpha < 1) {
    hex += Math.round(alpha * 255).toString(16).padStart(2, '0');
  }
  return hex;
}

function shiftHue(hex, degree, alpha = 1) {
  const { h, s, l } = hexToHSL(hex);
  const newH = (h + degree) % 360;
  return hslToHex(newH, s, l, alpha);
}

// ExpenseCardTotal Component - Completely independent
const ExpenseCardTotal = ({
  item,
  styles,
  onPress,
  onEdit,
  onDelete,
  getCategoryIcon,
  cardColor,
  ...rest
}) => {

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 && onEdit) {
            onEdit(item);
          } else if (buttonIndex === 2 && onDelete) {
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
              ]
            );
          }
        }
      );
    } else {
      console.log('Action sheet not supported on Android');
    }
  };

  return (
    <Pressable
      style={[styles.expenseCardTotal, { padding: 0, overflow: 'hidden' }]}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onEdit && onEdit(item)}
    >
      <LinearGradient
        colors={cardColor ? [cardColor, shiftHue(cardColor, 20)] : [styles.expenseCardTotal.backgroundColor, styles.expenseCardTotal.backgroundColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 2 }}
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: styles.expenseCardTotal.borderRadius || 27.5 }]}
      />
      {/* Header with category and menu button */}
      <View style={styles.expenseHeaderTotal}>
        <View style={styles.category}>
          <SymbolView
            name={getCategoryIcon(item.category)}
            size={24}
            type="monochrome"
            tintColor="#FFFFFF"
            fallback={null}
          />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={showActionSheet}
          activeOpacity={0.6}
        >
          <SymbolView
            name="ellipsis"
            size={14}
            type="monochrome"
            tintColor="white"
            fallback={null}
          />
        </TouchableOpacity>
      </View>

      {/* Expense Description and Amount Container */}
      <View style={styles.expenseContentContainerTotal}>
        <Text style={styles.expenseCardTotalTitle}>{item.description}</Text>
        <Text style={styles.expenseCardTotalAmount}>
          {Number.isInteger(item.amount) ? `$${item.amount}` : `$${Number(item.amount).toFixed(2).replace(/\.00$/, '')}`}
        </Text>
      </View>
    </Pressable>
  );
};

// ExpenseCardCategory Component - Completely independent
const ExpenseCardCategory = ({
  item,
  styles,
  onPress,
  onEdit,
  onDelete,
  getCategoryIcon,
  cardColor,
  ...rest
}) => {

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 && onEdit) {
            onEdit(item);
          } else if (buttonIndex === 2 && onDelete) {
            Alert.alert(
              'Delete Expense',
              `Are you sure you want to delete "${item.description}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
              ]
            );
          }
        }
      );
    } else {
      console.log('Action sheet not supported on Android');
    }
  };

  // Helper to get color for the icon
  const iconColor = cardColor || (styles.expenseCardCategoryAmount && styles.expenseCardCategoryAmount.color) || '#000';

  return (
    <Pressable
      style={styles.expenseCardCategory}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onEdit && onEdit(item)}
    >
      {/* Main content container with icon, title on left, date + amount on right */}
      <View style={styles.expenseContentContainerCategory}>
        {/* Icon and Title Row */}
        <View style={styles.expenseCardCategoryLeft}>
          {/* <SymbolView
            name={getCategoryIcon(item.category)}
            size={28}
            type="monochrome"
            tintColor={iconColor}
            fallback={null}
            style={{ alignSelf: 'flex-start' }}
          /> */}
          <View style={styles.expenseCardCategoryTitleContainer}>
            <Text style={[styles.expenseCardCategoryName, { color: cardColor || styles.expenseCardCategoryName.color }]}>{item.category}</Text>
            <Text style={[styles.expenseCardCategoryTitle, styles.expenseCardCategoryTitleFlex]}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.expenseCardCategoryRightContainer}>
          <Text style={[styles.date, styles.expenseCardCategoryDate]}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={[styles.expenseCardCategoryAmount, styles.expenseCardCategoryAmountFlex, { color: cardColor || styles.expenseCardCategoryAmount.color }]}> 
            {Number.isInteger(item.amount) ? `$${item.amount}` : `$${Number(item.amount).toFixed(2).replace(/\.00$/, '')}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export { ExpenseCardTotal, ExpenseCardCategory }; 