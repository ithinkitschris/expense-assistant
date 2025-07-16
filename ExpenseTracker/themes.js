// Theme definitions
export const themes = {
  light: {
    background: 'rgba(0,0,0,0.04)',
    expenseCardBackground: 'rgba(250,250,250,1)',
    text: '#111111',
    textInvert: 'white',
    textSecondary: '#666666',
    textTertiary: '#999999',
    borderColorLighter: 'rgba(255,255,255,0.7)',
    glassBackground: 'rgba(250,250,250,0.3)',
    glassBorderColor: 'rgba(255,255,255,0.5)',
    categorySelected: 'rgba(0,0,0,0.1)',
    categoryIconColor: '#777777',
    topGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.98)'],
    bottomGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)'],
    blurTint: 'light',
    statusBarStyle: 'dark',
    appleBlue: '#0091ff',

    // Shadow tokens
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dark: {
    background: '#000000',
    expenseCardBackground: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    textInvert: 'black',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.3)',
    borderColorLighter: 'rgba(255,255,255,0.1)',
    glassBackground: 'rgba(255,255,255,0.04)',
    glassBorderColor: 'rgba(255,255,255,0.07)',
    categorySelected: 'rgba(255,255,255,0.25)',
    categoryIconColor: '#888888',
    topGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)' , 'rgba(0,0,0,0.9)'],
    bottomGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
    blurTint: 'dark',
    statusBarStyle: 'light',
    appleBlue: '#0091ff',

    // Shadow tokens
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
}; 