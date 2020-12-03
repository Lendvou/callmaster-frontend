import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Divider, Input } from 'antd';
import moment from 'moment';
import clsx from 'clsx';
import {
  CheckOutlined,
  PhoneOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import apiClient from 'utils/apiClient';
import { getReceiver, getUser } from 'utils';

import { Paginated } from '@feathersjs/feathers';
import { IChat, IMessage, IUpload } from 'types';
import UploadFile from 'components/UploadFile';

type Props = {
  activeChat: Partial<IChat>;
  onNewMessageAdded: (message: IMessage) => void;
};

const Body: React.FC<Props> = ({ activeChat, onNewMessageAdded }) => {
  const inputRef = useRef<Input>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchNewMessages = async () => {
    const query = {
      chatId: activeChat._id,
      $limit: 20,
      $skip: messages.length,
      $sort: { createdAt: -1 },
      $read: true,
    };

    const result: Paginated<IMessage> = await apiClient
      .service('messages')
      .find({ query });

    const newMessages = result.data.reverse().concat(messages);
    setMessages(newMessages);

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

  const checkIfDividerIsNeeded = (
    message: IMessage,
    index: number
  ): boolean => {
    return (
      !!messages[index + 1] &&
      !moment(messages[index + 1].createdAt).isSame(
        moment(message.createdAt),
        'day'
      )
    );
  };

  const createPhotoMessage = async (uploads: IUpload[]) => {
    const user = getUser();
    try {
      await apiClient.service('messages').create({
        type: 'photo',
        photosIds: uploads.map((el) => el._id),
        authorRole: user.role,
        chatId: activeChat._id,
        userId: user._id,
      });
      setIsModalVisible(false);
    } catch (e) {
      console.error('photo error', e);
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
      if (activeChat._id) {
        receiveMessage(message);
      }
      onNewMessageAdded(message);
    });

    return () => {
      apiClient.service('messages').removeListener('created');
    };
  }, [messages, activeChat, onNewMessageAdded]);

  useEffect(() => {
    if (activeChat?._id) {
      const fetchChatMessages = async () => {
        const query = {
          chatId: activeChat._id,
          $limit: 20,
          $skip: 0,
          $sort: { createdAt: -1 },
          $read: true,
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

        setTimeout(() => {
          if (
            listRef.current!.scrollTop + listRef.current!.clientHeight !==
            listRef.current!.scrollHeight
          ) {
            listRef.current!.scrollTop = listRef.current!.scrollHeight;
          }
        }, 100);
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
                {activeChat[getReceiver()]?.firstName}{' '}
                {activeChat[getReceiver()]?.lastName}
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
            {messages.map((message, index) => (
              <div key={message._id}>
                <div
                  className={clsx('chat-message', {
                    'chat-message--yours': message.userId === getUser()._id,
                    'chat-message--his': message.userId !== getUser()._id,
                  })}
                >
                  <div className="chat-message__wrapper">
                    {message.type === 'text' && (
                      <div className="chat-message__text">{message.text}</div>
                    )}
                    {message.type === 'photo' && (
                      <div className="chat-message__photo">
                        {message.photos.map((photo) => (
                          <img
                            key={photo._id}
                            src={photo.path}
                            alt="foto path"
                          />
                        ))}
                      </div>
                    )}
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

                {checkIfDividerIsNeeded(message, index) && (
                  <Divider>
                    {moment(messages[index + 1].createdAt).format('DD.MM.YYYY')}
                  </Divider>
                )}
              </div>
            ))}
          </div>

          <div className="chat__inputs">
            <UploadOutlined
              className="chat__input-upload"
              onClick={() => setIsModalVisible(true)}
            />
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

      <UploadFile
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onOk={createPhotoMessage}
      />
    </div>
  );
};

export default Body;
