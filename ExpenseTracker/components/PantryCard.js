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
  isConsumed = false,
  groceryType = 'other'
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



  // Get color for grocery type
  const getGroceryTypeColor = (type) => {
    const colorMap = {
      'produce': theme.systemMint,      // Green for fresh produce
      'meat': theme.systemPink,           // Red for meat
      'dairy': theme.systemGray,          // Blue for dairy
      'bread': theme.systemBrown,       // Orange for bread/bakery
      'pantry': theme.systemOrange,        // Gray for pantry staples
      'frozen': theme.systemCyan,        // Light blue for frozen
      'beverages': theme.systemIndigo,   // Purple for beverages
      'snacks': theme.systemPurple,      // Yellow for snacks
      'condiments': theme.systemPink,    // Pink for condiments
      'other': theme.systemGray,         // Gray for other
      'consumed': theme.systemGray       // Gray for consumed items
    };
    return colorMap[type] || colorMap['other'];
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: 'rgba(0,0,0,0.2)', // black with 20% opacity
          borderColor: 'rgba(255,255,255,0.1)' // white at 15% opacity
        },
        pressed && { 
          backgroundColor: getGroceryTypeColor(groceryType) + '33', // 20% opacity
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
        <Text 
          style={[
            styles.itemName,
            { color: theme.text}, // Use theme text color
            isConsumed && styles.consumedItemName
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {capitalizeGroceryName(item.name)}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View
        style={[
          styles.quantityContainer,
          {
            backgroundColor: getGroceryTypeColor(groceryType) + 'CC', // category color at 50% opacity
          }
        ]}
      >
        
        {isExpanded ? (
          // Expanded state with +/- buttons
          <>
            {/* Minus Button */}
            <Pressable
              style={[
                styles.button,
                styles.minusButton,
                { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: theme.glassBorderColor, opacity: buttonOpacity }
              ]}
              onPress={handleDecrease}
              disabled={disabled || item.quantity <= 0}
              activeOpacity={0.7}
            >
              <SymbolView
                name="minus"
                size={16}
                type="monochrome"
                tintColor="#000000"
                fallback={<Text style={[styles.buttonText, { color: theme.text }]}>-</Text>}
              />
            </Pressable>

            {/* Quantity Display */}
            <View style={styles.quantityDisplay}>
              <Text style={[
                styles.quantityText, 
                { color: theme.text, fontWeight: '600', fontSize: 30 }
              ]}> 
                {Math.round(item.quantity)} 
              </Text>
            </View>

            {/* Plus Button */}
            <Pressable
              style={[
                styles.button,
                styles.plusButton,
                { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: theme.glassBorderColor, opacity: plusButtonOpacity }
              ]}
              onPress={handleIncrease}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <SymbolView
                name="plus"
                size={16}
                type="monochrome"
                tintColor="000000"
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
    paddingLeft: 15,
    paddingRight: 5,
    borderRadius: 50,
    marginBottom: 5,
    borderWidth: 1,
    gap: 10,
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
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.25,
  },
  consumedItemName: {
    opacity: 0.2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  collapsedQuantity: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 21,
  },
  button: {
    padding: 8,
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
    fontSize: 0,
    fontWeight: '600',
  },
  quantityDisplay: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    borderWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 0,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1,
    paddingLeft: 2,
  },
});

export default PantryCard; 