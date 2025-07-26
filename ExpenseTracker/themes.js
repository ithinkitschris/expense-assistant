// Theme definitions using Apple's official UI color palette
export const themes = {
  light: {
    // System colors
    background: 'rgba(255,255,255,0.98)', // System Gray 6
    itemCardBackground: 'rgba(252,252,252,1)', // System Background
    text: '#000000', // Label (Primary)
    textInvert: '#FFFFFF', // System Background
    textSecondary: '#3C3C43', // Label (Secondary) 
    textTertiary: '#787880', // Label (Tertiary)
    borderColorLighter: '#C6C6C8', // Separator
    glassBackground: 'rgba(255,255,255,0)', // System Background with transparency
    glassBorderColor: 'rgba(255,255,255,0.2)', // Separator with transparency
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
    systemRed: '#FF453A',
    systemOrange: '#FF9F0A',
    systemYellow: '#FFD60A',
    systemGreen: '#4ad969',
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

    // Shadow tokens optimized for light mode
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dark: {
    // System colors
    background: '#000000', // System Background
    itemCardBackground: 'rgba(255,255,255,0.11)', // Darker than Secondary System Background
    text: '#FFFFFF', // Label (Primary)
    textInvert: '#000000', // System Background
    textSecondary: '#FFFFFF80', // Label (Secondary) (50% opacity)
    textTertiary: '#EBEBF560', // Label (Tertiary) with 60% opacity
    borderColorLighter: '#38383A', // Separator
    glassBackground: 'rgba(255,255,255,0.1)', // white with 20% opacity
    glassBorderColor: 'rgba(255,255,255,0.08)', // Separator with 20% white opacity
    categorySelected: 'rgba(255,255,255,0.2)', // 15% white overlay for selection
    categoryIconColor: '#8E8E93', // System Gray 3
    
    // Gradients using Apple's system colors
    topGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)'],
    bottomGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
    
    // System properties
    blurTint: 'dark',
    statusBarStyle: 'light',
    
    // Apple's system blue
    appleBlue: '#0A84FF', // System Blue (Dark)
    
    // Additional Apple system colors for future use
    systemRed: '#FF453A',
    systemOrange: '#FF9F0A',
    systemYellow: '#FFD60A',
    systemGreen: '#4ad969',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  }
}; 

// Centralized grocery category color mapping - single source of truth
export const getGroceryCategoryColor = (type, theme) => {
  const colorMap = {
    'all': theme.appleBlue,
    'produce': theme.systemMint,      // Green for fresh produce
    'meat': theme.systemPink,         // Red for meat
    'dairy': theme.systemGray,        // Blue for dairy
    'staples': theme.systemBrown,     // Brown for staples (rice, pasta, bread, etc.)
    'pantry': theme.systemOrange,     // Orange for pantry staples
    'frozen': theme.systemCyan,       // Light blue for frozen
    'beverages': theme.systemIndigo,  // Purple for beverages
    'snacks': theme.systemPurple,     // Purple for snacks
    'condiments': theme.systemPink,   // Pink for condiments
    'other': theme.systemGray,        // Gray for other
    'consumed': theme.systemGray      // Gray for consumed items
  };
  return colorMap[type] || colorMap['other'];
};

// Centralized expense category color mapping - single source of truth
export const getExpenseCategoryColor = (category, theme) => {
  const colorMap = {
    'all': theme.appleBlue,
    'amazon': theme.systemBrown,
    'entertainment': theme.systemPurple,
    'fashion': theme.systemPink,
    'food': theme.systemRed,
    'furniture': theme.systemOrange,
    'groceries': theme.systemMint,
    'monthly': theme.systemGray,
    'other': theme.systemGray,
    'transportation': theme.systemIndigo,
    'travel': theme.systemCyan,
    'subscriptions': theme.systemYellow,
  };
  return colorMap[category] || theme.appleBlue;
}; 