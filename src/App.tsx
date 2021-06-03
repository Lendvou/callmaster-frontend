import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

import Routes from 'routes';

import store from 'store';
import { checkIsUserAuth } from 'store/user/thunkActions';

import 'antd/dist/antd.css';
import 'assets/styles/index.scss';
import { Provider } from 'react-redux';
import { initPeer } from 'store/core/thunkActions';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkIsAuth = async () => {
      try {
        await store.dispatch(checkIsUserAuth());
        store.dispatch(initPeer());
      } catch (e) {
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
    <Provider store={store}>
      <div className="App">
        <Routes />
      </div>
    </Provider>
  );
}

export default App;
