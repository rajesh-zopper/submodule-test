import * as actionType from '../actions/actionType';

const initialState = {
};

export default function reducer(state = initialState, action) {
	
  switch (action.type) {
    /*HYDRATE_USER_INFO*****************************************/
      case actionType.HYDRATE_USER_INFO:
      return {
        ...state,
        ...action,
      };
  
  
    /*LOGIN*****************************************/
    case actionType.USER_INFO_REQUESTING:
      return {
        ...state,
        loginState: action.loginState,
      };
    case actionType.USER_INFO_RECEIVED:
      return {
        ...state,
        token: action.token,
        userInfo: action.userInfo,
        loginConfig: action.loginConfig,
        loginState: action.loginState,
      };
    case actionType.USER_INFO_FAILED:
      return {
        ...state,
        isCROpened: action.isCROpened,
        token: action.token,
        userInfo: action.userInfo,
        loginState: action.loginState,
      };
  
  
    /*STORE*****************************************/
    case actionType.STORE_REQUESTING:
      return {
        ...state,
        storeState: action.storeState,
      };
    case actionType.STORE_FAILED:
      return {
        ...state,
        storeState: action.storeState,
      };
    case actionType.STORE_FETCHED:
      return {
        ...state,
        stores: action.stores,
        storeState: action.storeState,
      };
    case actionType.STORE_SELECTED:
      return {
        ...state,
        store: action.store,
      };
  
  
  
  
  
    /*CASH REGISTER*****************************************/
    case actionType.CASH_REGISTERS_REQUESTING:
      return {
        ...state,
        cashRegisterState: action.cashRegisterState,
      };
    case actionType.CASH_REGISTERS_FETCHED:
      return {
        ...state,
        cashRegisters: action.cashRegisters,
        cashRegisterState: action.cashRegisterState,
        storeConfig: action.storeConfig,
      };
    case actionType.CASH_REGISTERS_FAILED:
      return {
        ...state,
        cashRegisterState: action.cashRegisterState,
      };
    case actionType.CASH_REGISTERS_SELECTED:
      return {
        ...state,
        cashRegisterChosen: action.cashRegisterChosen,
      };
  
    /*STORE PREF*****************************************/
    case actionType.STORE_PREF_REQUESTING:
      return {
        ...state,
        storePrefState: action.storePrefState,
      };
    case actionType.STORE_PREF_FETCHED:
      return {
        ...state,
        storeConfig: action.storeConfig,
        storePrefState: action.storePrefState,
      };

    case actionType.PAYMENT_OPTIONS:
      return {
        ...state,
        paymentOptions: action.paymentOptions,
    };

    case actionType.STORE_PREF_FAILED:
      return {
        ...state,
        storePrefState: action.storePrefState,
      };
  
  
    case actionType.SIGN_IN: {
      return {
        ...state,
        userInfo: action.userInfo,
      };
    }
    case actionType.SIGN_OUT: {
      return action.loggedOutState;
    }
    case actionType.USER_INFO:
      return {
        ...state,
        posToken: action.posToken,
      };
      
      
      
      
      
      
    case actionType.CR_OPENED:
      return {
        ...state,
        CROpened: action.CROpened,
      };
      
      
      
    case actionType.SYNC_COMPLETED:
      return {
        ...state,
        synced: action.synced,
      };
    case actionType.CR_INVOICE_SERIES_INCREMENT: {
      return {
        ...state,
        cashRegister: {
          ...state.cashRegister,
          LastInvoiceNo: parseInt(action.updatedInvoiceNo.LastInvoiceNo),
          LastInvoiceNo2: parseInt(action.updatedInvoiceNo.LastInvoiceNo2),
        },
      };
    }
    default:
      return state;
  }
}