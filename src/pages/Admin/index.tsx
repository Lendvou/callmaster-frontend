import React from 'react';

import Signup from 'pages/auth/Signup';

const AdminPage = () => {
  return (
    <div className="admin">
      <h2 className="admin__title">Wellcum to the admin page</h2>
      <div className="admin__signup">
        <Signup title="Добавление пользователя" isFromAdmin />
      </div>
    </div>
  );
};

export default AdminPage;
