// Theme definitions using Apple's official UI color palette
export const themes = {
  light: {
    // System colors
    background: '#FFFFFF', // System Gray 6
    itemCardBackground: '#FFFFFF', // System Background
    text: '#000000', // Label (Primary)
    textInvert: '#FFFFFF', // System Background
    textSecondary: '#3C3C43', // Label (Secondary) 
    textTertiary: '#787880', // Label (Tertiary)
    borderColorLighter: '#C6C6C8', // Separator
    glassBackground: 'rgba(255,255,255,0.8)', // System Background with transparency
    glassBorderColor: 'rgba(198,198,200,0.5)', // Separator with transparency
    categorySelected: '#E5E5EA', // System Gray 5
    categoryIconColor: '#8E8E93', // System Gray 3
    
    // Gradients using Apple's system colors
    topGradient: ['rgba(242,242,247,0)', 'rgba(242,242,247,0.9)', 'rgba(242,242,247,0.98)'],
    bottomGradient: ['rgba(242,242,247,0)', 'rgba(242,242,247,0.2)', 'rgba(242,242,247,0.9)'],
    
    // System properties
    blurTint: 'light',
    statusBarStyle: 'dark',
    
    // Apple's system blue
    appleBlue: '#007AFF', // System Blue
    
    // Additional Apple system colors for future use
    systemRed: '#FF3B30',
    systemOrange: '#FF9500', 
    systemYellow: '#FFCC00',
    systemGreen: '#34C759',
    systemMint: '#00C7BE',
    systemTeal: '#5AC8FA',
    systemCyan: '#32ADE6',
    systemIndigo: '#5856D6',
    systemPurple: '#AF52DE',
    systemPink: '#FF2D92',
    systemBrown: '#A2845E',
    systemGray: '#8E8E93',
    systemGray2: '#AEAEB2',
    systemGray3: '#C7C7CC',
    systemGray4: '#D1D1D6',
    systemGray5: '#E5E5EA',
    systemGray6: '#F2F2F7',

    // Shadow tokens optimized for light mode
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dark: {
    // System colors
    background: '#000000', // System Background
    itemCardBackground: '#111112', // Darker than Secondary System Background
    text: '#FFFFFF', // Label (Primary)
    textInvert: '#000000', // System Background
    textSecondary: '#EBEBF5', // Label (Secondary)
    textTertiary: '#EBEBF599', // Label (Tertiary) with 60% opacity
    borderColorLighter: '#38383A', // Separator
    glassBackground: 'rgba(28,28,30,0.8)', // Secondary System Background with transparency
    glassBorderColor: 'rgba(56,56,58,0.5)', // Separator with transparency
    categorySelected: '#48484A', // Tertiary System Background
    categoryIconColor: '#8E8E93', // System Gray 3
    
    // Gradients using Apple's system colors
    topGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)'],
    bottomGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
    
    // System properties
    blurTint: 'dark',
    statusBarStyle: 'light',
    
    // Apple's system blue
    appleBlue: '#0A84FF', // System Blue (Dark)
    
    // Additional Apple system colors for future use
    systemRed: '#FF453A',
    systemOrange: '#FF9F0A',
    systemYellow: '#FFD60A',
    systemGreen: '#30D158',
    systemMint: '#63E6E2',
    systemTeal: '#40C8E0',
    systemCyan: '#64D2FF',
    systemIndigo: '#5E5CE6',
    systemPurple: '#BF5AF2',
    systemPink: '#FF375F',
    systemBrown: '#A2845E',
    systemGray: '#8E8E93',
    systemGray2: '#636366',
    systemGray3: '#48484A',
    systemGray4: '#3A3A3C',
    systemGray5: '#2C2C2E',
    systemGray6: '#1C1C1E',

    // Shadow tokens optimized for dark mode
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
}; 