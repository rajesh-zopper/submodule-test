import * as actionType from './actionType';
import * as db from '../data/PouchHelper';
import * as dashBoardActions from './DashBoard';
import * as dialogActions from './dialogs';
import * as numPad from './NumPad';
import * as dialogs from './dialogs';
import {initializePayments, resetPaymentState}  from './Payments';
import {increaseRunningInvoiceSeriesInCashRegister}  from './UserAuth';
import * as helper from '../Utils/helper';
import * as constants from '../config/constants';
import moment from 'moment';
import * as reducerInfo from '../reducers/Invoice';
import {
  fetchAllInvoices,
}from '../network/Api';

export const REQUESTING = 'REQUESTING';
export const REQUEST_SUCCESS = 'REQUEST SUCCESS';
export const REQUEST_FAILED = 'REQUEST FAILED';

// add item to curent invoice
export function addItemWithCode(itemCode) {
  return dispatch => {
    db.itemDetail(db.db, [itemCode])
      .then(result => {
        if (result.rows.length === 0) {
          dispatch(showItemErrorDialog(itemCode));
          dispatch(dialogs.showMessageDialog('Search Error', 'Item code unknown Item code unknown Item code unknown Item code unknown'));
          dispatch(dialogs.showMessageDialog( 'Search Error', 'Item code unknown.', 'Ok', constants.DIALOG_ADD_PRODUCT));
        } else if (result.rows.length === 1) {
          let item = result.rows[0].doc;
          dispatch(addItem(item));
        } else {
          dispatch(selectItem(result.rows));
        }
        
      }).catch((error) => {
      });
  };
}

// add new item to curent invoice
export function addNewItem(item) {
  addItem(item);
}

export function menuItemSelected(value) {
  return {
    type: actionType.MENU_OPTIONS_SELECTED,
    menuOptionSelected: value,
  };
}

export function addItemWithGuid(item) {
  item.qty = 1;
  if (item.discount_amount != undefined) {
    item.discount = [{
      type: constants.DISCOUNT_AMOUNT,
      value: item.discount_amount,
    }];
  } else {
    item.discount = [];
  }
  return {
    type: actionType.ADD_ITEM,
    item: item,
  };
}

export function addItem(item) {
  item.qty = 1;
  if (item.discount_amount != undefined) {
    item.discount = [{
      type: constants.DISCOUNT_AMOUNT,
      value: item.discount_amount,
    }];
  } else {
    item.discount = [];
  }
  return {
    type: actionType.ADD_ITEM,
    item: item,
  };
}

export function getAllInvoices(values) {
  return dispatch => {
    dispatch(allInvoicesRequesting());
    fetchAllInvoices(values)
      .then(data => {
        console.log('dadasdsa', data);
        if (data.invoices !== undefined && data.invoices !== null && data.invoices.length > 0)
          dispatch(allInvoicesFetched(data));
        else
          dispatch(allInvoicesFailed());
      }).catch(function (error) {
        dispatch(allInvoicesFailed());
      });
  };
}

function allInvoicesRequesting() {
  return {
    type: actionType.ALL_INVOICES_REQUESTING,
    invoices: undefined,
    invoicesState: {state: REQUESTING},
  };
}

function allInvoicesFetched(data) {
  let temp = [];
  for (let i = 0; i < 10; i++)
    temp.push(...data.invoices);
  return {
    type: actionType.ALL_INVOICES_FETCHED,
    invoices: temp,
    invoicesState: {state: REQUEST_SUCCESS},
  };
}

function allInvoicesFailed() {
  return {
    type: actionType.ALL_INVOICES_FAILED,
    invoices: undefined,
    invoicesState: {state: REQUEST_FAILED},
  };
}


// remove item to current invoice
export function removeItem(itemId) {
  return {
    type: actionType.REMOVE_ITEM,
    itemId: itemId,
  };
}

//return item
export function returnItem(itemId) {
  return setItemQuantity(itemId, -1);
}

export function setItemQuantity(itemId, quantity) {
  return {
    type: actionType.ITEM_QUANTITY_FIXED,
    itemId: itemId,
    quantity: quantity,
  };
}

export function setItemPrice(itemId, price) {
  return {
    type: actionType.UPDATE_ITEM_PRICE,
    itemId: itemId,
    price: price,
  };
}

export function incrementItemQuantity(itemId) {
  return {
    type: actionType.ITEM_QUANTITY_INCREMENT,
    itemId: itemId,
  };
}

export function decrementItemQuantity(itemId) {
  return {
    type: actionType.ITEM_QUANTITY_DECREMENT,
    itemId: itemId,
  };
}

export function editInvoiceItem(itemId) {
  return dispatch => {
    dispatch({
      type: actionType.SELECT_ITEM,
      itemId: itemId,
    });
    dispatch(dashBoardActions.updateSelectedTab(constants.EDIT_TAB));
  };
}

export function initiateAddNewItem() {
  return dispatch => {
    dispatch(dialogActions.showDialogWithType(constants.DIALOG_NEW_ITEM));
  };
}

export function initiateAddEmployeeItem() {
  return dispatch => {
    dispatch(dialogActions.showDialogWithType(constants.DIALOG_EMPLOYEE_ITEM));
  };
}

export function initiateAddEmployeeInvoice() {
  return dispatch => {
    dispatch(dialogActions.showDialogWithType(constants.DIALOG_EMPLOYEE_INVOICE));
  };
}

export function initiateAddCustomer() {
  return dispatch => {
    dispatch(dialogActions.showDialogWithType(constants.DIALOG_CUSTOMER));
  };
}

export function tagInvoiceCustomer(customer) {
  return (dispatch, getState) => {
    dispatch({
      type: actionType.TAG_INVOICE_CUSTOMER,
      customer: customer,
    });
    dispatch(initializePayments(getState().invoice.currentInvoice._id));
  };
}


export function removeEmployee(employee) {
  return {
    type: actionType.REMOVE_EMPLOYEE,
    employee: employee,
  };
}

export function tagItemEmployee(employee) {
  return {
    type: actionType.TAG_ITEM_EMPLOYEE,
    employee: employee,
  };
}

export function tagInvoiceEmployee(employee) {
  return {
    type: actionType.TAG_INVOICE_EMPLOYEE,
    employee: employee,
  };
}


// remove customer from current invoice
export function removeCustomer(customerId) {
  return {
    type: actionType.REMOVE_CUSTOMER,
    customerId: customerId,
  };
}

export function toggleInvoiceMenu() {
  return {
    type: actionType.TOGGLE_INVOICE_MENU,
  };
}

export function toggleInvoiceList() {
  return {
    type: actionType.TOGGLE_INVOICE_LIST,
  };
}


export function showInvoiceList() {
  return {
    type: actionType.SHOW_INVOICE_LIST,
  };
}

export function processToPay(invoiceID) {
  
  return (dispatch, getState) => {
    let currentInvoice = getState().invoice.currentInvoice;
    db.updateDraftInvoice(db.db, currentInvoice)
      .then(result => {
        dispatch(updateInvoiceRevision(result.rev));
        dispatch(initializePayments(invoiceID));
        dispatch(dashBoardActions.processToPay());
      }).catch((error) => {
        console.log('processToPay -->error', error);
      });
  };
}

export function setDiscount(discount, itemId, removeBaseDiscount, applyToInvoice) {
  if (applyToInvoice) {
    return setInvoiceDiscount(discount, removeBaseDiscount);
  } else {
    return setItemDiscount(itemId, discount, removeBaseDiscount);
  }
}

/******************* MULITPLE DRAFT RELATED *************************/

export function addNewInvoice() {
  return (dispatch, getState) => {
    let currentInvoice = getState().invoice.currentInvoice;
    if (Object.keys(currentInvoice.items).length == 0
      && currentInvoice.customerId == undefined) {
      dispatch({
        type: actionType.ADD_NEW_INVOICE,
        invoiceId: currentInvoice._id,
      });
    } else {
      db.updateDraftInvoice(db.db, currentInvoice)
        .then(result => {
          db.createDraftInvoice(db.db, reducerInfo.initInvoice)
            .then(result => {
              dispatch({
                type: actionType.ADD_NEW_INVOICE,
                currentInvoice: {...result, id: result._id},
              });
            })
            .catch((error) => {
            });
        }).catch((error) => {
        });
    }
  };
}

export function resetInvoice() {
  return (dispatch, getState) => {
    db.createDraftInvoice(db.db, reducerInfo.initInvoice)
      .then(result => {
        dispatch({
          type: actionType.RESET_INVOICE,
          currentInvoice: {...result, id: result._id},
        });
      })
      .catch((error) => {
      });
  };
}

export function setNewInvoice() {
  return (dispatch, getState) => {
    let currentInvoice = getState().invoice.currentInvoice;
    if (currentInvoice.id == undefined) {
      db.getDraftInvoices(db.db)
        .then(result =>{
          if(result.rows.length>0){
            let invoices=[];
            let currentInvoice={};
            for(let i=0; i<result.rows.length; i++){
              let draftInvoice = result.rows[i].doc;
              invoices.push(helper.getDraftData(draftInvoice));
              currentInvoice = draftInvoice;
            }
            
            dispatch({
              type: actionType.SET_INITIAL_INVOICES,
              currentInvoice: {...currentInvoice},
              invoices: [...invoices],
            });
          } else {
            db.createDraftInvoice(db.db, reducerInfo.initInvoice)
              .then(result => {
                let invoices = [];
                dispatch({
                  type: actionType.SET_INITIAL_INVOICES,
                  currentInvoice: {...result, id: result._id},
                  invoices: invoices.concat(helper.getDraftData(result)),
                });
              })
              .catch((error) => {
              });
          }
        }).catch((error)=>{
          console.log('error', error);
        });
    }
  };
}

export function generateInvoice(invoiceId) {
  
  return (dispatch, getState) => {
    db.getInvoice(db.db, invoiceId)
      .then(result => {
        let draftInvoice = result;
        db.updateInvoice(db.db, draftInvoice)
          .then(result => {
            
            dispatch(numPad.updateLayout(constants.INVOICING_LAYOUT));
            dispatch(resetPaymentState(draftInvoice.id));
            dispatch(dashBoardActions.showPrintDialog(true, draftInvoice.id));
            //Reset Invoice
            dispatch(resetInvoice());
            // dispatch(increaseRunningInvoiceSeriesInCashRegister());
            
          })
          .catch((error) => {
          });
      })
      .catch((error) => {
      });
  };
}


export function generateCurrentInvoice() {
  
  return (dispatch, getState) => {
    
    let draftInvoice = getState().invoice.currentInvoice;
    let hardcodeDataPayment = getState().payments.usedPayments;
    let isPRCoded = false;
    let runningInvoice = helper.getRunningInvoiceID(isPRCoded, getState().userAuth.cashRegisterChosen);
    
    let {
      items: itemObject,
      itemOrder: itemOrderingArray,
      selectedItemId: itemId,
      ...usableInvoice
    } = draftInvoice;
    let updatedItems = helper.getInvoiceItems(itemObject, itemOrderingArray);
    
    draftInvoice = {
      ...usableInvoice,
      invoice_id: runningInvoice,
      invoice_name: runningInvoice,
      invoice_date: new Date().toISOString(),
      invoice_date_display: moment(new Date()).format('DD-MMM-YYYY'),                                           //TODO
      uid: getState().userAuth.loginConfig.store_registration_id,
      store_id: getState().userAuth.store.store_id,
      store_name: getState().userAuth.store.name,
      cash_register_id: getState().userAuth.cashRegisterChosen.CashRegisterID,
      cash_register_name: getState().userAuth.cashRegisterChosen.CashRegisterName,
      
      base_amount: helper.getTotalBaseAmount(draftInvoice.items),
      sub_total: helper.getSubTotal(draftInvoice.items),
      discount_total: helper.getDiscount(draftInvoice.items),
      qty_total: helper.getTotalQuantity(draftInvoice.items),
      discount_percentage: 0,                                               //TODO: hardcoded
      inclusive_tax: helper.getInclusiveTaxes(draftInvoice.items),
      exclusive_tax: helper.getExclusiveTaxes(draftInvoice.items),
      total_tax: helper.getTotalTaxes(draftInvoice.items),
      grand_total: helper.getTotalAmount(draftInvoice.items),
      
      paid: helper.getTotalAmount(draftInvoice.items),
      balance: 0,
      tender: helper.getTotalAmount(draftInvoice.items),
      invoice_multiple_payment: hardcodeDataPayment,                        //TODO: hardcoded
      invoice_details: updatedItems,
      store: getState().userAuth.store,
      record_type: 'invoice',
    };
    db.updateInvoice(db.db, draftInvoice)
      .then(result => {
        dispatch(increaseRunningInvoiceSeriesInCashRegister(isPRCoded));
        db.getPaymentDoc(db.db, `payment_${draftInvoice._id}`)
          .then(result => {
            
            let paymentData = {
              ...result,
              invoice_id: runningInvoice,
              record_type: 'payment',
            };
            db.updatePaymentDoc(db.db, paymentData)
              .then(result => {
                dispatch(numPad.updateLayout(constants.INVOICING_LAYOUT));
                dispatch(resetPaymentState(draftInvoice._id));
                dispatch(dashBoardActions.showPrintDialog(true, draftInvoice._id));
                //Reset Invoice
                dispatch(resetInvoice());
              })
              .catch(error => {
              });
          })
          .catch((error) => {
          });
        
      })
      .catch((error) => {
      });
  };
}

export function selectInvoice(draftInvoiceId) {
  return (dispatch, getState) => {
    let currentInvoice = getState().invoice.currentInvoice;
    if (currentInvoice._id == draftInvoiceId) {
      dispatch({
        type: actionType.REPLACE_CURRENT_INVOICE,
        selectedInvoice: currentInvoice,
      });
    } else {
      db.updateDraftInvoice(db.db, currentInvoice)
        .then(result => {
          db.getInvoice(db.db, draftInvoiceId)
            .then(result => {
              dispatch({
                type: actionType.REPLACE_CURRENT_INVOICE,
                selectedInvoice: result,
              });
            })
            .catch((error) => {
            });
        }).catch((error) => {
        
        });
      
    }
  };
}

/******************* private functions ******************************/

function selectItem(items) {
  return {
    type: actionType.SHOW_SELECT_ITEM_DIALOG,
    items: items,
  };
}

function setItemDiscount(itemId, discount, removeBaseDiscount) {
  return {
    type: actionType.UPDATE_ITEM_DISCOUNT,
    itemId: itemId,
    discountType: helper.getDiscountType(discount),
    discountValue: helper.getDiscountValue(discount),
    removeBaseDiscount: removeBaseDiscount,
  };
}

function setInvoiceDiscount(discount, removeBaseDiscount) {
  return {
    type: actionType.UPDATE_ALL_ITEMS_DISCOUNT,
    discountType: helper.getDiscountType(discount),
    discountValue: helper.getDiscountValue(discount),
    removeBaseDiscount: removeBaseDiscount,
  };
}

function showItemErrorDialog(itemId) {
  return {
    type: actionType.SHOW_UNKNOWN_ITEM_ID,
    itemId: itemId,
  };
}

function updateInvoiceRevision(rev) {
  return {
    type: actionType.UPDATE_INVOICE_REVISION,
    rev: rev,
  };
}

