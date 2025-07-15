import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Dimensions, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;
const ACTION_BUTTON_WIDTH = 80;

const SwipeableExpenseItem = ({ 
  item, 
  styles, 
  groceryItems, 
  onEdit, 
  onDelete 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const handleGestureEvent = ({ nativeEvent }) => {
    let newTranslationX = nativeEvent.translationX;
    
    if (isSwipedOpen) {
      // When open, allow movement from current position (-160) back to 0
      newTranslationX = -ACTION_BUTTON_WIDTH * 2 + nativeEvent.translationX;
    } else {
      // When closed, only allow left movement (negative values)
      newTranslationX = Math.min(0, nativeEvent.translationX);
    }
    
    translateX.setValue(newTranslationX);
  };

  const handleStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { translationX, velocityX } = nativeEvent;
      
      let shouldOpen;
      
      if (isSwipedOpen) {
        // When already open, determine if we should close based on right swipe
        const currentPosition = -ACTION_BUTTON_WIDTH * 2 + translationX;
        shouldOpen = currentPosition < SWIPE_THRESHOLD && velocityX < 500;
      } else {
        // When closed, determine if we should open based on left swipe
        shouldOpen = translationX < SWIPE_THRESHOLD || velocityX < -1000;
      }
      
      if (shouldOpen) {
        // Snap to open position
        Animated.spring(translateX, {
          toValue: -ACTION_BUTTON_WIDTH * 2, // Width for both buttons
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start();
        setIsSwipedOpen(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Snap back to closed position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start();
        setIsSwipedOpen(false);
      }
    }
  };

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
    setIsSwipedOpen(false);
  };

  const handlePress = () => {
    if (isSwipedOpen) {
      closeSwipe();
    }
    // Removed tap-to-edit functionality - only swipe to reveal edit button
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSwipe();
    onEdit(item);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${item.description}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: closeSwipe,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            closeSwipe();
            onDelete(item.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Action buttons (always rendered, positioned behind) */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>

      {/* Main content (swipeable) */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-15, 15]}
      >
        <Animated.View
          style={[
            styles.swipeableContent,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <Pressable 
            style={styles.expenseItem}
            onPress={handlePress}
          >
            {/* Expense Header */}
            <View style={styles.expenseHeader}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>
                {new Date(item.timestamp).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            {/* Expense Description */} 
            <Text style={styles.expenseTitle}>{item.description}</Text>

            {/* Grocery Items Display */}
            {item.category === 'groceries' && groceryItems[item.id] && (
              <View style={styles.groceryItemsContainer}>
                <Text style={styles.groceryItemsHeader}>Items:</Text>
                <Text style={styles.groceryItems}>
                  {groceryItems[item.id].map(grocery => grocery.name).join(', ')}
                </Text>
              </View>
            )}

            {/* Expense Amount */}
            <Text style={styles.amount}>${Number(item.amount).toFixed()}</Text>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeableExpenseItem; 