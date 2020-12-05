import React, { useEffect, useState } from 'react';
import querystring from 'query-string';

import Side from './Side';
import Body from './Body';

import { IChat, IMessage, IUser } from 'types';
import { useLocation } from 'react-router';
import apiClient from 'utils/apiClient';
import {
  getRandomInteger,
  getUnreadMessages,
  getUnreadMessagesKey,
  getUser,
} from 'utils';
import { Paginated } from '@feathersjs/feathers';

const Chat = () => {
  const { search } = useLocation();

  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChat, setActiveChat] = useState<Partial<IChat>>({});

  // const patchLastMessage = (message: IMessage) => {
  //   const newChats = chats.map((chat) => {
  //     if (message.chatId === chat._id) {
  //       return {
  //         ...chat,
  //         lastMessageId: message._id,
  //         lastMessage: message,
  //         lastMessageDate: message.createdAt,
  //         unreadMessagesCount:
  //           activeChat._id !== message.chatId
  //             ? chat.unreadMessagesCount + 1
  //             : chat.unreadMessagesCount,
  //       };
  //     }
  //     return chat;
  //   });
  //   console.log('newchats', newChats);

  //   setChats(newChats);
  // };

  const chatClicked = (chat: IChat) => {
    const newChats = chats.map((item) => {
      if (item._id === chat._id) {
        return {
          ...chat,
          [getUnreadMessagesKey()]: 0,
        };
      }
      return item;
    });

    setChats(newChats);
    setActiveChat(chat);
  };

  useEffect(() => {
    const parsedQuery = querystring.parse(search);
    const user = getUser();
    if (parsedQuery.from === 'client' && user.role === 'client') {
      const connectToOperator = async () => {
        const {
          data: idleOperators,
        }: Paginated<IUser> = await apiClient.service('users').find({
          query: {
            role: 'operator',
            isOnline: true,
            isBusy: false,
          },
        });
        if (idleOperators.length === 0) return;

        const randomInteger = getRandomInteger(0, idleOperators.length - 1);
        const randomIdleOperator = idleOperators[randomInteger];
        // debugger;
        console.log('conect', idleOperators, randomIdleOperator, user);

        try {
          const newChat: IChat = await apiClient.service('chats').create({
            clientId: getUser()._id,
            operatorId: randomIdleOperator._id,
          });
          setActiveChat(newChat);
        } catch (e) {
          console.error('Error while creating chat', e);
        }
      };

      connectToOperator();
    }
  }, [search]);

  useEffect(() => {
    apiClient.service('chats').on('created', (chat: IChat) => {
      console.log('created chat', chat);
      setChats((v) => [chat, ...v]);
    });
    apiClient.service('chats').on('patched', (chat: IChat) => {
      console.log('patched chat', chat);
      const newChats = chats.map((item) => {
        if (item._id === chat._id) {
          return {
            ...chat,
            [getUnreadMessagesKey()]:
              activeChat._id === chat._id ? 0 : getUnreadMessages(chat),
          };
        }
        return item;
      });
      setChats(newChats);
    });

    return () => {
      apiClient.service('chats').removeListener('created');
      apiClient.service('chats').removeListener('patched');
    };
  }, [chats]);

  return (
    <div className="chat">
      <Side
        chats={chats}
        activeChat={activeChat}
        setChats={setChats}
        onChatClick={chatClicked}
      />
      <Body
        activeChat={activeChat}
        onNewMessageAdded={() => console.log('jdjdjj')}
      />
    </div>
  );
};

export default Chat;
