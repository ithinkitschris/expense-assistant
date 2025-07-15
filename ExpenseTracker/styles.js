import { StyleSheet } from 'react-native';

// Theme definitions
export const themes = {
  light: {
    background: '#ffffff',
    expenseCardBackground: 'rgba(255,255,255,0.8)',
    text: '#000000',
    textInvert: 'white',
    textSecondary: '#666666',
    textTertiary: '#999999',
    borderColor: 'rgba(0,0,0,0.5)',
    borderColorLighter: 'rgba(0,0,0,0.1)',
    glassBorderColor: 'white',
    headerBlur: 'rgba(0,0,0,0.75)',
    categoryBackground: 'rgba(255,255,255,0.85)',
    categorySelected: 'rgba(0,0,0,0.1)',
    categorySelectedText: '#0091ff',
    addButtonBackground: 'rgba(0,0,0,0.85)',
    gradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
    topGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.98)'],
    bottomGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.9)'],
    blurTint: 'light',
    statusBarStyle: 'dark',
    appleBlue: '#007AFF',
  },
  dark: {
    background: '#000000',
    expenseCardBackground: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    textInvert: 'black',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderColorLighter: 'rgba(255,255,255,0.1)',
    glassBorderColor: 'rgba(255,255,255,0.05)',
    headerBlur: 'rgba(255,255,255,0.15)',
    categoryBackground: 'rgba(255,255,255,0.03)',
    categorySelected: 'rgba(255,255,255,0.25)',
    categorySelectedText: '#0091ff',
    addButtonBackground: 'rgba(255,255,255,0.05)',
    gradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
    topGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)' , 'rgba(0,0,0,0.9)'],
    bottomGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)'],
    blurTint: 'dark',
    statusBarStyle: 'light',
    appleBlue: '#007AFF',
  }
};

export const createStyles = (theme) => StyleSheet.create({

  // #region BASE STYLES
  // Common text styles
  textBase: {
    color: theme.text,
  },
  
  textSecondary: {
    color: theme.textSecondary,
  },
  
  textTertiary: {
    color: theme.textTertiary,
  },
  
  // Common button styles
  buttonBase: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonPrimary: {
    backgroundColor: theme.appleBlue,
    color: 'white',
  },
  
  buttonSecondary: {
    backgroundColor: theme.categoryBackground,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },
  
  // Common container styles
  containerBase: {
    backgroundColor: theme.background,
  },
  
  cardBase: {
    backgroundColor: theme.expenseCardBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },
  
  // Common shadow styles
  shadowBase: {
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // #endregion

  // #region CONTAINERS
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  expenseList: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 120,
  },
  
  expenseListBottomPadding: {
    paddingBottom: 130,
  },
  // #endregion
  
  // #region DAY-BASED VIEW STYLES
  daysList: {
    flex: 1,
  },
  
  dayContainer: {
    flex: 1,
    paddingTop: 185, // Space for calendar + fixed header
  },
  
  dayExpensesList: {
    flex: 1,
  },
  
  dayExpensesContent: {
    paddingBottom: 20,
  },
  
  dayHeader: {
    position: 'absolute',
    top: 110, // Below calendar area
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  
  dayHeaderContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'start',
  },
  
  dayTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'left',
    marginBottom: 1,
    letterSpacing: 0,
  },
  
  daySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 0,
    textAlign: 'left',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // #endregion

  // #region EXPENSE CATEGORY SELECTOR
  
  expenseCategorySelector: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0)',
    overflow: 'hidden',
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  
  expenseCategorySelectorBackground: {
    flex: 1,
    backgroundColor: theme.categoryBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    
    elevation: 3,
    overflow: 'hidden',
  },
  
  expenseCategorySelectorScrollView: {
    overflow: 'hidden',
    borderRadius: 31,
  },
  
  expenseCategorySelectorContainer: {
    paddingHorizontal: 0,
    paddingVertical: 5,
    
  },
  
  expenseCategoryOptionContainer: {
    
    borderRadius: 50,
    minWidth: 0,
    overflow: 'hidden',
  },
  
  expenseCategoryOption: {
    flexDirection: 'row',
    borderRadius: 50,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 34,
  },
  
  expenseCategoryOptionSelected: {
    backgroundColor: theme.categorySelected,
    paddingHorizontal: 18,
    marginHorizontal: 5,
  },
  
  expenseCategoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    textTransform: 'capitalize',
    letterSpacing: -0.1,
  },
  
  expenseCategoryOptionTextSelected: {
    fontWeight: '600',
    color: theme.categorySelectedText,
  },
  
  expenseCategoryOptionAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.categorySelectedText,
    letterSpacing: -0.5,
  },
  // #endregion

  // #region VIEW SELECTOR
  viewSelectorWrapper: {
    position: 'absolute',
    bottom: 27,
    left: 15,
    right: 245,
    zIndex: 2,
    overflow: 'hidden',
    borderRadius: 20,
  },
  
  viewSelectorBackground: {
    flex: 1,
    backgroundColor: theme.categoryBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  
  viewSelectorScrollView: {
    overflow: 'hidden',
    borderRadius: 31,
  },
  
  viewSelectorContainer: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    
  },
  
  viewOptionContainer: {
    marginRight: -5,
    borderRadius: 50,
    minWidth: 60,
    overflow: 'hidden',
  },
  
  viewOption: {
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 7,
    minWidth: 60,
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  viewOptionSelected: {
    backgroundColor: theme.categorySelected,
  },
  
  viewOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
    textTransform: 'capitalize',
    marginTop: -1,
    letterSpacing: -0.1,
  },
  
  viewOptionTextSelected: {
    color: theme.categorySelectedText,
  },
  
  viewOptionAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    letterSpacing: -0.2,
  },
  
  viewOptionAmountSelected: {
    color: theme.categorySelectedText,
    opacity: 0.8,
  },
  // #endregion

  // #region SWIPEABLE EXPENSE ITEM
  swipeableContainer: {
    marginBottom: 12,
    position: 'relative',
  },

  actionButtonsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: theme.appleBlue,
  },

  deleteButton: {
    backgroundColor: '#FF3B30',
  },

  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  swipeableContent: {
    backgroundColor: theme.background,
  },
  // #endregion

  // #region EXPENSE ITEMS
  expenseItem: {
    backgroundColor: theme.expenseCardBackground,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.glassBorderColor,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'start',
  },

  expenseContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 15,
  },



  category: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 0,
    borderColor: theme.borderColorLighter,
    marginBottom: 15,
    marginLeft: 0,
    opacity: 0.4,
  },

  categoryText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textTertiary,
    marginLeft: 4,
    letterSpacing: -0.5,
    alignSelf: 'flex-start',
    opacity: 1,
  },
  
  expenseTitle: {
    fontSize: 48,
    fontWeight: '500',
    lineHeight: 44,
    color: theme.text,
    paddingTop: 5,
    letterSpacing: -0.1,
    flex: 4,
  },
  
  amount: {
    fontSize: 41,
    fontWeight: '300',
    color: theme.text,
    textAlign: 'right',
    letterSpacing: -0.8,
    flex: 1,
  },

  groceryItemsContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 0,
  },

  groceryItemsHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  groceryItems: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.text,
    lineHeight: 22,
    opacity: 0.8,
  },
  // #endregion

  // #region ADD BUTTON
  addButtonContainer: {
    position: 'absolute',
    bottom: 25,
    right: 10,
    zIndex: 1,
    elevation: 5,
    margin: 2,
  },
  
  addButton: {
    width: 62,
    height: 62,
    borderRadius: 50,
    borderWidth: 0,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    backgroundColor: theme.addButtonBackground,
  },
  
  blurContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  
  addButtonText: {
    color: theme.text, 
    fontSize: 50,
    fontWeight: '300',
    textAlign: 'center',
    paddingLeft: 2,
    lineHeight: 53,
  },
  
  addButtonDisabled: {
    opacity: 0.6,
  },
  // #endregion

  // #region LOADING & EMPTY STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  // #endregion

  // #region GRADIENTS
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },
  
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 0,
  },
  // #endregion

  // #region MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 5,
    overflow: 'hidden',
  },

  modalPill: {
    width: 40,
    height: 5,
    backgroundColor: theme.textSecondary,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 0,
    opacity: 0.3,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
  },

  modalTitle: {
    fontSize: 52,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: theme.text,
  },

  modalCancelButton: {
    fontSize: 16,
    color: theme.appleBlue,
    fontWeight: '400',
  },

  modalAddButton: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
    backgroundColor: theme.appleBlue,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
  },

  modalAddButtonDisabled: {
    opacity: 0.5,
  },

  modalSaveButton: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
    backgroundColor: theme.appleBlue,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
  },

  modalSaveButtonDisabled: {
    opacity: 0.5,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  modalField: {
    marginBottom: 35,
  },

  modalLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 20,
  },

  modalSubLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 18,
    backgroundColor: theme.background,
    color: theme.text,
  },

  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },

  modalCategoryOption: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: theme.categoryBackground,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },

  modalCategoryOptionSelected: {
    backgroundColor: theme.categorySelected,
  },

  modalCategoryText: {
    fontSize: 18,
    color: theme.text,
    textTransform: 'capitalize',
    fontWeight: '400',
  },

  modalCategoryTextSelected: {
    color: theme.categorySelectedText,
  },

  // Grocery confirmation modal styles
  groceryConfirmList: {
    marginTop: 15,
  },

  groceryConfirmItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },

  groceryConfirmItemText: {
    fontSize: 18,
    color: theme.text,
    fontWeight: '400',
  },

  groceryConfirmItemTextExisting: {
    fontSize: 18,
    color: theme.text,
    fontWeight: '400',
    opacity: 0.5,
  },
  // #endregion

  // #region TAB HEADER
  tabHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1,
    elevation: 0,
    shadowOpacity: 0,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.categoryBackground,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },

  tabButtonActive: {
    backgroundColor: theme.categorySelected,
  },

  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },

  tabButtonTextActive: {
    color: theme.categorySelectedText,
  },
  // #endregion

  // #region TOP CALENDAR
  calendarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 45,
    paddingBottom: 0,
    paddingHorizontal: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
  },

  calendarBackground: {
    backgroundColor: theme.categoryBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  calendarScrollView: {
    overflow: 'hidden',
    borderRadius: 20,
  },

  calendarContent: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 10,
  },

  calendarDay: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },

  calendarDayText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 2,
    color: theme.textSecondary,
    marginBottom: 2,
  },

  calendarDayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },

  calendarExpenseCount: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.text,
    marginTop: 4,
  },

  calendarToday: {
    borderWidth: 0,
    borderColor: theme.appleBlue,
  },
  // #endregion

  // #region GROCERY LIST
  groceryList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  groceryListContent: {
    paddingBottom: 100,
  },

  groceryListItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.categoryBackground,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  groceryListItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },

  groceryListItemDate: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 10,
  },
  // #endregion
}); 