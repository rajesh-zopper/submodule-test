import * as actionType from '../actions/actionType';
import {colors} from '../config/styles';
import * as constants from '../config/constants';

const initialState = {
  displayText: '',
  currentPayMode : '',
  InvoiceID : '',
  usedPayments: {
    id: 'InCR00989',
    store_registration_id: 'cl1',
    store_id: 'cl2',
    order_gross: 'order_gross',
    authorization : '161fa62291f463457a7e7e7bf9aacd1504003a61|16',
    modes: {},
  },
  keyData: {
    identifier: '',
    style: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionType.DISPLAY_TEXT:
      return {
        ...state,
        displayText: action.displayText,
      };
    case actionType.PAY_MODE_PRESS:
      return {
        ...state,
        ...action.actionData,
      };
    case actionType.RESET_NUM_PAD: {

      let keyData = state.keyData;
      keyData = {
        ...keyData,
        style: {backgroundColor: colors.lightBlue},
      };
      return {
        ...state,
        currentPayMode : '',
        keyData : keyData,
      };
    }
    case actionType.UPDATE_LAYOUT: {

      return {
        ...state,
        numPadLayout : action.numPadLayout,
        isLayoutNeeded: true,
      };
    }
    case actionType.PAY_MODE_ADDED : {

      return {
        ...state,
        usedPayments : action.usedPayments,
      };
    }
    case actionType.REMOVE_PAY_MODE : {

      return {
        ...state,
        usedPayments : action.updatedPayments,
      };
    }
    case actionType.ADD_PAYMODE_TXN : {

      let usedPayments = state.usedPayments;
      if (usedPayments.modes[action.payMode] !== undefined) {
        let payMode = usedPayments.modes[action.payMode];
        payMode = {
          ...payMode,
          txn_id : action.txn,
        };
        usedPayments = {
          ...usedPayments,
          modes : {
            ...usedPayments.modes,
            [action.payMode] : payMode,
          },
        };
      }
      return {
        ...state,
        usedPayments : usedPayments,
      };
    }
    case actionType.RESET_PAYMENTS : {

      return {
        ...state,
        ...initialState,
      };
    }
    case actionType.INITIALIZE_PAYMENTS : {

      return {
        ...state,
        InvoiceID : action.invoiceID,
        usedPayments : {
          ...state.usedPayments,
          ...action.usedPayments,
        },
      };
    }
    default:
      return state;
  }
}
