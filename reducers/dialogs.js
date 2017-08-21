import * as actionType from '../actions/actionType';
import * as constants from '../config/constants';
// import * as helper from '../Utils/helper';

const initialDialogState ={
  dialogType: undefined,
  isDialogVisible: false,
  isDismissible: true,
  title : '',
  message : '',
  
  //employee
  employees: undefined,
  selectedEmployees: [],
  
  //customer
  users: undefined,
  currentUser: undefined,
  
  //add item
  categories: undefined,
  subCategories: undefined,
  taxes: undefined,
};

function removeEmployee(employeeList, employeeId) {
  let newList =[];
  for(let i=0; i<employeeList.length; i++){
    if(employeeList[i] == employeeId){
      continue;
    } else {
      newList.push(employeeList[i]);
    }
  }
  return newList;
}

export default function reducer(state = initialDialogState, action) {

  switch (action.type) {

    case actionType.SHOW_DIALOG:{
      return {
        ...state,
        ...action,
        isDialogVisible: true,
        paymentMode : action.payMode,
      };
    }
    case actionType.DISMISS_DIALOG:{
      return {
        ...initialDialogState,
      };
    }
    case actionType.UPDATE_USER_LIST:{
      return {
        ...state,
        users: action.users,
      };
    }
    case actionType.UPDATE_EMPLOYEE_LIST:{
      return {
        ...state,
        employees: action.employees,
      };
    }
    case actionType.ADD_EMPLOYEE:{
      return {
        ...state,
        selectedEmployees: state.selectedEmployees.concat(action.employee),
      };
    }
    case actionType.REMOVE_EMPLOYEE:{
      let selectedEmployees = removeEmployee(state.selectedEmployees, action.employeeId);
      return {
        ...state,
        selectedEmployees: selectedEmployees,
      };
    }
    case actionType.EDIT_CUSTOMER:{
      return {
        ...state,
        dialogType: constants.DIALOG_EDIT_CUSTOMER,
        currentUser: action.customer,
      };
    }
    case actionType.UPDATE_CATEGORY_LIST:{
      return {
        ...state,
        categories: action.categories,
      };
    }
    case actionType.UPDATE_SUB_CATEGORY_LIST:{
      return {
        ...state,
        subCategories: action.subCategories,
      };
    }
    case actionType.ADD_TAX_DATA:{
      return {
        ...state,
        taxes: action.taxes,
      };
    }

    default:
      return state;
  }
}
