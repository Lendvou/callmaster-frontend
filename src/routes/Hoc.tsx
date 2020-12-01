import React from 'react';
import { Route, RouteProps } from 'react-router';
import { Redirect } from 'react-router-dom';

import { getUser, isUserAuth } from 'utils';

type Props = {
  isProtected?: boolean;
  allowedRoles?: ('admin' | 'operator' | 'client')[];
} & RouteProps;

const RouteHoc: React.FC<Props> = ({
  isProtected = false,
  allowedRoles,
  ...rest
}) => {
  const user = getUser();

  if (isProtected && !isUserAuth()) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Route {...rest} />;
};

export default RouteHoc;
