import * as actionType from './actionType';
import * as invoiceActions from  './Invoice';
import * as numPad from  './NumPad';
import * as db from '../data/PouchHelper';
import * as constants from '../config/constants';

export const REQUESTING = 'REQUESTING';
export const REQUEST_SUCCESS = 'REQUEST SUCCESS';
export const REQUEST_FAILED = 'REQUEST FAILED';

export function dashboardAction(item) {
  return {
    type: actionType.DASHBOARD_ACTION,
    item,
  };
}

export function setDiscountText(discountText) {
  return {
    type: actionType.DISCOUNT_TEXT,
    discountText,
  };
}


export function updateSelectedTab(selectedTab) {
  
  return dispatch => {
    if (selectedTab === constants.SEARCH_TAB) {
      // dispatch(clearSearchResult());
    }
    dispatch({
      type: actionType.SELECT_TAB,
      selectedTab,
    });
  };
}

export function getBrowseCategories(regId) {
  return dispatch => {
    dispatch(browseCategoryRequesting());
    db.getCategory(db.db, regId)
      .then(data => {
        dispatch(browseCategoryReceived(data));
      }).catch(function (error) {
        dispatch(browseCategoryFailed());
      });
  };
}

export function getBrowseSubCategories(category, regId) {
  return dispatch => {
    let a = [];
    a.push(category.doc.id);
    a.push(regId);
    
    db.getSubCategory(db.db, a)
      .then(data => {
        dispatch(browseSubCategoryReceived(data, category));
      }).catch(function (error) {
      });
  };
}

export function getBrowseItems(val, rowData, isSubCategory, regId) {
  return dispatch => {
    if (val === -1) {
      db.getAllFavItems(db.db).then(data => {
        dispatch(browseItemsReceived(data));
      });
    }
    else {
      let a = [];
      a.push(val);
      a.push(regId);
      db.getItem(db.db, a)
        .then(data => {
          dispatch(browseItemsReceived(data, rowData, isSubCategory));
        }).catch(function (error) {
        });
    }
  };
}


export function applyDiscount(discount, itemId, removeBaseDiscount, applyToInvoice) {
  return dispatch => {
    dispatch(invoiceActions.setDiscount(discount, itemId, removeBaseDiscount, applyToInvoice));
    dispatch(cancelDiscount());
  };
}

export function cancelDiscount() {
  return dispatch => {
    dispatch(numPad.resetNumPad());
    dispatch(updateSelectedTab(constants.SCAN_TAB));
  };
}

function browseCategoryRequesting() {
  return {
    type: actionType.BROWSE_CATEGORY_REQUESTING,
    browseState: {state: REQUESTING},
  };
}

export function browseCategoryReceived(data) {
  return {
    type: actionType.BROWSE_CATEGORY_FETCHED,
    categories: data,
    subCategories: undefined,
    browseItems: undefined,
    browseState: {state: REQUEST_SUCCESS},
  };
}

export function browseSubCategoryReceived(data, categorySelected) {
  return {
    type: actionType.BROWSE_SUB_CATEGORY_FETCHED,
    subCategories: data,
    browseItems: undefined,
    categorySelected: categorySelected,
    browseState: {state: REQUEST_SUCCESS},
  };
}

export function browseItemsReceived(data, rowData, isSubCategory) {
  console.log('itemssss',{data, rowData, isSubCategory});
  return {
    type: actionType.BROWSE_ITEMS_FETCHED,
    browseItems: data,
    browseState: {state: REQUEST_SUCCESS},
  };
}

//Item Search from local-db Catalogue
export function searchItems(searchQuery) {
  return dispatch => {
    db.itemSearch(db.db, searchQuery)
      .then(result => {
        if (result.rows.length === 0) {
          //Search Error handling
          dispatch(clearSearchResult());
        } else {
          dispatch(setSearchResult(result.rows, searchQuery));
        }
      }).catch((error) => {
      });
  };
}

function setSearchResult(searchResult, searchQuery) {
  return {
    type: actionType.SEARCH_RESULT,
    searchResult,
    searchQuery,
  };
}

function clearSearchResult() {
  return {
    type: actionType.CLEAR_SEARCH_RESULT,
  };
}

function browseCategoryFailed(message = '') {
  return {
    type: actionType.BROWSE_CATEGORY_FETCHED,
    browseState: {state: REQUEST_FAILED},
  };
}
function addItemDashboard(item) {
  return {
    type: actionType.DASHBOARD_ADD_ITEM,
    item,
  };
}

function removeItemDashboard(item) {
  return {
    type: actionType.DASHBOARD_REMOVE_ITEM,
    item,
  };
}

export function setItemQuantity(item, quantity) {
  return {
    type: actionType.DASHBOARD_ACTION,
    item,
  };
}


/******* multiple dispatches *******/

export function addItemFromDashBoard(item) {
  return dispatch => {
    dispatch(invoiceActions.addItem(item));
    // dispatch(addItemDashboard(item));
  };
}

export function addItemWithCode(itemId) {
  return dispatch => {
    db.getItem(db.db, itemId)
      .then(items => {
        if (items.length > 1) {
          
        } else {
          dispatch(invoiceActions.addItem(itemId));
        }
      }).catch((error) => {
      });
  };
}

export function removeItem(item) {
  return dispatch => {
    dispatch(invoiceActions.removeItem(item));
    dispatch(removeItemDashboard(item));
  };
}

export function tagEmployeeInItem(item) {
  return dispatch => {
    dispatch(invoiceActions.initiateAddEmployeeItem());
  };
}

export function tagCustomer(item, customerName) {
  return {
    type: actionType.DASHBOARD_ACTION,
    item,
  };
}

export function processToPay() {
  return dispatch => {
    dispatch(numPad.resetNumPad());
    dispatch(numPad.updateLayout(constants.PAYMENT_LAYOUT));
    dispatch(updateSelectedTab(constants.SCAN_TAB));
  };
}

export function showPrintDialog(show, invoiceID) {
  return {
    type: actionType.SHOW_PRINT_PREVIEW,
    showPrint: show,
    invoiceID,
  };
}

export function showZopperPayDialog(show, invoiceID) {
  return {
    type: actionType.SHOW_ZOPPER_PAY,
    showZopPay: show,
    invoiceID,
  };
}

export function updateNumPadLayout(layout) {
  return dispatch => {
    dispatch(numPad.updateLayout(layout));
  };
}


export function dummyOrder(obj) {
  return {
    type: actionType.DUMMY,
    dummyInvoice: obj,
  };
}