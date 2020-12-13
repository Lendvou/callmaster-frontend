import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

import Routes from 'routes';
import DataContextProvider from 'DataContext';

import { setAuthData } from 'utils';
import apiClient from 'utils/apiClient';

import 'antd/dist/antd.css';
import 'assets/styles/index.scss';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkIsAuth = async () => {
      try {
        const { accessToken, user } = await apiClient.reAuthenticate();

        setAuthData({ user, accessToken });
      } catch (e) {
        setAuthData(null);
        console.error('WHAT THE HELL YOU ARE NOT AUTHENTICATed', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkIsAuth();
  }, []);

  return isLoading ? (
    <div className="page-loading">
      <ReactLoading type="bars" color="#69C262" />
    </div>
  ) : (
    <div className="App">
      <DataContextProvider>
        <Routes />
      </DataContextProvider>
    </div>
  );
}

export default App;
