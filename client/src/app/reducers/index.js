import PlayerReducer from "./PlayerReducer.js"
import { combineReducers } from "redux";

export default combineReducers({
     player: PlayerReducer
});