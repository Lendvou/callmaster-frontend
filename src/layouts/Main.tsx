import React, { useEffect, useState } from 'react';
import {
  AlertOutlined,
  LeftOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';

import { getUser, setAuthData } from 'utils';
import { useHistory } from 'react-router';
import apiClient from 'utils/apiClient';
import { Drawer, message } from 'antd';
import { Link } from 'react-router-dom';

const Main: React.FC<any> = ({ children }) => {
  const history = useHistory();

  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

  const user = getUser();

  const goToPage = (page: string) => {
    setIsDrawerVisible(false);
    history.push(page);
  };

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
      <LeftOutlined
        className="main__settings-icon"
        onClick={() => setIsDrawerVisible(true)}
      />

      <Drawer
        className="drawer"
        title="Панель"
        placement="right"
        closable={false}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        width="15%"
      >
        {user.role === 'admin' ? (
          <div className="drawer__list">
            <div
              onClick={() => goToPage('/chat')}
              className="drawer__list-item"
            >
              <MenuOutlined />
              Чат
            </div>
            <div
              onClick={() => goToPage('/admin')}
              className="drawer__list-item"
            >
              <MenuOutlined />
              Админ панель
            </div>
          </div>
        ) : (
          <div />
        )}

        <div className="drawer__bottom">
          <div className="drawer__color-mode">
            <AlertOutlined onClick={toggleColorMode} />
          </div>

          <div className="drawer__logout">
            Выйти
            <LogoutOutlined className="drawer__logout" onClick={logout} />
          </div>
        </div>
      </Drawer>

      {children}
    </div>
  );
};

export default Main;
