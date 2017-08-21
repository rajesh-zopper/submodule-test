import * as actionType from './actionType';
import {
  authorizeUser,
  fetchCashRegisters,
  fetchStorePref,
  fetchStore,
  fetchPaymentOptios,
}from '../network/Api';
import * as db from '../data/PouchHelper';
import * as helper from '../Utils/helper';

export const REQUESTING = 'REQUESTING';
export const REQUEST_SUCCESS = 'REQUEST SUCCESS';
export const REQUEST_FAILED = 'REQUEST FAILED';

let _ = require('lodash');

/***************************************
 * LOGIN
 * @param userData
 * @returns {function(*=)}
 */

export function signIn(userData = null) {
  return dispatch => {
    dispatch(userInfoRequesting());
    authorizeUser(userData)
      .then(data => {
        if (data !== undefined) {
          let userInfo = prepareUserDataStructure(data);
          db.createUserDoc(db.db, userInfo)
            .then(userData => {
              console.log('565656565', data);
              db.createUtilityDoc(db.db, {
                store_registration_id: userInfo.loginConfig.store_registration_id/*200869*//*200090*/,
                cookie: data.couch_cookie/*{
                  name: 'AuthSession',
                  value: 'MzYzNjUxXzIwMDA5MDo1ODhDMkMyNzrePLTKt1ym_9931Xyu0Pi7Dmsh7A',
                }*/,
                token: data.access_token,
              }).then(val => {
                dispatch(userInfoReceived(userInfo));
              }).catch(function (error) {
                dispatch(userInfoRequestFailed());
              });
            }).catch(function (error) {
              dispatch(userInfoRequestFailed());
            });
        }
        else {
          dispatch(userInfoRequestFailed());
        }
      })
      .catch(function (error) {
        dispatch(userInfoRequestFailed());
      });
  };
}

function prepareUserDataStructure(userData) {
  return {
    token: userData.access_token,
    userInfo: userData.user,
    loginConfig: userData.login_config,
    loginState: {state: REQUEST_SUCCESS},
  };
}

export function userInfoReceived(userData) {
  return {
    type: actionType.USER_INFO_RECEIVED,
    token: userData.token,
    userInfo: userData.userInfo,
    loginConfig: userData.loginConfig,
    loginState: {state: REQUEST_SUCCESS},
  };
}

function userInfoRequestFailed(message = '') {
  return {
    type: actionType.USER_INFO_FAILED,
    loginState: {state: REQUEST_FAILED},
  };
}

function userInfoRequesting() {
  return {
    type: actionType.USER_INFO_REQUESTING,
    loginState: {state: REQUESTING},
  };
}


/*************************************************************
 *
 * LOGIN END
 *
 * */



export function hydrateStoreFromDBData(userData) {
  return {
    type: actionType.HYDRATE_USER_INFO,
    token: userData.token,
    userInfo: userData.userInfo,
    loginConfig: userData.loginConfig,
    cashRegisterChosen: userData.cashRegisterChosen,
    store: userData.store,
    registrationId: userData.store_registration_id,
    storeConfig: userData.storeConfig,
    synced: userData.synced,
    CROpened: userData.CROpened,
    paymentOptions: userData.paymentOptions,
  };
}

/******************
 *
 * Store Begin
 *
 * */

export function getStore(userId) {
  return dispatch => {
    dispatch(storeFetchRequesting());
    fetchStore(userId)
      .then(storeData => {
        db.getUtilityDoc(db.db).then(data => {
          db.updateUtilityDoc(db.db, {stores:storeData.store, ...data}).then(data1 => {
            dispatch(storeFetchFetched(storeData));
          }).catch(function (error) {
            dispatch(storeFetchFailed());
          });
        }).catch(function (error) {
          dispatch(storeFetchFailed());
        });
      }).catch(function (error) {
        dispatch(storeFetchFailed());
      });
  };
}

function storeFetchRequesting() {
  return {
    type: actionType.STORE_REQUESTING,
    storeState: {state: REQUESTING},
  };
}

function storeFetchFailed() {
  return {
    type: actionType.STORE_FAILED,
    storeState: {state: REQUEST_FAILED},
  };
}

function storeFetchFetched(stores) {
  return {
    type: actionType.STORE_FETCHED,
    stores: stores.store,
    storeState: {state: REQUEST_SUCCESS},
  };
}

export function storeSelected(store) {
  return dispatch => {
    db.getUtilityDoc(db.db).then(data => {
      db.updateUtilityDoc(db.db, {store, ...data, store_id: store.store_id}).then(data1 => {
        dispatch(storeSaved(store));
      });
    });
  };
}

function storeSaved(store) {
  return {
    type: actionType.STORE_SELECTED,
    store: store,
  };
}

/******************
 *
 * Store End
 *
 * */


/******************
 *
 * Cash Register Begin
 *
 * */

export function getCashRegister(storeId, token) {
  return dispatch => {
    dispatch(cashRegistersRequesting());
    fetchCashRegisters(storeId, token)
      .then(cashRegisters => {
        if (cashRegisters && cashRegisters != null)
        {
          db.getUtilityDoc(db.db).then(data => {
            db.updateUtilityDoc(db.db, {cashRegisters:cashRegisters.cashRegisters, ...data}).then(data1 => {
              dispatch(cashRegistersReceived(cashRegisters));
            }).catch(function (error) {
              dispatch(cashRegistersRequestFailed());
            });
          }).catch(function (error) {
            dispatch(cashRegistersRequestFailed());
          });
        }
        else
          dispatch(cashRegistersRequestFailed());
      }).catch(function (error) {
        dispatch(cashRegistersRequestFailed());
      });
  };
}

function cashRegistersRequesting() {
  return {
    type: actionType.CASH_REGISTERS_REQUESTING,
    cashRegisterState: {state: REQUESTING},
  };
}

export function cashRegistersReceived(cashRegisters) {
  return {
    type: actionType.CASH_REGISTERS_FETCHED,
    cashRegisters: cashRegisters.cashRegisters,
    cashRegisterState: {state: REQUEST_SUCCESS},
  };
}


export function cashRegistersSelected(cashRegister) {
  return dispatch => {
    db.getUtilityDoc(db.db).then(data => {
      db.updateUtilityDoc(db.db, {cashRegisterChosen: cashRegister, ...data}).then(data1 => {
        dispatch(cashRegisterSaved(cashRegister));
      });
    });
  };
}


function cashRegistersRequestFailed(message = '') {
  return {
    type: actionType.CASH_REGISTERS_FAILED,
    cashRegisterState: {state: REQUEST_FAILED},
  };
}


function cashRegisterSaved(cashRegister) {
  return {
    type: actionType.CASH_REGISTERS_SELECTED,
    cashRegisterChosen: cashRegister,
  };
}


/******************
 *
 * Cash Register End
 *
 * */


/******************
 *
 * Invoice Series Begin
 *
 * */

export function getStorePrefByModule(storeId, token, module) {
  return dispatch => {
    dispatch(storePrefRequesting());
    fetchStorePref(storeId, token, module)
      .then(storePref => {
        db.getUtilityDoc(db.db).then(data => {
          db.updateUtilityDoc(db.db, {storeConfig: storePref.storePref.preferences, ...data}).then(data1 => {
            dispatch(storePrefReceived(storePref));
          });
        });
      }).catch(function (error) {
        dispatch(storePrefFailed());
      });
  };
}

export function getPaymentOptions(storeId, token) {
  return dispatch => {
    fetchPaymentOptios(storeId, token)
      .then(payments => {
        db.getUtilityDoc(db.db).then(data => {
          let groupedOptions = _.groupBy(payments.paymentOptions.payment_modes, function (options) {
            return options.group;
          });
          helper.moveObjectAtIndex(groupedOptions.OFFLINE, groupedOptions.OFFLINE.findIndex(x => x.id == '75'), 0);
          helper.moveObjectAtIndex(groupedOptions.OFFLINE, groupedOptions.OFFLINE.findIndex(x => x.id == '77'), 1);
          let optionData = {
            ...payments.paymentOptions,
            payment_modes: groupedOptions,
          };
          db.updateUtilityDoc(db.db, {paymentOptions: optionData, ...data}).then(data1 => {
            dispatch(paymentOptionsReceived(optionData));
          });
        });
      }).catch(function (error) {
      });
  };
}

function paymentOptionsReceived(optionData) {
  
  return {
    type: actionType.PAYMENT_OPTIONS,
    paymentOptions: optionData,
  };
}

function storePrefRequesting() {
  return {
    type: actionType.STORE_PREF_REQUESTING,
    storePrefState: {state: REQUESTING},
  };
}

export function storePrefReceived(storePref) {
  return {
    type: actionType.STORE_PREF_FETCHED,
    storeConfig: storePref.storePref.preferences,
    storePrefState: {state: REQUEST_SUCCESS},
  };
}

function storePrefFailed(message = '') {
  return {
    type: actionType.STORE_PREF_FAILED,
    storePrefState: {state: REQUEST_FAILED},
  };
}

export function syncCompleted(skipCashRegsiter) {
  return dispatch => {
    db.getUtilityDoc(db.db).then(data => {
      db.updateUtilityDoc(db.db, {synced: true, ...data}).then(data1 => {
        if (skipCashRegsiter)
          dispatch(openCashRegister(0));
        dispatch({
          type: actionType.SYNC_COMPLETED,
          synced: true,
        });
      });
    });
  };
}

/******************
 *
 * Invoice Series End
 *
 * */

export function openCashRegister(openingBalance) {
  return dispatch => {
    db.getUtilityDoc(db.db).then(data => {
      db.updateUtilityDoc(db.db, {CROpened: true, openingBalance, ...data}).then(data1 => {
        dispatch(cashRegisterOpened(openingBalance));
      });
    });
  };
}

export function cashRegisterOpened(openingBalance) {
  return {
    type: actionType.CR_OPENED,
    CROpened: true,
    openingBalance,
  };
}

export function increaseRunningInvoiceSeriesInCashRegister(isPRCoded) {
  return (dispatch) => {
    db.getUtilityDoc(db.db)
      .then(data => {
        let updatedInvoiceNo = {
          LastInvoiceNo: isPRCoded ? data.cashRegisterChosen.LastInvoiceNo : `${parseInt(data.cashRegisterChosen.LastInvoiceNo) + 1}`,
          LastInvoiceNo2: !isPRCoded ? data.cashRegisterChosen.LastInvoiceNo2 : `${parseInt(data.cashRegisterChosen.LastInvoiceNo2) + 1}`,
        };
        db.updateUtilityDoc(db.db, {
          ...data,
          cashRegisterChosen: {
            ...data.cashRegisterChosen,
            ...updatedInvoiceNo,
          },
        })
          .then(data1 => {
            dispatch(increaseRunningInvoiceSeriesInCashRegisterFromState(updatedInvoiceNo));
          });
      });
  };
}

//Private Functions
export function increaseRunningInvoiceSeriesInCashRegisterFromState(updatedInvoiceNo) {
  return {
    type: actionType.CR_INVOICE_SERIES_INCREMENT,
    updatedInvoiceNo,
  };
}

export function signOut() {
  let loggedOutState = {
    userInfo: {
      isLoggedIn: false,
    },
    isCROpened: false,
  };
  return {
    type: actionType.SIGN_OUT,
    loggedOutState,
  };
}


export function userInfo(posToken) {
  return {
    type: actionType.USER_INFO,
    posToken,
  };
}
