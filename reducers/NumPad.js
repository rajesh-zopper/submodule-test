import * as actionType from '../actions/actionType';
import {colors} from '../config/styles';
import * as constants from '../config/constants';

const initialState = {
  displayText: '422103',
  mode: '',
  numPadLayout : constants.INVOICING_LAYOUT,
  isLayoutNeeded: false,
  isNumPadDisable: false,
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
    case actionType.ACTION_KEY_PRESS:
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
      let nextState = {
        ...state,
        keyData : keyData,
        mode : '',
        displayText: '',
      };
      return {
        ...state,
        ...nextState,
      };
    }
    case actionType.UPDATE_LAYOUT: {

      return {
        ...state,
        numPadLayout : action.numPadLayout,
        isLayoutNeeded: true,
      };
    }
    case actionType.DISABLE_NUMPAD:
      return {
        ...state,
        isNumPadDisable: action.isNumPadDisable,
      };
    default:
      return state;
  }
}
