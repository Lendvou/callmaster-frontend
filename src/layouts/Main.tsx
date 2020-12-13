import React, { useEffect, useState } from 'react';
import {
  AlertOutlined,
  LeftOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Drawer, message } from 'antd';
import { useHistory } from 'react-router';
import axios from 'axios';

import { useDataContext } from 'DataContext';

import { getToken, setAuthData } from 'utils';
import apiClient from 'utils/apiClient';

const Main: React.FC<any> = ({ children }) => {
  const history = useHistory();

  const { user, setUser } = useDataContext();

  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

  const goToPage = (page: string) => {
    setIsDrawerVisible(false);
    history.push(page);
  };

  const openFilePicker = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.onchange = onFileUpload;

    picker.click();
  };

  const onFileUpload = async (event: any) => {
    const token = getToken();

    const file = event.target!.files![0];
    const data = new FormData();
    data.append('file', file);
    try {
      const response = (
        await axios({
          method: 'post',
          url: process.env.REACT_APP_FILE_URL,
          data,
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data[0];

      const result = await apiClient
        .service('users')
        .patch(user._id, { avatarId: response._id });

      localStorage.setItem('user', JSON.stringify(result));
      setUser(result);
    } catch (e) {
      console.error('Error while uploading avatar', e);
    }
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
        title="Настройки"
        placement="right"
        closable={false}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        width="15%"
      >
        <div style={{ width: '100%' }}>
          <div className="drawer__user-info">
            <div onClick={() => openFilePicker()}>
              <Avatar
                key={user.avatar?.path}
                src={user.avatar?.path}
                icon={<UserOutlined />}
                size={128}
              />
            </div>
            <div className="drawer__user-name">
              {user.firstName} {user.lastName}
            </div>
          </div>

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
        </div>

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
