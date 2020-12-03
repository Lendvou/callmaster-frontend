import React, { useEffect, useState } from 'react';
import { AlertOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';

import Chat from 'components/Chat';
import { setAuthData } from 'utils';
import { useHistory } from 'react-router';
import apiClient from 'utils/apiClient';
import { Drawer, message } from 'antd';

const Main = () => {
  const history = useHistory();

  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

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

  const toggleColorMode = () => {
    const isDarkMode = localStorage.getItem('darkMode');

    if (isDarkMode === '1') {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', '0');
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', '1');
    }
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode === '1') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <div className="main">
      <MenuOutlined
        className="main__settings-icon"
        onClick={() => setIsDrawerVisible(true)}
      />

      <Drawer
        className="drawer"
        title="Настройки"
        placement="right"
        closable={false}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        width="15%"
      >
        <div className="drawer__color-mode">
          <AlertOutlined onClick={toggleColorMode} />
        </div>

        <div className="drawer__logout">
          Выйти
          <LogoutOutlined className="drawer__logout" onClick={logout} />
        </div>
      </Drawer>

      <Chat />
    </div>
  );
};

export default Main;
