import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const user = useSelector((state) => state.userAuth.auth.user);

  return user ? <Component {...rest} /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
