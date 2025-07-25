import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const ViewSelector = ({
  activeTab,
  setActiveTab,
  hideUI,
  viewSelectorIconSize,
  viewSelectorTextOpacity,
  viewSelectorPadding,
  handleCategoryScroll,
  currentTheme,
  styles
}) => {
  // Helper function to render a single view option
  const renderViewOption = (optionKey, icon, label) => (
    <Pressable
      key={optionKey}
      style={styles.viewOptionContainer}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(optionKey);
      }}
    >
      <BlurView 
        intensity={activeTab === optionKey && !hideUI ? 30 : 0} 
        tint={currentTheme.blurTint} 
        style={[
          styles.viewOption,
          activeTab === optionKey && (hideUI ? styles.viewOptionSelectedCompact : styles.viewOptionSelected),
          hideUI && styles.viewOptionCompact
        ]}
      >
        <Animated.View style={{ transform: [{ scale: viewSelectorIconSize }] }}>
          <SymbolView
            name={icon}
            size={34} // Keep at max size, use scale for animation
            type="monochrome"
            tintColor={activeTab === optionKey ? currentTheme.appleBlue : currentTheme.text}
            fallback={null}
          />
        </Animated.View>
        <Animated.View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            opacity: viewSelectorTextOpacity
          }}
        >
          <Animated.Text style={[
            styles.viewOptionText,
            activeTab === optionKey && styles.viewOptionTextSelected
          ]}>
            {label}
          </Animated.Text>
        </Animated.View>
      </BlurView>
    </Pressable>
  );

  // When UI is hidden, only show active tab, otherwise show both
  const viewOptions = hideUI 
    ? [
        activeTab === 'expenses' && renderViewOption('expenses', 'creditcard.fill', 'Expenses'),
        activeTab === 'pantry' && renderViewOption('pantry', 'basket.fill', 'Pantry'),
      ].filter(Boolean)
    : [
        renderViewOption('expenses', 'creditcard.fill', 'Expenses'),
        renderViewOption('pantry', 'basket.fill', 'Pantry'),
      ];

  return (
    <Animated.View style={[
      styles.viewSelectorWrapper,
      hideUI && styles.viewSelectorWrapperCompact
    ]}>
      {/* Background Container with ScrollView inside */}
      <BlurView
        intensity={20}
        tint={currentTheme.blurTint}
        style={[
          styles.viewSelectorBackground,
          hideUI && styles.viewSelectorBackgroundCompact
        ]}
      >
        <Animated.ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.viewSelectorScrollView}
          contentContainerStyle={[
            styles.viewSelectorContainer,
            hideUI && styles.viewSelectorContainerCompact
          ]}
          onScroll={handleCategoryScroll}
          scrollEventThrottle={16}
          scrollEnabled={!hideUI} // Disable scrolling when compact
        >
          {viewOptions}
        </Animated.ScrollView>
      </BlurView>
    </Animated.View>
  );
};

export default ViewSelector; 