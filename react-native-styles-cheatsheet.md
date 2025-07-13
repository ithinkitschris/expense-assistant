# React Native Styles Cheatsheet

## 📐 Layout & Dimensions

### Size Properties
```javascript
{
  width: 100,           // Fixed width in pixels
  width: '50%',         // Percentage of parent
  width: '100%',        // Full width
  height: 50,           // Fixed height
  height: 'auto',       // Auto height based on content
  minWidth: 100,        // Minimum width
  maxWidth: 200,        // Maximum width
  minHeight: 50,        // Minimum height
  maxHeight: 100,       // Maximum height
}
```

### Flexbox Layout
```javascript
{
  flex: 1,              // Take all available space
  flexDirection: 'row', // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap: 'wrap',     // 'wrap' | 'nowrap' | 'wrap-reverse'
  justifyContent: 'center', // 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems: 'center', // 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  alignSelf: 'center',  // Override alignItems for this item
  flexGrow: 1,          // How much to grow
  flexShrink: 1,        // How much to shrink
  flexBasis: 100,       // Initial size before growing/shrinking
}
```

## 🎨 Appearance & Colors

### Background & Colors
```javascript
{
  backgroundColor: '#4facfe',     // Hex color
  backgroundColor: 'blue',        // Named color
  backgroundColor: 'rgba(255, 0, 0, 0.5)', // RGBA with transparency
  backgroundColor: 'transparent', // Transparent background
  opacity: 0.8,                   // Overall transparency (0-1)
}
```

### Borders
```javascript
{
  borderWidth: 2,           // All borders
  borderTopWidth: 1,        // Individual borders
  borderRightWidth: 1,
  borderBottomWidth: 1,
  borderLeftWidth: 1,
  
  borderColor: '#333',      // All border colors
  borderTopColor: 'red',    // Individual border colors
  borderRightColor: 'blue',
  borderBottomColor: 'green',
  borderLeftColor: 'yellow',
  
  borderRadius: 10,         // All corners
  borderTopLeftRadius: 5,   // Individual corners
  borderTopRightRadius: 5,
  borderBottomLeftRadius: 5,
  borderBottomRightRadius: 5,
  
  borderStyle: 'solid',     // 'solid' | 'dotted' | 'dashed'
}
```

## 📝 Text Styling

### Font Properties
```javascript
{
  fontSize: 16,             // Text size
  fontWeight: 'bold',       // 'normal' | 'bold' | '100' | '200' | ... | '900'
  fontFamily: 'Arial',      // Font family name
  fontStyle: 'italic',      // 'normal' | 'italic'
  
  color: '#333',            // Text color
  textAlign: 'center',      // 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'center', // 'auto' | 'top' | 'bottom' | 'center'
  
  lineHeight: 20,           // Line spacing
  letterSpacing: 1,         // Character spacing
  textTransform: 'uppercase', // 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  
  textDecorationLine: 'underline', // 'none' | 'underline' | 'line-through'
  textDecorationColor: 'red',
  textDecorationStyle: 'solid',    // 'solid' | 'double' | 'dotted' | 'dashed'
}
```

## 📏 Spacing & Positioning

### Padding (Inner spacing)
```javascript
{
  padding: 10,              // All sides
  paddingVertical: 10,      // Top and bottom
  paddingHorizontal: 20,    // Left and right
  paddingTop: 5,            // Individual sides
  paddingRight: 10,
  paddingBottom: 5,
  paddingLeft: 10,
}
```

### Margin (Outer spacing)
```javascript
{
  margin: 10,               // All sides
  marginVertical: 10,       // Top and bottom
  marginHorizontal: 20,     // Left and right
  marginTop: 5,             // Individual sides
  marginRight: 10,
  marginBottom: 5,
  marginLeft: 10,
}
```

### Positioning
```javascript
{
  position: 'absolute',     // 'relative' | 'absolute' | 'fixed'
  top: 10,                  // Distance from top
  right: 10,                // Distance from right
  bottom: 10,               // Distance from bottom
  left: 10,                 // Distance from left
  zIndex: 1,                // Layer order (higher = on top)
}
```

## 🎭 Advanced Effects

### Shadow (iOS)
```javascript
{
  shadowColor: '#000',      // Shadow color
  shadowOffset: {           // Shadow position
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,      // Shadow transparency
  shadowRadius: 3.84,       // Shadow blur
}
```

### Elevation (Android)
```javascript
{
  elevation: 5,             // Material Design elevation
}
```

### Transform
```javascript
{
  transform: [
    { rotate: '45deg' },    // Rotation
    { scale: 1.2 },         // Scale up/down
    { translateX: 10 },     // Move horizontally
    { translateY: -5 },     // Move vertically
    { scaleX: 1.5 },        // Scale width only
    { scaleY: 0.8 },        // Scale height only
  ],
}
```

## 🎯 Button-Specific Examples

### Button Width Variations
```javascript
// Fixed width button
{
  width: 200,
  padding: 15,
  backgroundColor: '#4facfe',
  borderRadius: 10,
  alignItems: 'center',
}

// Full width button
{
  width: '100%',
  padding: 15,
  backgroundColor: '#4facfe',
  borderRadius: 10,
  alignItems: 'center',
}

// Responsive width button
{
  minWidth: 120,
  maxWidth: 300,
  paddingHorizontal: 20,
  paddingVertical: 15,
  backgroundColor: '#4facfe',
  borderRadius: 10,
  alignItems: 'center',
}
```

### Button Height Variations
```javascript
// Small button
{
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#4facfe',
  borderRadius: 5,
}

// Medium button
{
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: '#4facfe',
  borderRadius: 8,
}

// Large button
{
  paddingVertical: 16,
  paddingHorizontal: 32,
  backgroundColor: '#4facfe',
  borderRadius: 12,
}

// Fixed height button
{
  height: 50,
  paddingHorizontal: 20,
  backgroundColor: '#4facfe',
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
}
```

## 🔄 Interactive States

### Button States
```javascript
// Normal state
const buttonStyle = {
  backgroundColor: '#4facfe',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
}

// Pressed state
const buttonPressedStyle = {
  ...buttonStyle,
  backgroundColor: '#3d8bfe',
  transform: [{ scale: 0.95 }],
}

// Disabled state
const buttonDisabledStyle = {
  ...buttonStyle,
  backgroundColor: '#cccccc',
  opacity: 0.6,
}
```

## 🎬 Animations & Interactions

### Touchable Components
```javascript
import { TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Pressable } from 'react-native';

// TouchableOpacity - Reduces opacity when pressed
<TouchableOpacity
  style={buttonStyle}
  onPress={() => console.log('Button pressed!')}
  onPressIn={() => console.log('Press started')}
  onPressOut={() => console.log('Press ended')}
  onLongPress={() => console.log('Long press')}
  activeOpacity={0.7}        // Opacity when pressed (0-1)
  disabled={false}           // Disable interactions
  hitSlop={10}              // Expand touch area
  delayPressIn={0}          // Delay before onPressIn
  delayPressOut={100}       // Delay before onPressOut
  delayLongPress={500}      // Delay before onLongPress
>
  <Text>Touch Me!</Text>
</TouchableOpacity>

// TouchableHighlight - Shows highlight color when pressed
<TouchableHighlight
  style={buttonStyle}
  onPress={() => console.log('Highlighted!')}
  underlayColor="#3d8bfe"   // Color shown when pressed
  activeOpacity={0.7}
>
  <Text>Highlight Me!</Text>
</TouchableHighlight>

// TouchableWithoutFeedback - No visual feedback
<TouchableWithoutFeedback
  onPress={() => console.log('No feedback')}
>
  <View style={buttonStyle}>
    <Text>Silent Touch</Text>
  </View>
</TouchableWithoutFeedback>

// Pressable - Modern replacement with more control
<Pressable
  style={({ pressed }) => [
    buttonStyle,
    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
  ]}
  onPress={() => console.log('Pressed!')}
  onPressIn={() => console.log('Press in')}
  onPressOut={() => console.log('Press out')}
  onLongPress={() => console.log('Long press')}
  android_ripple={{ color: '#3d8bfe' }}  // Android ripple effect
>
  {({ pressed }) => (
    <Text style={{ color: pressed ? 'white' : 'black' }}>
      {pressed ? 'Pressed!' : 'Press Me'}
    </Text>
  )}
</Pressable>
```

### Animated API Examples
```javascript
import { Animated, Easing } from 'react-native';

// Create animated values
const fadeAnim = new Animated.Value(0);
const scaleAnim = new Animated.Value(1);
const slideAnim = new Animated.Value(-100);
const rotateAnim = new Animated.Value(0);

// Fade In Animation
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 1000,
  useNativeDriver: true,
}).start();

// Scale Animation
Animated.spring(scaleAnim, {
  toValue: 1.2,
  friction: 3,
  tension: 40,
  useNativeDriver: true,
}).start();

// Slide Animation
Animated.timing(slideAnim, {
  toValue: 0,
  duration: 500,
  easing: Easing.out(Easing.quad),
  useNativeDriver: true,
}).start();

// Rotation Animation
Animated.timing(rotateAnim, {
  toValue: 1,
  duration: 2000,
  easing: Easing.linear,
  useNativeDriver: true,
}).start();

// Sequence Animation (one after another)
Animated.sequence([
  Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
  Animated.timing(scaleAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
  Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();

// Parallel Animation (all at once)
Animated.parallel([
  Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
  Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
]).start();

// Loop Animation
Animated.loop(
  Animated.timing(rotateAnim, {
    toValue: 1,
    duration: 2000,
    easing: Easing.linear,
    useNativeDriver: true,
  })
).start();
```

### Animated Components Usage
```javascript
// Animated View
<Animated.View
  style={[
    buttonStyle,
    {
      opacity: fadeAnim,
      transform: [
        { scale: scaleAnim },
        { translateX: slideAnim },
        { rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        })},
      ],
    },
  ]}
>
  <Text>Animated Button</Text>
</Animated.View>

// Animated Text
<Animated.Text
  style={{
    fontSize: scaleAnim.interpolate({
      inputRange: [1, 1.5],
      outputRange: [16, 24],
    }),
    color: fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', 'black'],
    }),
  }}
>
  Animated Text
</Animated.Text>
```

### Common Animation Patterns
```javascript
// Button Press Animation
const handlePress = () => {
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();
};

// Bounce Animation
const bounceAnimation = () => {
  Animated.spring(scaleAnim, {
    toValue: 1.2,
    friction: 1,
    tension: 160,
    useNativeDriver: true,
  }).start(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  });
};

// Shake Animation
const shakeAnimation = () => {
  Animated.sequence([
    Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
    Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
    Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
    Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
  ]).start();
};

// Pulse Animation
const pulseAnimation = () => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ])
  ).start();
};
```

### Gesture Handlers
```javascript
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';

// Pan Gesture (drag)
<PanGestureHandler
  onGestureEvent={Animated.event(
    [{ nativeEvent: { translationX: slideAnim } }],
    { useNativeDriver: true }
  )}
>
  <Animated.View style={[buttonStyle, { transform: [{ translateX: slideAnim }] }]}>
    <Text>Drag Me!</Text>
  </Animated.View>
</PanGestureHandler>

// Tap Gesture
<TapGestureHandler
  onHandlerStateChange={(event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log('Tap detected!');
    }
  }}
>
  <Animated.View style={buttonStyle}>
    <Text>Tap Me!</Text>
  </Animated.View>
</TapGestureHandler>
```

### Custom Hook for Animations
```javascript
import { useRef, useEffect } from 'react';

const useButtonAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
    pressIn,
    pressOut,
  };
};

// Usage
const MyButton = () => {
  const { animatedStyle, pressIn, pressOut } = useButtonAnimation();

  return (
    <TouchableOpacity
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => console.log('Button pressed!')}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        <Text>Animated Button</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
```

## 💡 Pro Tips

1. **Use `alignItems: 'center'`** for centering content horizontally
2. **Use `justifyContent: 'center'`** for centering content vertically  
3. **Combine `paddingHorizontal` and `paddingVertical`** instead of individual padding values
4. **Use `flex: 1`** to make components take available space
5. **Use `borderRadius: height/2`** for perfectly rounded buttons
6. **Use `elevation` on Android and `shadow*` properties on iOS** for shadows
7. **Use `transform: [{ scale: 0.95 }]`** for press animations
8. **Always set `useNativeDriver: true`** for better performance on animations
9. **Use `Pressable` instead of `TouchableOpacity`** for modern React Native apps
10. **Combine multiple animations with `Animated.parallel()` or `Animated.sequence()`**

## 📱 Common Layout Patterns

### Centered Container
```javascript
{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
}
```

### Card Style
```javascript
{
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  margin: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

### Horizontal Button Row
```javascript
{
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  marginVertical: 10,
}
``` 