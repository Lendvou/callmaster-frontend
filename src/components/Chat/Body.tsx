import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Input } from 'antd';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactLoading from 'react-loading';
import clsx from 'clsx';
import { CheckOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';

import apiClient from 'utils/apiClient';
import { getUser } from 'utils';

import { Paginated } from '@feathersjs/feathers';
import { IChat, IMessage } from 'types';

type Props = {
  activeChat: Partial<IChat>;
};

const Body: React.FC<Props> = ({ activeChat }) => {
  const inputRef = useRef<Input>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchNewMessages = async () => {
    const query = {
      chatId: activeChat._id,
      $limit: 20,
      $skip: messages.length,
      $sort: { createdAt: -1 },
    };

    const result: Paginated<IMessage> = await apiClient
      .service('messages')
      .find({ query });

    const newMessages = result.data.reverse().concat(messages);
    setMessages(newMessages);
    console.log('newmess', newMessages.length, result.total);

    if (newMessages.length >= result.total) {
      setHasMore(false);
    }
  };

  const sendMessage = async () => {
    if (!inputVal) return;
    const user = getUser();

    const data = {
      text: inputVal,
      authorRole: user.role,
      chatId: activeChat._id,
      userId: user._id,
      type: 'text',
    };

    await apiClient.service('messages').create(data);
    setInputVal('');
  };

  const onListScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;

    if (hasMore && element.scrollTop === 0) {
      const oldScrollHeight = element.scrollHeight;

      await fetchNewMessages();
      element.scrollTop = element.scrollHeight - oldScrollHeight;
    }
  };

  useEffect(() => {
    const receiveMessage = (message: IMessage) => {
      const user = getUser();
      const container = listRef.current;
      const shouldScroll: boolean =
        container!.scrollTop + container!.clientHeight ===
        container!.scrollHeight;

      const newMessages = messages.concat(message);
      setMessages(newMessages);

      if (user._id === message.userId || shouldScroll) {
        container!.scrollTop = container!.scrollHeight;
      }
    };

    apiClient.service('messages').on('created', (message: IMessage) => {
      receiveMessage(message);
    });

    return () => {
      apiClient.service('messages').removeListener('created');
    };
  }, [messages]);

  useEffect(() => {
    if (activeChat?._id) {
      const fetchChatMessages = async () => {
        const query = {
          chatId: activeChat._id,
          $limit: 20,
          $skip: 0,
          $sort: { createdAt: -1 },
        };
        const result: Paginated<IMessage> = await apiClient
          .service('messages')
          .find({ query });

        console.log('messages', result);
        const newMessages = result.data.reverse();
        setMessages(newMessages);
        setHasMore(true);

        inputRef.current?.focus();
        listRef.current!.scrollTop = listRef.current!.scrollHeight;
      };

      fetchChatMessages();
    }
  }, [activeChat]);

  return (
    <div className="chat__body">
      {activeChat?._id ? (
        <div className="chat__main">
          <div className="chat__navbar">
            <div className="chat__navbar__left">
              <Avatar className="chat__navbar__avatar" />
              <div className="chat__navbar__name">
                {activeChat.user?.firstName} {activeChat.user?.lastName}
              </div>
            </div>
            <PhoneOutlined className="chat__navbar__phone" />
          </div>

          <div
            className="chat__list"
            ref={listRef}
            id="scrollableList"
            onScroll={onListScroll}
          >
            {messages.map((message, index) => {
              return (
                <div
                  key={message._id}
                  className={clsx('chat-message', {
                    'chat-message--yours': message.userId === getUser()._id,
                    'chat-message--his': message.userId !== getUser()._id,
                  })}
                >
                  <div className="chat-message__wrapper">
                    <div className="chat-message__text">{message.text}</div>
                    <div className="chat-message__info">
                      <div className="chat-message__time">
                        {moment(message.createdAt).format('HH:mm')}
                      </div>
                      <div className="chat-message__received">
                        {message.isRead ? (
                          <div className="chat-message__received-double">
                            <CheckOutlined />
                            <CheckOutlined />
                          </div>
                        ) : (
                          <CheckOutlined />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* <InfiniteScroll
              dataLength={messages.length}
              next={fetchNewMessages}
              hasMore={hasMore}
              loader={<span />}
              // loader={<ReactLoading type="bars" color="#69C262" width="40px" />}
              scrollableTarget="scrollableList"
              inverse
              scrollThreshold={'200px'}
              // scrollThreshold={0.7}
            >
              {messages.map((message, index) => {
                return (
                  <div
                    key={message._id}
                    className={clsx('chat-message', {
                      'chat-message--yours': message.userId === getUser()._id,
                      'chat-message--his': message.userId !== getUser()._id,
                    })}
                  >
                    <div className="chat-message__wrapper">
                      <div className="chat-message__text">{message.text}</div>
                      <div className="chat-message__info">
                        <div className="chat-message__time">
                          {moment(message.createdAt).format('HH:mm')}
                        </div>
                        <div className="chat-message__received">
                          {message.isRead ? (
                            <div className="chat-message__received-double">
                              <CheckOutlined />
                              <CheckOutlined />
                            </div>
                          ) : (
                            <CheckOutlined />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll> */}
          </div>

          <div className="chat__inputs">
            <Input
              ref={inputRef}
              className="chat__input-field"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onPressEnter={() => sendMessage()}
            />
            <SendOutlined
              className="chat__input-send"
              onClick={() => sendMessage()}
            />
          </div>
        </div>
      ) : (
        <div className="chat__select-chat">
          <div className="chat__select-chat-text">Выберите чат</div>
        </div>
      )}
    </div>
  );
};

export default Body;
