import React, { useState } from 'react';

import Side from './Side';
import Body from './Body';

import { IChat } from 'types';

const Chat = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChat, setActiveChat] = useState<Partial<IChat>>({});

  return (
    <div className="chat">
      <Side
        chats={chats}
        activeChat={activeChat}
        setChats={setChats}
        onChatClick={setActiveChat}
      />
      <Body activeChat={activeChat} />
    </div>
  );
};

export default Chat;
