import * as actionTypes from '../actions/actionTypes';

const initialState = {
	name: null
}

export default (state = initialState, action) => {
    switch (action.type){
      
      case actionTypes.SET_PLAYER_NAME:
      return {
      	...state, 
      	name: action.payload
      }
      default:
            return state;
    }
};