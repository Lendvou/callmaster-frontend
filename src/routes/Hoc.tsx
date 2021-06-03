import React from 'react';
import { Route, RouteProps } from 'react-router';
import { Redirect } from 'react-router-dom';
import { useTypedSelector } from 'store';

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
  const { user, isAuth } = useTypedSelector((state) => state.user);

  if (isProtected && !isAuth) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role!)) {
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
