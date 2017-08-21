import * as actionType from './actionType';

export default function sync(payload) {
  return {
    type: actionType.SYNC,
    payload,
  };
}

export function syncComplete(event){
  return dispatch => {
    dispatch(sync(event));
  };

}