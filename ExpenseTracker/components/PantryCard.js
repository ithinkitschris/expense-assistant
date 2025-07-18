import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const PantryCard = ({ 
  item, 
  theme, 
  disabled = false, 
  isExpanded, 
  onExpand, 
  onCollapse, 
  onDecrease, 
  onIncrease, 
  onLongPress,
  isConsumed = false 
}) => {
  useEffect(() => {
    let timer;
    if (isExpanded) {
      timer = setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 1000,
          create: {
            type: LayoutAnimation.Types.spring,
            property: LayoutAnimation.Properties.opacity,
            springDamping: 0.5
          },
          update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.5
          },
          delete: {
            type: LayoutAnimation.Types.spring,
            property: LayoutAnimation.Properties.opacity,
            springDamping: 0.5
          }
        });
        onCollapse();
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExpanded, onCollapse]);

  const handlePress = () => {
    if (!disabled && !isExpanded) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext({
        duration: 500,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.5
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.5
        },
        delete: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.5
        }
      });
      onExpand();
    }
  };

  const handleDecrease = () => {
    if (!disabled && item.quantity > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrease();
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  const buttonOpacity = disabled || item.quantity <= 0 ? 0.5 : 1;
  const plusButtonOpacity = disabled ? 0.5 : 1;

  // Helper function to capitalize grocery item names
  const capitalizeGroceryName = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.itemCardBackground, 
          borderColor: theme.glassBorderColor 
        },
        pressed && { 
          backgroundColor: theme.systemGray6,
          transform: [{ scale: 0.98 }]
        }
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={150}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      {/* Item Card Content */}
      <View style={styles.itemContent}>
        <Text style={[
          styles.itemName,
          { color: theme.text },
          isConsumed && styles.consumedItemName
        ]}>
          {capitalizeGroceryName(item.name)}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={[styles.quantityContainer, { backgroundColor: theme.glassBackground, borderColor: theme.borderColorLighter }]}>
        {isExpanded ? (
          // Expanded state with +/- buttons
          <>
            {/* Minus Button */}
            <Pressable
              style={[
                styles.button,
                styles.minusButton,
                { backgroundColor: theme.categorySelected, borderColor: theme.glassBorderColor, opacity: buttonOpacity }
              ]}
              onPress={handleDecrease}
              disabled={disabled || item.quantity <= 0}
              activeOpacity={0.7}
            >
              <SymbolView
                name="minus"
                size={18}
                type="monochrome"
                tintColor={theme.textSecondary}
                fallback={<Text style={[styles.buttonText, { color: theme.text }]}>-</Text>}
              />
            </Pressable>

            {/* Quantity Display */}
            <View style={styles.quantityDisplay}>
              <Text style={[
                styles.quantityText, 
                { color: theme.appleBlue, fontWeight: '400', fontSize: 30 }
              ]}> 
                {Math.round(item.quantity)} 
              </Text>
            </View>

            {/* Plus Button */}
            <Pressable
              style={[
                styles.button,
                styles.plusButton,
                { backgroundColor: theme.categorySelected, borderColor: theme.glassBorderColor, opacity: plusButtonOpacity }
              ]}
              onPress={handleIncrease}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <SymbolView
                name="plus"
                size={18}
                type="monochrome"
                tintColor={theme.textSecondary}
                fallback={<Text style={[styles.buttonText, { color: theme.text }]}>+</Text>}
              />
            </Pressable>
          </>
        ) : (
          // Collapsed state - just quantity
          <Pressable
            style={styles.collapsedQuantity}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.quantityText, 
              { color: theme.text }
            ]}> 
              {Math.round(item.quantity)} 
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingLeft: 25,
    paddingRight: 5,
    borderRadius: 50,
    marginBottom: 6,
    borderWidth: 1,
    gap: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '400',
  },
  consumedItemName: {
    opacity: 0.2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  collapsedQuantity: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 1.45,
  },
  button: {
    padding: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  minusButton: {
    opacity: 1,
    marginRight: 2,
  },
  plusButton: {
    opacity: 1,
    marginLeft: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quantityDisplay: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 22,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default PantryCard; 