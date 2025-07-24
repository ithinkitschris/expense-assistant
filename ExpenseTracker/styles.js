import { StyleSheet } from 'react-native';

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
  
  categoryIconColor: {
    color: theme.categoryIconColor,
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
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },
  
  // Common container styles
  containerBase: {
    backgroundColor: theme.background,
  },
  
  cardBase: {
    backgroundColor: theme.itemCardBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
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
  
  // Category-specific expense list styles
  categoryExpensesList: {
    flex: 1,
    paddingTop: 120, // Space for category selector
  },
  
  categoryExpensesContent: {
    paddingBottom: 150, // Space for bottom UI elements
    paddingTop: 20,
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
    letterSpacing: -0.2,
  },
  
  daySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 0,
    textAlign: 'left',
    fontWeight: '500',
    letterSpacing: -0.3,
  },

  // Day section styles for grouped expenses
  daySectionContainer: {
    marginTop: 10,
    marginBottom: 40, 
  },
  
  daySectionHeader: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  
  daySectionTitle: {
    fontSize: 40,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.2,
  },
  
  daySectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textTertiary,
    letterSpacing: -0.2,
    marginLeft: 0,
  },

  // #endregion

  // #region EXPENSE CATEGORY SELECTOR
  
  expenseCategorySelector: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: theme.glassBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: theme.glassBorderColor,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 5,
  },
  
  expenseCategorySelectorBackground: {
    flex: 1,
    borderRadius: 35,
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
    color: theme.appleBlue,
  },
  
  expenseCategoryOptionAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.appleBlue,
    letterSpacing: -0.5,
  },
  // #endregion

  // #region VIEW SELECTOR
  viewSelectorWrapper: {
    position: 'absolute',
    bottom: 27,
    left: 20,
    right: 245,
    zIndex: 5,

    borderRadius: 35,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 3,
  },
  
  viewSelectorBackground: {
    flex: 1,
    backgroundColor: theme.glassBackground,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: theme.glassBorderColor,
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
    minWidth: 80,
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
    color: theme.appleBlue,
  },
  
  viewOptionAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    letterSpacing: -0.2,
  },
  
  viewOptionAmountSelected: {
    color: theme.appleBlue,
    opacity: 0.8,
  },
  // #endregion

  // #region EXPENSE ITEMS
  
    // #region EXPENSECARD TOTAL
    expenseContentContainerTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },

    expenseCardTotal: {
      backgroundColor: theme.itemCardBackground,
      marginHorizontal: 20,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: theme.glassBorderColor,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingTop: 11.5,
      paddingBottom: 17.5,
      shadowColor: theme.shadowColor,
      shadowOffset: theme.shadowOffset,
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: theme.shadowRadius,
    },
    
    expenseCardTotalTitle: {
      fontSize: 30,
      fontWeight: '500',
      lineHeight: 32,
      color: theme.text,
      letterSpacing: -0.2,
      marginTop: 10,
      flex: 4,
    },

    expenseCardTotalAmount: {
      fontSize: 34,
      fontWeight: '400',
      lineHeight: 48,
      color: theme.text,
      textAlign: 'right',
      textAlignVertical: 'bottom',
      letterSpacing: -0.6,
      opacity: 1,
      marginBottom: -5,
      flex: 1,
    },

    expenseHeaderTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: -6,
    },

    category: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 0,
      borderColor: theme.borderColorLighter,
      marginLeft: -3,
      opacity: 0.75,
    },

    categoryText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
      letterSpacing: -0.2,
      textTransform: 'capitalize',
      opacity: 0.8,
    },
    
    menuButton: {
      padding: 6,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0)',
      opacity: 1,
      borderWidth: 0,
      borderColor: theme.glassBorderColor,
    },

    // #endregion

    // #region EXPENSECARD CATEGORY

  expenseContentContainerCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  expenseCardCategory: {
    backgroundColor: theme.itemCardBackground,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.glassBorderColor,
    borderRadius: 25,
    paddingLeft: 20,
    paddingHorizontal: 20,
    paddingTop: 12.5,
    paddingBottom: 12.5,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
  },
  // Left section: icon + title (row, top-aligned)
  expenseCardCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  // Title column container for category and description
  expenseCardCategoryTitleContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  expenseCardCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    letterSpacing: -0.2,
    textTransform: 'capitalize',
    marginBottom: 10,
    opacity: 1,
  },
  
  expenseCardCategoryTitle: {
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 32,
    color: theme.text,
    letterSpacing: -0.1,
  },
  
  // Remove flex from titleFlex, keep only alignment for legacy support
  expenseCardCategoryTitleFlex: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  date: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.text,
    letterSpacing: -0.4,
    textTransform: 'capitalize',
    marginBottom: 4,
    marginLeft: 2,
    opacity: 0.3,
  },

  expenseCardCategoryAmount: {
    fontSize: 34,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'right',
    letterSpacing: -0.5,
    flex: 0,
    opacity: 1,
    fontFamily: 'SF Pro Rounded',
  },

  expenseCardCategoryRightContainer: {
    flex: 0.4,
    alignItems: 'flex-end',
  },

  expenseCardCategoryDate: {
    flex: 1,
    textAlignVertical: 'top',
  },

  expenseCardCategoryAmountFlex: {
    flex: 0,
    textAlignVertical: 'bottom',
  },

  // #endregion

  // #endregion

  // #region ADD BUTTON
  addButtonContainer: {
    position: 'absolute',
    bottom: 28,
    right: 19,
    zIndex: 1,
    elevation: 5,
    margin: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 3,
  },
  
  addButton: {
    width: 62,
    height: 62,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: theme.glassBackground,
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  
  emptyText: {
    textAlign: 'center',
    fontSize: 28,
    color: theme.text,
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: -0.1,
  },

  emptySubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  // #endregion

  // #region GRADIENTS
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
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
    backgroundColor: theme.glassBackground,
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
    color: theme.appleBlue,
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

  // Grocery item editing styles
  modalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  addItemContainer: {
    marginTop: 15,
    alignItems: 'center',
  },

  addItemButton: {
    backgroundColor: theme.appleBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  addItemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  groceryItemDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  groceryItemActions: {
    flexDirection: 'row',
    gap: 8,
  },

  groceryItemActionButton: {
    padding: 4,
  },

  groceryItemActionButtonText: {
    fontSize: 16,
  },

  groceryItemEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  groceryItemEditInput: {
    flex: 1,
    fontSize: 18,
    color: theme.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.glassBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },

  groceryItemEditButtons: {
    flexDirection: 'row',
    gap: 4,
  },

  groceryItemEditButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
  },

  groceryItemEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
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
    backgroundColor: theme.glassBackground,
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
    color: theme.appleBlue,
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
    backgroundColor: theme.glassBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.borderColorLighter,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
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
  groceryHeader: {
    position: 'absolute',
    top: 65,
    left: 30,
    zIndex: 1,
  },

  groceryHeaderTitle: {
    fontSize: 46,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.2,
  },

  groceryHeaderSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '400',
  },

  groceryList: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 160, // Account for floating header
  },

  groceryListContent: {
    paddingBottom: 100,
  },

  pantrySectionContainer: {
    marginBottom: 15,
    marginHorizontal: -5,
  },

  pantrySectionBackground: {
    borderRadius: 35,
    borderWidth: 1,
    shadowColor: theme.shadowColor,
    shadowOffset: theme.shadowOffset,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 3,
  },

  pantrySection: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 40,
  },

  pantrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 5,
    gap: 8,
  },
  pantrySectionTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.4,
  },
  fallbackIcon: {
    fontSize: 32,
    fontWeight: '600',
  },

  pantryColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  pantryColumn: {
    flex: 1,
    marginHorizontal: 4,
  },

  pantryCardContainer: {
    marginBottom: 0,
  },

  consumedItemName: {
    opacity: 0.2,
  },
  // #endregion
}); 