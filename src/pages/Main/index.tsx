import React from 'react';
import { MenuOutlined } from '@ant-design/icons';

import Chat from 'components/Chat';
import { setAuthData } from 'utils';
import { useHistory } from 'react-router';
import apiClient from 'utils/apiClient';
import { message } from 'antd';

const Main = () => {
  const history = useHistory();

  const logout = async () => {
    try {
      await apiClient.logout();
      setAuthData(null);
      history.push('/login');
    } catch (e) {
      message.error('Не удалось разлогиниться', 4);
      console.error('Error while unlogging', e);
    }
  };

  return (
    <div className="main">
      <MenuOutlined className="main__settings-icon" onClick={logout} />

      <Chat />
    </div>
  );
};

export default Main;
