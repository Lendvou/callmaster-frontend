import React, { useState, useContext, ReactElement } from 'react';
import { IUser } from 'types';

type DataContextType = {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
};

const DataContext = React.createContext<DataContextType>({
  user: {} as DataContextType['user'],
  setUser: (() => {}) as DataContextType['setUser'],
});

const currentUser: IUser = JSON.parse(localStorage.getItem('user') as any);

const DataContextProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [user, setUser] = useState<Partial<IUser>>(currentUser);

  const providerObject = {
    user,
    setUser,
  } as DataContextType;

  return (
    <DataContext.Provider value={providerObject}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};

export default DataContextProvider;
