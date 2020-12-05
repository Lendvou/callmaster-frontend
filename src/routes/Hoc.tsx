import React from 'react';
import { Route, RouteProps } from 'react-router';
import { Redirect } from 'react-router-dom';

import { getUser, isUserAuth } from 'utils';

type Props = {
  isProtected?: boolean;
  allowedRoles?: ('admin' | 'operator' | 'client')[];
  layout?: React.FC<any>;
} & RouteProps;

const RouteHoc: React.FC<Props> = ({
  isProtected = false,
  allowedRoles,
  layout: Layout,
  ...rest
}) => {
  const user = getUser();

  if (isProtected && !isUserAuth()) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/404" />;
  }

  if (!Layout) {
    return <Route {...rest} />;
  }
  return (
    <Layout>
      <Route {...rest} />
    </Layout>
  );
};

export default RouteHoc;
