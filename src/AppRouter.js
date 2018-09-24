import React, { Component } from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';

import App from './App';
import StockDetail from './StockDetail';

class AppRouter extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={App}/>
          <Route path="/detail/:symbol" component={StockDetail}/>
        </Switch>
      </BrowserRouter>
    );
  }
};

export default AppRouter;