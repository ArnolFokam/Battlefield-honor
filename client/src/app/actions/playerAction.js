import * as actionTypes from './actionTypes';

export const setPlayerName = (name) => {
    return {
      type: actionTypes.SET_PLAYER_NAME,
      payload: name
    }
 };