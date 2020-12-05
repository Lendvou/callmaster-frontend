import React from 'react';

const Auth: React.FC<any> = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">{children}</div>
    </div>
  );
};

export default Auth;
