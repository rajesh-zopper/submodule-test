import * as actionType from '../actions/actionType';

const initialState = {

  push:{
    percentage : 0,
    syncState : '',
    event : 'Loading',
    unSyncedDataCount : 0,
  },
  pull:{
    percentage : 0,
    syncState : '',
    event : 'Loading',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type){
    case actionType.SYNC:
      if(action.payload.push){
        return {
          ...state,
          push:{
            percentage : action.payload.push.percentage,
            syncState : action.payload.push.syncState,
            event : action.payload.push.event,
            unSyncedDataCount : action.payload.push.unSyncedDataCount === undefined ? 0 : action.payload.push.unSyncedDataCount,
          },
        };
      }else if(action.payload.pull != undefined){
        return {
          ...state,
          pull:{
            percentage : action.payload.pull.percentage,
            syncState : action.payload.pull.syncState,
            event : action.payload.pull.event,
          },
        };
      }else if(action.payload.push && action.payload.pull){
        return {
          ...state,
          push:{
            percentage : action.payload.push.percentage,
            syncState : action.payload.push.syncState,
            event : action.payload.push.event,
            unSyncedDataCount : action.payload.push.unSyncedDataCount === undefined ? 0 : action.payload.push.unSyncedDataCount,
          },pull:{
            percentage : action.payload.pull.percentage,
            syncState : action.payload.pull.syncState,
            event : action.payload.pull.event,
          },
        };
      }else{
        return state;
      }
    default:
      return state;
  }


}