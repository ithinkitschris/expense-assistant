# SF Symbols Guide for React Native Expo

## Overview
SF Symbols are Apple's system-provided iconography available in iOS apps. We're using the `expo-symbols` library to integrate them into our React Native app.

## Installation
```bash
npm install expo-symbols
```

## Basic Usage

### Import
```javascript
import { SymbolView } from 'expo-symbols';
```

### Basic Symbol
```javascript
<SymbolView
  name="heart.fill"
  size={24}
  type="monochrome"
  tintColor="#007AFF"
/>
```

## SymbolView Props

### Required Props
- `name` (string): The SF Symbol name (e.g., "heart.fill", "star", "plus.circle")

### Optional Props
- `size` (number): Size of the symbol in points (default: 17)
- `type` (string): Symbol rendering type
  - `"monochrome"`: Single color
  - `"hierarchical"`: Multiple opacity levels of the same color
  - `"palette"`: Multiple distinct colors
  - `"multicolor"`: Apple's predefined colors
- `tintColor` (string): Color for monochrome symbols
- `fallback` (ReactElement): Fallback component for Android/unsupported devices
- `style` (object): Additional styling
- `animationSpec` (object): Animation configuration

## Symbol Types & Examples

### Monochrome (Single Color)
```javascript
<SymbolView
  name="plus"
  size={28}
  type="monochrome"
  tintColor="#ffffff"
/>
```

### Hierarchical (Multiple Opacities)
```javascript
<SymbolView
  name="heart.fill"
  size={24}
  type="hierarchical"
  tintColor="#FF3B30"
/>
```

### Multicolor (Apple's Colors)
```javascript
<SymbolView
  name="globe.americas.fill"
  size={30}
  type="multicolor"
/>
```

## Animations

### Bounce Animation
```javascript
<SymbolView
  name="heart.fill"
  size={40}
  type="multicolor"
  animationSpec={{
    effect: {
      type: 'bounce',
    },
    repeating: true,
  }}
/>
```

### Scale Animation
```javascript
<SymbolView
  name="star.fill"
  size={30}
  animationSpec={{
    effect: {
      type: 'scale',
    },
    trigger: 'onAppear',
  }}
/>
```

## Common SF Symbol Names

### Interface
- `plus` - Add button
- `minus` - Remove/subtract
- `xmark` - Close/cancel
- `checkmark` - Confirm/success
- `gear` - Settings
- `ellipsis` - More options

### Finance & Shopping
- `creditcard.fill` - Payment/finance
- `dollarsign.circle.fill` - Money/price
- `cart.fill` - Shopping cart
- `bag.fill` - Shopping bag
- `receipt.fill` - Receipt/bill

### Transportation
- `car.fill` - Car/driving
- `airplane` - Travel/flight
- `bus.fill` - Public transport
- `bicycle` - Cycling

### Food & Dining
- `fork.knife` - Dining/restaurant
- `cup.and.saucer.fill` - Cafe/coffee
- `leaf.fill` - Healthy/organic

### Entertainment
- `tv.fill` - Entertainment/streaming
- `gamecontroller.fill` - Gaming
- `music.note` - Music
- `film.fill` - Movies

### Actions
- `pencil` - Edit
- `trash.fill` - Delete
- `square.and.arrow.up` - Share
- `heart.fill` - Favorite
- `bookmark.fill` - Save

### Categories (Used in Our App)
- `chart.bar.fill` - All/analytics
- `shippingbox.fill` - Amazon/shipping
- `tshirt.fill` - Fashion/clothing
- `calendar` - Monthly/recurring

## Platform Compatibility

### iOS
SF Symbols work natively and look great with system theming.

### Android
Use fallback components for Android compatibility:

```javascript
<SymbolView
  name="heart.fill"
  size={24}
  type="monochrome"
  tintColor="#FF3B30"
  fallback={
    <Text style={{ color: '#FF3B30', fontSize: 24 }}>♥</Text>
  }
/>
```

## Best Practices

### 1. Always Provide Fallbacks
```javascript
<SymbolView
  name="plus"
  fallback={<Text style={styles.addButtonText}>+</Text>}
/>
```

### 2. Match Your App's Theme
```javascript
<SymbolView
  name="heart.fill"
  tintColor={isDarkMode ? '#ffffff' : '#000000'}
/>
```

### 3. Consistent Sizing
Use consistent sizes across similar UI elements:
- Small icons: 16px
- Medium icons: 24px
- Large buttons: 28px+

### 4. Choose Appropriate Types
- Use `monochrome` for simple, themed interfaces
- Use `hierarchical` for subtle depth
- Use `multicolor` sparingly for special elements

## Examples from Our App

### Add Button
```javascript
<SymbolView
  name="plus"
  size={28}
  type="monochrome"
  tintColor={currentTheme.text}
  fallback={<Text style={styles.addButtonText}>+</Text>}
/>
```

### Category Icons
```javascript
<SymbolView
  name="cart.fill"
  size={16}
  type="monochrome"
  tintColor={isSelected ? theme.selectedText : theme.secondaryText}
  style={{ marginRight: 4 }}
/>
```

### Action Buttons
```javascript
// Edit Button
<SymbolView
  name="pencil"
  size={20}
  type="monochrome"
  tintColor="white"
/>

// Delete Button
<SymbolView
  name="trash.fill"
  size={20}
  type="monochrome"
  tintColor="white"
/>
```

## Finding More SF Symbols

1. **SF Symbols App**: Download from Apple Developer portal
2. **Online Browser**: Visit [SF Symbols Browser](https://developer.apple.com/sf-symbols/)
3. **Documentation**: Check Apple's SF Symbols documentation

## Troubleshooting

### Symbol Not Displaying
- Check the symbol name spelling
- Ensure the symbol exists in the current iOS version
- Provide a fallback component

### Wrong Size/Color
- Verify `size` and `tintColor` props
- Check if `type` affects appearance
- Use style prop for additional customization

### Performance
- SF Symbols are optimized and lightweight
- No need to preload or cache
- Use sparingly with animations 