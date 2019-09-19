import React from "react";
import ReactDOM from "react-dom";

import App from "./app/App.jsx";

import reducers from "./app/reducers/index.js";
import configureStore from './app/store/configureStore.js';


const store = configureStore();

window.store = store;

ReactDOM.render( < App store = {
            store
     }
 /> , document.getElementById("root"));