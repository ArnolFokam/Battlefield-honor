import React from "react";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {Provider} from 'react-redux';

import Home from "./components/Home.jsx";
import Game from "./components/Game.jsx";

const App =  ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route exact path="/" component={Home} />
       <Route path="/play" component={Game} />
    </Router>
  </Provider>
);

export default App;