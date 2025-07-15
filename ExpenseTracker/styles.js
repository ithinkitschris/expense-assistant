import { StyleSheet } from 'react-native';

// Theme definitions
export const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    textInvert: 'white',
    textSecondary: '#666666',
    borderColor: 'rgba(0,0,0,0.5)',
    borderColorLighter: 'rgba(0,0,0,0.1)',
    headerBlur: 'rgba(0,0,0,0.75)',
    categoryBackground: 'rgba(255,255,255,0.85)',
    categorySelected: 'rgba(0,0,0,0.8)',
    categorySelectedText: '#ffffff',
    addButtonBackground: 'rgba(0,0,0,0.85)',
    gradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
    topGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.9)'],
    bottomGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.9)'],
    blurTint: 'light',
    statusBarStyle: 'dark',
    appleBlue: '#007AFF',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    textInvert: 'black',
    textSecondary: '#cccccc',
    borderColor: 'rgba(255,255,255,0.5)',
    borderColorLighter: 'rgba(255,255,255,0.2)',
    headerBlur: 'rgba(255,255,255,0.15)',
    categoryBackground: 'rgba(0,0,0,0)',
    categorySelected: 'rgba(255,255,255,0.3)',
    categorySelectedText: '#007AFF',
    addButtonBackground: 'rgba(255,255,255,1)',
    gradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
    topGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)'],
    bottomGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)'],
    blurTint: 'dark',
    statusBarStyle: 'light',
    appleBlue: '#007AFF',
  }
};

export const createStyles = (theme) => StyleSheet.create({

  // #region CONTAINERS
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  expenseList: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  
  expenseListBottomPadding: {
    paddingBottom: 130,
  },
  // #endregion

  // #region HEADER 
  header: {
    position: 'absolute',
    top: 70,
    left: 'auto',
    right: 'auto',
    alignSelf: 'center',
    minWidth: 0,
    borderRadius: 50,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  headerBlur: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: theme.headerBlur,
    overflow: 'hidden',
  },
  
  totalAmount: {
    fontSize: 42,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },

  totalAmountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  // #endregion

  // #region CATEGORY SELECTOR
  categorySelector: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0)',
  },
  
  categorySelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  
  categoryOptionContainer: {
    marginRight: 12,
    borderRadius: 50,
    overflow: 'hidden',
  },
  
  categoryOption: {
    borderRadius: 50,
    paddingHorizontal: 27,
    paddingVertical: 7,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: theme.categoryBackground,
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  categoryOptionSelected: {
    backgroundColor: theme.categorySelected,
  },
  
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    textTransform: 'capitalize',
    letterSpacing: -0.1,
  },
  
  categoryOptionTextSelected: {
    color: theme.categorySelectedText,
  },
  
  categoryOptionAmount: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.textSecondary,
    marginTop: 1.5,
    letterSpacing: -0.2,
  },
  
  categoryOptionAmountSelected: {
    color: theme.categorySelectedText,
    opacity: 0.8,
  },
  // #endregion

  // #region EXPENSE ITEMS
  expenseItem: {
    backgroundColor: theme.Background,
    marginBottom: 48,
    paddingHorizontal: 25,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 2,
  },
  
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'start',
  },

  category: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: theme.text,
    fontWeight: '500',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 50,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 10,
    marginLeft: -3,
    textAlign: 'center',
    opacity: 1,
  },
  
  date: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 4,
    letterSpacing: -0.5,
    alignSelf: 'flex-start',
    opacity: 1,
  },
  
  expenseTitle: {
    fontSize: 58,
    fontWeight: '500',
    color: theme.text,
    paddingTop: 10,
    letterSpacing: -0.2,
    lineHeight: 55,
  },
  
  amount: {
    fontSize: 58,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -1,
    marginTop: -7,
    marginLeft: 1,
    marginBottom: 3,
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
    bottom: 110,
    right: 20,
    zIndex: 1,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 50,
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
    color: theme.textInvert, 
    fontSize: 60,
    fontWeight: '300',
    textAlign: 'center',
    paddingLeft: 2,
    lineHeight: 63,
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
    height: 150,
    zIndex: 0,
  },
  
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 135,
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
    color: '#007AFF',
  },

  modalAddButton: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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



  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },

  // #endregion

  // #region SWIPEABLE EXPENSE ITEM
  swipeableContainer: {
    marginBottom: 48,
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
    backgroundColor: '#007AFF',
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