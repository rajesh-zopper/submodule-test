import * as actionType from '../actions/actionType';
const DIALOG_TYPE_SELECT_ITEM = 'DIALOG_TYPE_SELECT_ITEM';
const DIALOG_TYPE_UNKNOWN_ITEM = 'DIALOG_TYPE_UNKNOWN_ITEM';

const initialState = {
	//display text
  selectedTab: 0,
  discountText : '',
  isDialogVisible: false,
  showZopPay : false,
  dialogType: '',
  searchResult : {
    query : '',
    result : [],
  },  
};

export default function dashboardReducer(state = initialState, action) {
  switch (action.type) {
    case actionType.DASHBOARD_ADD_ITEM:
      return {
        ...state,
        currentItem: action.item,
      };
    case actionType.DASHBOARD_ACTION:
      return {
        ...state,
        currentItem: action.item,
      };
    case actionType.NUM_PRESS:
      return {
        ...state,
        numDisplayText: action.number,
      };
    case actionType.BROWSE_CATEGORY_REQUESTING:
      return {
        ...state,
        browseState: action.browseState,
      };
    case actionType.BROWSE_CATEGORY_FETCHED:
      return {
        ...state,
        categories: action.categories,
        subCategories: action.subCategories,
        browseItems: action.browseItems,
        browseState: action.browseState,
      };
    case actionType.BROWSE_SUB_CATEGORY_FETCHED:
      return {
        ...state,
        subCategories: action.subCategories,
        browseItems: action.browseItems,
        categorySelected:action.categorySelected,
        browseState: action.browseState,
      };
    case actionType.BROWSE_ITEMS_FETCHED:
      return {
        ...state,
        browseItems: action.browseItems,
        browseState: action.browseState,
      };
    case actionType.BROWSE_CATEGORY_FAILED:
      return {
        ...state,
        browseState: action.browseState,
      };
    case actionType.SHOW_SELECT_ITEM_DIALOG:
      return {
        ...state,
        isDialogVisible: true,
        dialogType: DIALOG_TYPE_SELECT_ITEM,
      };
    case actionType.SHOW_UNKNOWN_ITEM_ID:
      return {
        ...state,
        isDialogVisible: true,
        dialogType: DIALOG_TYPE_UNKNOWN_ITEM,
      };
    case actionType.SELECT_TAB:
      return {
        ...state,
        selectedTab: action.selectedTab,
      };
    case actionType.DISCOUNT_TEXT:
      return {
        ...state,
        discountText: action.discountText,
      };
    case actionType.SEARCH_RESULT:
      return {
        ...state,
        searchResult: {
          result : action.searchResult,
          query : action.searchQuery,
        },
      };
    case actionType.CLEAR_SEARCH_RESULT:
      return {
        ...state,
        searchResult: {
          result : [],
          query : '',
        },
      };
    case actionType.SHOW_PRINT_PREVIEW:
      return {
        ...state,
        showPrint: action.showPrint,
        invoiceID : action.invoiceID,
      };
    case actionType.SHOW_ZOPPER_PAY:
      return {
        ...state,
        showZopPay: action.showZopPay,
        invoiceID : action.invoiceID,
      };
    case actionType.DUMMY:
      return {
        ...state,
        dummyInvoice: action.dummyInvoice,
      };
    default:
      return state;
  }
}