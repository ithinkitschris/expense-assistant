import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingState = ({ 
  message = "Loading...", 
  containerStyle = {},
  textStyle = {},
  styles = {}
}) => {
  return (
    <View style={[styles.loadingContainer, containerStyle]}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={[styles.loadingText, textStyle]}>
        {message}
      </Text>
    </View>
  );
};

export default LoadingState; 