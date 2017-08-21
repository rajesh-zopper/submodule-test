import * as actionType from './actionType';
import * as invoiceActions from  './Invoice';
import * as dashboard from  './DashBoard';
import {colors} from  '../config/styles';
import * as constants from '../config/constants';

let _ = require('lodash');
const DEFAULT_ACTION_MODE = 'UPC/EAN';

export function functionKeyPressed(keyData, numState, currentItemID) {
  switch (keyData.action) {

    case 'ENTER': {
      return performEnterAction(keyData, numState, currentItemID);
    }
    case 'BACK_SPACE': {
      let displayText = numState.displayText.slice(0, -1);
      return setDisplayText(displayText);
    }
    case 'INCREMENT': {
      return performIncrementAction(currentItemID);
    }
    case 'DECREMENT' : {
      return performDecrementAction(currentItemID);
    }
    default:
      return performKeyActions(keyData, numState, currentItemID);
  }
}

export function numKeyPressed(keyData, numState) {

  let displayText = numState.displayText + keyData.title;
  if (displayText.length >= constants.MAX_INPUT_LIMIT) {
    return setDisplayText(numState.displayText);
  }
  return setDisplayText(displayText);
}

export function disabledNumPad(isNumPadDisable) {

  return {
    type: actionType.DISABLE_NUMPAD,
    isNumPadDisable,
  };
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

// Private Functions
function performKeyActions(keyData, numState, currentItemID) {

  if (numState.displayText.length > 0) {

    return (dispatch) => {
      dispatch(selectedModeActions(keyData.action, numState.displayText, currentItemID));
      if (numState.mode !== keyData.action) {
        dispatch(prepareModeSelectionState(keyData));
      }
    };
  }
  else if (numState.displayText.length === 0) {

    if (numState.mode === keyData.action) {

      return resetNumPad();
    }
    else {
      return prepareModeSelectionState(keyData);
    }
  }
}

function performEnterAction(keyData, numState, currentItemID) {

  return (dispatch) => {

    dispatch(selectedModeActions(numState.mode, numState.displayText, currentItemID));
    if (numState.mode !== constants.DISC_MODE) {
      dispatch(resetNumPad());
    }
  };
}

function prepareModeSelectionState(keyData) {

  let nextState = _.extend({mode: keyData.action}, {
    keyData: {
      identifier: keyData.identifier,
      style: {backgroundColor: colors.primary},
    },
  });
  return dispatch => {
    dispatch({
      type: actionType.ACTION_KEY_PRESS,
      actionData: nextState}
        );
    if (keyData.action === constants.DISC_MODE) {
      dispatch(dashboard.setDiscountText(''));
      dispatch(dashboard.updateSelectedTab(constants.EDIT_TAB));
    }
  };
}

export function setDisplayText(displayText) {

  return {
    type: actionType.DISPLAY_TEXT,
    displayText: displayText,
  };
}

export function selectedModeActions(actionMode, displayText, currentItemID) {

  return (dispatch) => {
    switch (actionMode) {

      case 'UPC/EAN': {
                // Search Item with itemID (display text)
        dispatch(invoiceActions.addItemWithCode(displayText));
        break;
      }
      case 'QNTY': {
                // update selected item's quantity (display text)'
        dispatch(invoiceActions.setItemQuantity(currentItemID, displayText));
        break;
      }
      case 'PRICE': {
                // update selected item's price (display text)
        dispatch(invoiceActions.setItemPrice(currentItemID, displayText));
        break;
      }
      case 'DISC' : {
                // discount logic for selected item
        dispatch(dashboard.setDiscountText(displayText));
        // dispatch(invoiceActions.setItemDiscount(currentItemID, displayText));
        break;
      }
      default : {
                // discount logic for selected item
        dispatch(invoiceActions.addItemWithCode(displayText));
        break;
      }
    }
    dispatch(setDisplayText(''));
  };
}

function performIncrementAction(currentItemID) {

    // increase selected item's quantity by 1
  return (dispatch) => {

    dispatch(invoiceActions.incrementItemQuantity(currentItemID));
    dispatch(setDisplayText(''));
  };
}

function performDecrementAction(currentItemID) {

    // decrement selected item's quantity by 1
  return (dispatch) => {

    dispatch(invoiceActions.decrementItemQuantity(currentItemID));
    dispatch(setDisplayText(''));
  };
}

