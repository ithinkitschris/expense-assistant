import React from 'react';
import { View, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

const EmptyState = ({ 
  title, 
  subtitle, 
  icon = "tray", 
  iconSize = 54,
  containerStyle = {},
  textStyle = {},
  subtitleStyle = {},
  styles = {},
  theme
}) => {
  return (
    <View style={[styles.emptyContainer, containerStyle]}>
      <SymbolView
        name={icon}
        size={iconSize}
        type="outline"
        tintColor={theme?.textTertiary || '#787880'}
        fallback={null}
      />
      <Text style={[styles.emptyText, textStyle]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default EmptyState; 