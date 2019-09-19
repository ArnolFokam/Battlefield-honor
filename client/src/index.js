import React from "react";
import ReactDOM from "react-dom";

import App from "./app/App.jsx";

import reducers from "./app/reducers/index.js";
import configureStore from './app/store/configureStore.js';

FB.ui({
    method: "feed",
    link: "https://apps.facebook.com/risky-steps/",
    caption: "Play Risky Steps now!!",
    name: "My best score on Risky steps is " + 89 + "!!!!",
    description: "I scored " + 90 + " points on Risky Steps. Can you beat my score?",
    picture: "https://www.feronato.com/facebook/risky-steps/assets/pictures/feedpic.png"
}, function(response) {});


const store = configureStore();

window.store = store;

ReactDOM.render( < App store = {
            store
        }
        /> , document.getElementById("root"));