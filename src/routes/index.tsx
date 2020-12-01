import React from 'react';
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

import RouteHoc from './Hoc';

import Main from 'pages/Main';
import Login from 'pages/auth/Login';
import Signup from 'pages/auth/Signup';

const Routes = () => (
  <Router>
    <Switch>
      <Redirect exact path="/" to="/chat" />
      {/* role enum: ['admin', 'operator', 'client'] */}
      <RouteHoc exact path="/login" component={Login} />
      <RouteHoc exact path="/signup" component={Signup} />
      <RouteHoc exact path="/chat" component={Main} isProtected />
    </Switch>
  </Router>
);

export default Routes;
