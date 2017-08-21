import * as actionType from '../actions/actionType';
import * as helper from '../Utils/helper';
import * as constants from '../config/constants';
export const initInvoice ={
  items: {},
  itemOrder:[],
  selectedItemId: -1,
  menuOptionSelected:'',
  
  // customer_guid: null,
  // client_id: 12,
  // client_name: '12345678901234567890',
  // client_mobile_no: '9890964016',
  // client_email: 'roshan.sawant@zopper.com',
};

const baseVisibility= {
  isMenuVisible:false,
  isInvoiceListVisible:false,
  isDialogVisible: false,
};

const initialDialogState ={
  dialogType: undefined,
  users: undefined,
  employees: undefined,
  currentUser: undefined,
  currentEmployee: undefined,
};

export const init = {
  currentInvoice:{
    ...initInvoice,
  },
  ...baseVisibility,
  ...initialDialogState,
  invoices:[],
  users:[],
};

// local added keys in item: qty, discount,
// discount is an array with each object having two keys type and value,

function getValue(value){
  return value;
}

function getRemoveItemState(state, itemId) {
  
  console.log('old itemOrder',itemId, [...state.currentInvoice.itemOrder]);
  let indexOfItem = state.currentInvoice.itemOrder.indexOf(itemId);
  let newOrder = [...state.currentInvoice.itemOrder.slice(0,indexOfItem), ...state.currentInvoice.itemOrder.slice((indexOfItem+1))];
  
  console.log('index', getValue(indexOfItem));
  console.log('new itemOrder',[...newOrder]);
  let newSelectedItemId;
  if(newOrder.length ==0){
    newSelectedItemId =-1;
  }else if(newOrder.length== indexOfItem){
    newSelectedItemId = newOrder[indexOfItem-1];
  }else{
    newSelectedItemId = newOrder[indexOfItem];
  }
  
  console.log('getRemoveItemState',newSelectedItemId);
  // let itemIds = Object.keys(state.currentInvoice.items);
  // let currentItemIndex = itemIds.findIndex(listItemId =>  listItemId== itemId);
  // let newIndex;
  // if(currentItemIndex == itemIds.length-1){
  //   newIndex = currentItemIndex-1;
  // }else{
  //   newIndex = currentItemIndex+1;
  // }
  // let newSelectedItemId = itemIds[newIndex];

  let { [itemId]: deletedItemValue, ...invoiceItems } = state.currentInvoice.items;

  return {...state,
    currentInvoice: {...state.currentInvoice,
      items: {...invoiceItems},
      itemOrder: newOrder,
      selectedItemId: newSelectedItemId,
    },
  };
}

export default function invoice(state = init, action) {
  switch (action.type) {

    /************************** ITEM RELATED **********************/
    case actionType.ADD_ITEM: {
      if (action.item.id in state.currentInvoice.items) {
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.item.id]: {...state.currentInvoice.items[action.item.id],
                qty: parseInt(state.currentInvoice.items[action.item.id].qty) + 1,
              },
            },
            selectedItemId: action.item.id,
          },
        };
      } else {
        return {...state,
          currentInvoice:{...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.item.id]: action.item},
            selectedItemId: action.item.id,
            itemOrder: state.currentInvoice.itemOrder.concat(action.item.id),
          },
        };
      }
    }
    case actionType.ADD_ITEM_GUID: {
      return {...state,
        currentInvoice:{...state.currentInvoice,
          items: {...state.currentInvoice.items,
            [action.item.guid]: action.item},
          selectedItemId: action.item.guid,
          itemOrder: state.currentInvoice.itemOrder.concat(action.item.guid),
        },
      };
      
    }
    case actionType.REMOVE_ITEM: {
      if (action.itemId in state.currentInvoice.items) {
        return getRemoveItemState(state, action.itemId);
      } else {
        return state;
      }
    }
    case actionType.ITEM_QUANTITY_INCREMENT: {
      if (action.itemId in state.currentInvoice.items) {
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.itemId]: {...state.currentInvoice.items[action.itemId],
                qty: parseInt(state.currentInvoice.items[action.itemId].qty) + 1,
              },
            },
            selectedItemId: action.itemId,
          },
        };
      } else {
        return state;
      }
    }
    case actionType.ITEM_QUANTITY_DECREMENT: {
      if (action.itemId in state.currentInvoice.items) {
        if(state.currentInvoice.items[action.itemId].qty == 1){
          return getRemoveItemState(state, action.itemId);
        } else {
          return {
            ...state,
            currentInvoice: {
              ...state.currentInvoice,
              items: {
                ...state.currentInvoice.items,
                [action.itemId]: {
                  ...state.currentInvoice.items[action.itemId],
                  qty: parseInt(state.currentInvoice.items[action.itemId].qty) - 1,
                },
              },
              selectedItemId: action.itemId,
            },
          };
        }
      } else {
        return state;
      }
    }
    case actionType.ITEM_QUANTITY_FIXED: {
      if (action.itemId in state.currentInvoice.items) {
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.itemId]: {...state.currentInvoice.items[action.itemId],
                qty: parseInt(action.quantity),
              },
            },
            selectedItemId: action.itemId,
          },
        };
      } else {
        return state;
      }
    }
    case actionType.UPDATE_ITEM_PRICE: {
      if (action.itemId in state.currentInvoice.items) {
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.itemId]: {...state.currentInvoice.items[action.itemId],
                price: parseFloat(action.price).toFixed(2),
                old_price: getValue(state.currentInvoice.items[action.itemId].price),
              },
            },
            selectedItemId: action.itemId,
          },
        };
      } else {
        return state;
      }
    }
    case actionType.SELECT_ITEM:{
      if (action.itemId in state.currentInvoice.items) {
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            selectedItemId: action.itemId,
          },
        };
      } else {
        return state;
      }
    }
    case actionType.UPDATE_ITEM_DISCOUNT: {
      if (action.itemId in state.currentInvoice.items
        && action.discountValue !=='') {
        
        let itemDiscount = {
          type: action.discountType,
          value: action.discountValue,
        };
        return {
          ...state,
          currentInvoice: { ...state.currentInvoice,
            items: {...state.currentInvoice.items,
              [action.itemId]: {...state.currentInvoice.items[action.itemId],
                discount: (action.removeBaseDiscount? [itemDiscount] :
                  [...state.currentInvoice.items[action.itemId].discount, itemDiscount]),
              },
            },
            selectedItemId: action.itemId,
          },
        };
      } else {
        return state;
      }
    }
    case actionType.UPDATE_ALL_ITEMS_DISCOUNT: {
      if(action.discountType == constants.DISCOUNT_PERCENT) {
        let itemDiscount = {
          type: action.discountType,
          value: action.discountValue,
        };

        let changedItems={};
        for (let itemId in state.currentInvoice.items) {
          changedItems[itemId] = {
            ...state.currentInvoice.items[itemId],
            discount: (action.removeBaseDiscount ? [itemDiscount] :
              [...state.currentInvoice.items[itemId].discount, itemDiscount]),
          };
        }
        return {
          ...state,
          currentInvoice: {
            ...state.currentInvoice,
            items: {...changedItems},
          },
        };
      } else{
        let calculatedDiscounts = helper
          .getPostDiscountPrice(state.currentInvoice.items, action.discountValue);

        let changedItems={};

        for (let itemId in state.currentInvoice.items) {
          changedItems[itemId] = {
            ...state.currentInvoice.items[itemId],
            discount: (action.removeBaseDiscount ? [calculatedDiscounts[itemId].discount] :
              [...state.currentInvoice.items[itemId].discount, calculatedDiscounts[itemId].discount]),
          };
        }
        return {
          ...state,
          currentInvoice: {
            ...state.currentInvoice,
            items: {...changedItems},
          },
        };
      }
    }
    case actionType.TAG_ITEM_EMPLOYEE :{
      console.log('action', action);
      // if (action.itemId in state.currentInvoice.items) {
      console.log('selectedItemId', state.selectedItemId);
      let selectedItem = state.currentInvoice.selectedItemId;
      if(selectedItem == undefined){
        selectedItem= state.itemOrder[0];
      }
      let updatedItems = {
        ...state.currentInvoice.items,
        [selectedItem]: {...state.currentInvoice.items[selectedItem],
          employee: action.employee,
        },
      };
      console.log('updatedItem',updatedItems);
      
      return {
        ...state,
        currentInvoice: { ...state.currentInvoice,
          items: updatedItems,
        },
      };
      // } else {
      //   return state;
      // }
    }
    case actionType.TAG_INVOICE_EMPLOYEE :{
      console.log('TAG_INVOICE_EMPLOYEE', action);
      let updatedItems = helper.addEmployeeToItems(state.currentInvoice.items, action.employee)
      console.log('updatedItem',updatedItems);
      
      return {
        ...state,
        currentInvoice: { ...state.currentInvoice,
          items: updatedItems,
        },
      };
      // } else {
      //   return state;
      // }
    }
    /******************************* CURRENT DRAFT RELATED *******************/

    case actionType.TAG_INVOICE_CUSTOMER:{
      return {
        ...state,
        currentInvoice:{...state.currentInvoice,
          customer_guid: action.customer.guid,
          client_id: action.customer.id,
          client_name:action.customer.full_name,
          client_mobile_no:action.customer.contact_no,
          client_email:action.customer.email,
        },
      };
    }

    case actionType.UPDATE_USER_LIST:{
      return {
        ...state,
        users: action.users,
      };
    }



    /******************************* MULITPLE DRAFT RELATED ******************/

    case actionType.SHOW_DIALOG:{
      return {
        ...state,
        isDialogVisible: true,
        dialogType: action.dialogType,
      };
    }
    case actionType.TOGGLE_INVOICE_MENU: {
      return {
        ...state,
        isMenuVisible: !state.isMenuVisible,
        isInvoiceListVisible : false,
      };
    }
    case actionType.TOGGLE_INVOICE_LIST:{
      return {
        ...state,
        isMenuVisible: false,
        isInvoiceListVisible : !state.isInvoiceListVisible,
      };
    }
    case actionType.SHOW_INVOICE_LIST:{
      return {
        ...state,
        isMenuVisible: false,
        isInvoiceListVisible : true,
      };
    }

    case actionType.ADD_NEW_INVOICE: {
      if(Object.keys(state.currentInvoice.items).length == 0
        && state.currentInvoice.customerId == undefined ){
        return {
          ...state,
          isMenuVisible: false,
        };
      } else {
        return {
          ...state,
          currentInvoice:{...action.currentInvoice},
          isMenuVisible: false,
          invoices: state.invoices.concat({
            id:action.currentInvoice.id,
            total: helper.getTotalAmount(action.currentInvoice.items),
          }),
        };
      }
    }
    case actionType.SET_INITIAL_INVOICES: {
      return {
        ...state,
        currentInvoice:{...action.currentInvoice},
        isMenuVisible: false,
        invoices: action.invoices,

      };
    }
    case actionType.RESET_INVOICE: {
      return {
        ...state,
        currentInvoice:{...action.currentInvoice},
        isMenuVisible: false,
      };
    }
    case actionType.REPLACE_CURRENT_INVOICE: {
      return {
        ...state,
        currentInvoice: action.selectedInvoice,
        isInvoiceListVisible: false,
      };
    }
    case actionType.UPDATE_INVOICE_REVISION: {
      return {
        ...state,
        currentInvoice: {...state.currentInvoice,
          _rev: action.rev},
      };
    }
  
    case actionType.ALL_INVOICES_REQUESTING:
      return {
        ...state,
        invoicesList: action.invoices,
        invoicesState: action.invoicesState,
      };
    case actionType.ALL_INVOICES_FAILED:
      return {
        ...state,
        invoicesList: action.invoices,
        invoicesState: action.invoicesState,
      };
    case actionType.ALL_INVOICES_FETCHED:
      return {
        ...state,
        invoicesList: action.invoices,
        invoicesState: action.invoicesState,
      };
    case actionType.MENU_OPTIONS_SELECTED:
      return {
        ...state,
        menuOptionSelected: action.menuOptionSelected,
      };
    default:
      return state;
  }
}
