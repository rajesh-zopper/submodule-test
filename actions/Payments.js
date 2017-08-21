import * as actionType from './actionType';
import * as invoiceActions from  './Invoice';
import * as dashboard from  './DashBoard';
import * as numPad from  './NumPad';
import {colors} from  '../config/styles';
import * as constants from '../config/constants';
import { getTotalAmount } from '../Utils/helper';
import { showMessageDialog } from './dialogs';
import * as dialogs from './dialogs';
import {db, createPaymentDoc, getPaymentDoc, updatePaymentDoc} from '../data/PouchHelper';
import uuid from 'react-native-uuid';

export function paymentsActionPerformed(keyData, payments) {

  switch (keyData.type) {
    case 'NUM_KEY': {
      return numKeyPressed(keyData, payments);
    }
    case 'FUNCTION_KEY': {
      // functionKeyPressed(keyData, payments);
      return functionKeyPressed(keyData, payments);
    }
  }
}

export function functionKeyPressed(keyData, payments) {
  switch (keyData.action) {

    case 'ENTER': {
      return performEnterAction(keyData, payments);
    }
    case 'BACK_SPACE': {
      let displayText = payments.displayText.slice(0, -1);
      return setDisplayText(displayText);
    }
    default:
      return performKeyActions(keyData, payments);
  }
}

export function numKeyPressed(keyData, payments) {

  if (payments.currentPayMode.id === constants.CASH_PAY_MODE.id) {
    return addAmountForPaymentMode(payments.currentPayMode, keyData.title, payments);
  }
  else {
    let displayText = payments.displayText + keyData.title;
    return setDisplayText(displayText);
  }
}

export function resetNumPad() {

  return {
    type: actionType.RESET_NUM_PAD,
  };
}

export function updateLayout(numPadLayout) {

  return {
    type: actionType.UPDATE_LAYOUT,
    numPadLayout,
  };
}

export function updateNumPadLayout(layout){
  return dispatch => {
    dispatch(numPad.updateLayout(layout));
  };
}

export function paymentsConfirmed(invoiceId){
  return dispatch => {
    dispatch(invoiceActions.generateCurrentInvoice());
  };
}

export function removePaymentMode(payMode, txn){

  return (dispatch, getState) => {
    let updatedPayments = getState().payments.usedPayments;
    if (updatedPayments.modes[payMode] !== undefined) {

      if (updatedPayments.modes[payMode].length === 1) {
        let { [payMode]: deletedModeValue, ...modes } = updatedPayments.modes;
        updatedPayments =  {
          ...updatedPayments,
          modes : {
            ...modes,
          },
        };
      }
      else if (updatedPayments.modes[payMode].length > 1) {
        let updatedModes = updatedPayments.modes[payMode].filter(function( obj ) {
          return obj.txn_id !== txn;
        });
        updatedPayments =  {
          ...updatedPayments,
          modes : {
            ...updatedPayments.modes,
            [payMode] : updatedModes,
          },
        };
      }
    }
    updatePaymentDocToDB(updatedPayments.id, updatedPayments);
    dispatch({
      type: actionType.REMOVE_PAY_MODE,
      updatedPayments,
    });
  };
}

export function addTxnID(payMode, txn){
  return {
    type: actionType.ADD_PAYMODE_TXN,
    payMode,
    txn,
  };
}

export function showAddTxnDialog(value , payMode){
  
  return dialogs.showInputDialog(value ? value : 'Enter payment details.', payMode, addTxnID);
}


export function resetPaymentState(invoiceTd) {

  //TODO : Update payments in DB and clear from local state
  return {
    type: actionType.RESET_PAYMENTS,
  };
}

export function completeInvoicePayment(payments, paymentBalance) {
  return (dispatch) => {
    if (payments.currentPayMode.id === constants.CASH_PAY_MODE.id || payments.currentPayMode.length == 0) {
      dispatch(addAmountForPaymentMode(constants.CASH_PAY_MODE, paymentBalance, payments));
    }
    else {
      let paymntsWithBlnc = {
        ...payments,
        displayText: paymentBalance,
      };
      dispatch(selectedModeActions(paymntsWithBlnc.currentPayMode, paymntsWithBlnc));
    }

  };
}

export function initializePayments(invoiceID){

    //TODO : Check (with Invoice Draft_ID) if Payment doc already exist
  return (dispatch, getState) => {
    let paymentsData = {
      id: invoiceID,
      user_id: getState().userAuth.userInfo.id,
      user_contact: getState().invoice.currentInvoice.client_mobile_no,
      user_email: getState().invoice.currentInvoice.client_email,
      store_registration_id: getState().userAuth.store.store_id,
      store_id: getState().userAuth.loginConfig.store_registration_id,
      order_gross: getTotalAmount(getState().invoice.currentInvoice.items),
      modes: {},
    };
    getPaymentDoc(db, `payment_${invoiceID}`)
        .then(results => {

          paymentsData = {
            ...paymentsData,
            ...results,
          };
          dispatch(hydratePaymentStateFromDB(paymentsData, invoiceID));
        })
        .catch(error => {
          createPaymentDoc(db, invoiceID, paymentsData)
            .then(result => {
              paymentsData = {
                ...paymentsData,
                ...result,
              };
              dispatch(hydratePaymentStateFromDB(paymentsData, invoiceID));
            })
            .catch(error => {
            });
        });
  };
}

// Private Functions
function hydratePaymentStateFromDB(paymentsData, invoiceID) {

  return {
    type: actionType.INITIALIZE_PAYMENTS,
    invoiceID,
    usedPayments: paymentsData,
  };
}

function performKeyActions(keyData, payments) {

  if (payments.displayText.length > 0) {

    return (dispatch) => {

      dispatch(selectedModeActions(keyData.paymentModeData, payments));
      if (payments.currentPayMode !== keyData.action) {
        dispatch(prepareModeSelectionState(keyData));
      }
    };
  }
  else if (payments.displayText.length === 0) {
    if ((keyData.paymentModeData.id && payments.currentPayMode.id === keyData.paymentModeData.id)
        || (keyData.action === 'ONLINE' && payments.currentPayMode.id === 'ZOP_PAY')) {
      return resetNumPad();
    }
    else {
      return prepareModeSelectionState(keyData, payments);
    }
  }
}

function performEnterAction(keyData, payments) {

  return (dispatch) => {

    dispatch(selectedModeActions(payments.currentPayMode, payments));
    // if (payments.currentPayMode !== constants.DISC_MODE) {
    //   dispatch(resetNumPad());
    // }
  };
}

function prepareModeSelectionState(keyData, payments) {
  return dispatch => {
    if (keyData.action === 'OFFLINE' && keyData.paymentModeData.id === undefined) {

    //Handle More... case in OFFLINE mode.
    }
    else {
      if (keyData.action === 'ONLINE' &&
        (payments.usedPayments.user_contact == undefined || payments.usedPayments.user_email == undefined) ) {
        dispatch(dialogs.showMessageDialog( 'Error Message', 'Please tag customer for Zopper payments.', 'Ok', constants.DIALOG_CUSTOMER));
      }
      else {
        let nextState = {...payments,
          currentPayMode : (keyData.action === 'ONLINE') ? {group : 'ONLINE', id : 'ZOP_PAY', text : 'Zopper Pay'} : keyData.paymentModeData,
          keyData: {
            identifier: keyData.identifier,
            style: {backgroundColor: colors.primary},
          },
        };
        dispatch({
          type: actionType.PAY_MODE_PRESS,
          actionData: nextState,
        });
      }
    }
  };
}

function setDisplayText(displayText) {

  return {
    type: actionType.DISPLAY_TEXT,
    displayText: displayText,
  };
}

function selectedModeActions(paymentModeData, payments) {

  return (dispatch) => {
    let payMode = paymentModeData.text;
    switch (paymentModeData.id) {

      case '75': {
        // dispatch(invoiceActions.addItemWithCode(displayText));
        payMode = 'Cash';
        break;
      }
      case '77': {
        // dispatch(invoiceActions.setItemQuantity(currentItemID, displayText));
        payMode = 'Credit Card';
        break;
      }
      case '105': {
        // dispatch(invoiceActions.setItemPrice(currentItemID, displayText));
        payMode = 'Return Redemption';
        break;
      }
      case 'ZOP_PAY' : {
        // dispatch(dashboard.setDiscountText(displayText));
        // dispatch(invoiceActions.setItemDiscount(currentItemID, displayText));
        payMode = 'ZopperPay';
        break;
      }
      case '96' : {
        // dispatch(dashboard.setDiscountText(displayText));
        // dispatch(invoiceActions.setItemDiscount(currentItemID, displayText));
        payMode = 'Gift Card';
        break;
      }
      case 'MORE' : {
        // dispatch(dashboard.setDiscountText(displayText));
        // dispatch(invoiceActions.setItemDiscount(currentItemID, displayText));
        break;
      }
      default : {
        // dispatch(invoiceActions.addItemWithCode(displayText));
        break;
      }
    }
    if (payments.displayText.length > 0 ) {
      dispatch(addAmountForPaymentMode(paymentModeData, payments.displayText, payments));
      if (paymentModeData.group == 'ONLINE') {
        dispatch(dashboard.showZopperPayDialog(true, payments.InvoiceID));
      }
    }
    dispatch(setDisplayText(''));
  };
}

function addAmountForPaymentMode(paymentMode, paymentAmount, payments) {

  return (dispatch) => {
    let usedPayments = payments.usedPayments;
    let amount = paymentAmount;
    let payData = {
      amount: String(amount),
      text: paymentMode.text,
      payment_mode: paymentMode.mode,
      auxiliary: '', //detail for cheque or gift card type mode
      created_at: new Date().toISOString(),
      sub_payment_mode_id: paymentMode.sub_payment_mode_id,
      pg_code: paymentMode.pg_code,
      mode_id: paymentMode.mode_id,
      id: paymentMode.id.toString(),
      txn_id: uuid.v1(),
    };
    if (usedPayments.modes[paymentMode.id] !== undefined) {

      if ( paymentMode.id == '75') {
        amount = parseFloat(usedPayments.modes[paymentMode.id][0].amount);
        amount += parseFloat(paymentAmount);
        usedPayments = {
          ...usedPayments,
          modes: {
            ...usedPayments.modes,
            [paymentMode.id]: [{
              ...payData,
              amount: String(amount),
            }],
          },
        };
      }
      else {

        usedPayments = {
          ...usedPayments,
          modes: {
            ...usedPayments.modes,
            [paymentMode.id]: usedPayments.modes[paymentMode.id].concat([payData]),
          },
        };
      }
    }
    else {
      usedPayments = {
        ...usedPayments,
        modes: {
          ...usedPayments.modes,
          [paymentMode.id]: [payData],
        },
      };
    }

    dispatch({
      type: actionType.PAY_MODE_ADDED,
      usedPayments,
    });
    updatePaymentDocToDB(payments.InvoiceID, usedPayments);
  };
}

//TODO : Update Payment doc in DB
function updatePaymentDocToDB(invoiceID, usedPayments) {
  
  getPaymentDoc(db, `payment_${invoiceID}`)
    .then(results => {

      let paymentData = {
        ...usedPayments,
        ...results,
        modes : usedPayments.modes,
        status : 'success',
      };
      updatePaymentDoc(db, paymentData)
            .then(result => {

            })
            .catch(error => {
            });
    })
    .catch(error => {
    });
}

export function showZopperPay(show, invoiceID) {
  return dashboard.showZopperPayDialog(show, invoiceID);
}

export function handleZopperPayResponse(paymentMode, payments) {

  return dispatch => {

    if (paymentMode.payment_status === 'FAIL') {

      dispatch(removePaymentMode('ZOP_PAY', undefined));
      dispatch(showMessageDialog('Error', paymentMode.payment_status_desc));
    }
    else {
      let zopModeData = {
        ...payments.usedPayments.modes.ZOP_PAY,
        ...paymentMode,
      };
      dispatch(removePaymentMode('ZOP_PAY', undefined));
      dispatch(addAmountForPaymentMode(zopModeData, zopModeData.amount, payments));
    }
  };
}

export function dummyOrder(obj) {
  return {
    type: actionType.DUMMY,
    dummyInvoice:obj,
  };
}



