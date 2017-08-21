import * as actionType from './actionType';
import * as constants from '../config/constants';
import * as payments from './Payments';
import * as db from '../data/PouchHelper';
import * as invoiceActions from './Invoice';
import uuid from 'react-native-uuid';

export function showDialogWithType(dialogType, isDismissible = true) {
  return {
    type: actionType.SHOW_DIALOG,
    dialogType,
    isDismissible,
  };
}

export function editCustomer(customer) {
  return {
    type: actionType.EDIT_CUSTOMER,
    customer,
  };
}

export function showMessageDialog(title, message, actionButtonTitle = undefined, buttonAction = undefined, isDismissible = true) {
  return {
    type: actionType.SHOW_DIALOG,
    dialogType : constants.ERROR_DIALOG,
    title,
    message,
    isDismissible,
    actionButtonTitle,
    buttonAction,
  };
}


export function showInputDialog(message, payMode,isDismissible = true) {
  return {
    type: actionType.SHOW_DIALOG,
    dialogType : constants.INPUT_DIALOG,
    message,
    paymentMode :payMode,
    isDismissible,
  };
}

export function addTxnID(payMode, txn){
  return payments.addTxnID(payMode, txn);
}

export function searchCustomer(query) {
  return dispatch => {
    db.customerSearch(db.db, query)
      .then(result =>{
        dispatch(updateUserList(result.rows));
      }).catch((error) => {
      });
  };
}

export function searchEmployee(query) {
  return dispatch => {
    db.employeeSearch(db.db, query)
      .then(result =>{
        let employees =[];
        console.log('result', result);
        for(let i=0; i< result.rows.length; i++){
          employees.push({
            id: result.rows[i].doc._id,
            full_name: result.rows[i].doc.full_name,
            contact_no: result.rows[i].doc.contact_no,
            email: result.rows[i].doc.email,
          });
        }
        dispatch(updateEmployeeList(employees));
      }).catch((error) => {
    });
  };
}

export function getEmployee(query) {
  return dispatch => {
    db.employeeSearch(db.db, query)
      .then(result =>{
        dispatch(updateEmployeeList(result.rows));
      }).catch((error) => {
      });
  };
}

export function addNewCustomer(value){
  return dispatch => {
    let guid = uuid.v1();
    let user = {
      full_name: value.name,
      email: value.emailId,
      contact_no: value.phoneNumber,
      gender: value.gender?0:1,                           //0 male, 1 female
      anniversary: value.anniversary,
      guid: guid,
    };
    let address={
      address1: value.addressLine1,
      address2: value.addressLine2,
      city: value.city,
      area: value.area,
      state: value.state,
      pincode: value.pincode,
      identity_guid: guid,
    };
    db.createCustomerDoc(db.db, user)
      .then(result =>{
        db.createIdentityAddressDoc(db.db, address)
          .then(res =>{
            dispatch(invoiceActions.tagInvoiceCustomer({...user, ...address}));
            dispatch(dismissDialog());
          });
      }).catch((error) => {
      });
  };
}
export function addNewItem(data){
  console.log('item value', data.value);
  return dispatch => {
    let guid = uuid.v1();                        // TODO: make sure new id is not existing
    let discountAmount = data.value.discount;
    if(discountAmount != undefined){
      if(discountAmount.indexOf('%') != -1){
        discountAmount = (parseFloat(discountAmount.slice(0,-1))
          * parseFloat(data.value.unitPrice)/100).toFixed(2);
      }
    }
    console.log('discountAmt',discountAmount);
    let item = {
      cost: data.value.purchasePrice,
      price: data.value.unitPrice,
      sub_category_id: data.value.subCategory,
      is_unique_no: data.value.isUniqueNumber,
      unique_label: data.value.uniqueLabel,          //TODO: check keyname
      guid: guid,
      favourite: '',
      item_name: data.value.itemName,
      discount_amount:discountAmount,
      code:data.value.itemCode,
      category_id: data.categoryId,
      item_type:1,

      tax_inclusive: data.value.taxInclusive == undefined? -1:data.value.taxInclusive,
      tax_per_1:data.tax1.tax_per_1,
      tax_per_2:data.tax2.tax_per_2,
      tax_per_3:data.tax3.tax_per_3,
      tax_id_1:data.tax1.tax_id_1,
      tax_id_2:data.tax2.tax_id_2,
      tax_id_3:data.tax3.tax_id_3,
      tax_name_1:data.tax1.tax_name_1,
      tax_name_2:data.tax2.tax_name_2,
      tax_name_3:data.tax3.tax_name_3,

    };
    console.log('element item data', item);
    db.createItemDoc(db.db, item)
      .then(result =>{
        console.log('result', result);
        dispatch(invoiceActions.addItemWithGuid(item));
        dispatch(dismissDialog());
      }).catch((error) => {
        console.log('error', error);
      });
  };
}

export function addEmployeesItem(value){
  return dispatch => {
    dispatch(invoiceActions.tagItemEmployee(value));
    dispatch(dismissDialog());

  };
}

export function addEmployeesInvoice(value){
  return dispatch => {
    dispatch(invoiceActions.tagInvoiceEmployee(value));
    dispatch(dismissDialog());
  };
}

export function updateNewCustomer(value) {
  return dispatch => {
    db.customerSearch(db.db, query)
      .then(result =>{
        dispatch(updateUserList(result.rows));
      }).catch((error) => {
    });
  };
}

export function enableAddNewCustomer() {
  return showDialogWithType(constants.DIALOG_EDIT_CUSTOMER);
}

export function addProductIntoCatalogue() {
  return showDialogWithType(constants.DIALOG_ADD_PRODUCT);
}
export function getTaxes() {
  return dispatch => {
    db.getAllTaxes(db.db)
      .then(data => {
        console.log('tax data',data);
        dispatch(addTaxes(data.rows));
      }).catch(function (error) {
    });
  };
}
export function getCategories() {
  return dispatch => {
    let a = [200090];
    db.getCategory(db.db, a)
      .then(data => {
        dispatch(categoryReceived(data));
      }).catch(function (error) {
    });
  };
}

export function getSubCategories(categoryID) {
  return dispatch => {
    let a = [];
    a.push(categoryID);
    a.push(200090);

    db.getSubCategory(db.db, a)
      .then(data => {
        console.log('getSubCategory', data);
        dispatch(subCategoryReceived(data));
      }).catch(function (error) {
    });
  };
}


export function dismissDialog() {
  return {
    type: actionType.DISMISS_DIALOG,
  };
}

export function addCustomer(customer) {
  return dispatch =>{
    dispatch(dismissDialog());
    dispatch(invoiceActions.tagInvoiceCustomer(customer));
  };
}

export function removeEmployee(employeeId) {
  return {
    type: actionType.REMOVE_EMPLOYEE,
    employeeId: employeeId,
  };
}


export function addEmployee(employee) {
  return {
    type: actionType.ADD_EMPLOYEE,
    employee: employee,
  };
}

export function tagItemEmployee() {
  return {
    type: actionType.TAG_ITEM_EMPLOYEE,
  };
}

export function tagInvoiceEmployee() {
  return {
    type: actionType.TAG_INVOICE_EMPLOYEE,
  };
}

export function tagInvoiceCustomer() {
  return {
    type: actionType.TAG_INVOICE_CUSTOMER,
  };
}

// remove customer from current invoice
export function removeCustomer(customerId) {
  return {
    type: actionType.REMOVE_CUSTOMER,
    customerId: customerId,
  };
}

/******************************** Internal functions *************************/

function updateUserList(users) {
  return {
    type: actionType.UPDATE_USER_LIST,
    users: users,
  };
}

function updateEmployeeList(employees) {
  return {
    type: actionType.UPDATE_EMPLOYEE_LIST,
    employees: employees,
  };
}

function categoryReceived(data) {
  return{
    type: actionType.UPDATE_CATEGORY_LIST,
    categories: data,
  };
}
function subCategoryReceived(data) {
  return{
    type: actionType.UPDATE_SUB_CATEGORY_LIST,
    subCategories: data,
  };
}


function employeeNotFound(inputText) {
  return{
    type: actionType.EMPLOYEE_NOT_FOUND,
    query: inputText,
  };
}

function selectEmployee(employeeList) {
  return{
    type: actionType.EMPLOYEE_NOT_FOUND,
    list: employeeList,
  };
}
function addTaxes(data) {
  return{
    type: actionType.ADD_TAX_DATA,
    taxes: data,
  };
}
