import { combineReducers } from 'redux';
import invoice from './Invoice';
import dashboard from './Dashboard';
import userAuth from './UserAuth';
import sync from './Sync';
import numPad from './NumPad';
import payments from './Payments';
import dialogs from './dialogs';

export default combineReducers({
  invoice,
  userAuth,
  sync,
  numPad,
  payments,
  dashboard,
  dialogs,
});
