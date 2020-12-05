import React from 'react';
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';

import RouteHoc from './Hoc';

import Main from 'layouts/Main';
import Auth from 'layouts/Auth';
import Admin from 'pages/Admin';
import Chat from 'pages/Chat';
import NotFound from 'pages/404';
import Login from 'pages/auth/Login';
import Signup from 'pages/auth/Signup';

const Routes = () => (
  <Router>
    <Switch>
      <Redirect exact path="/" to="/chat" />
      {/* role enum: ['admin', 'operator', 'client'] */}
      <RouteHoc exact path="/404" component={NotFound} />
      <RouteHoc exact path="/login" component={Login} layout={Auth} />
      <RouteHoc exact path="/signup" component={Signup} layout={Auth} />
      <RouteHoc exact path="/chat" component={Chat} layout={Main} isProtected />
      <RouteHoc
        exact
        path="/admin"
        component={Admin}
        layout={Main}
        isProtected
        allowedRoles={['admin']}
      />
      <Redirect to="/404" />
    </Switch>
  </Router>
);

export default Routes;
