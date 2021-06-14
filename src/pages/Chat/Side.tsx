import { UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import clsx from 'clsx';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactLoading from 'react-loading';
import { useTypedSelector } from 'store';

import { getReceiver } from 'utils';
import apiClient from 'utils/apiClient';

import { Paginated } from '@feathersjs/feathers';
import { IChat } from 'types';

type Props = {
  chats: IChat[];
  activeChat: Partial<IChat>;
  setChats: React.Dispatch<React.SetStateAction<IChat[]>>;
  onChatClick: (chat: IChat) => void;
};

const Side: React.FC<Props> = ({ chats, activeChat, setChats, onChatClick }) => {
  const user = useTypedSelector((state) => state.user.user);

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const filteredChats = useMemo(() => {
    if (!search) return chats;

    const filtered = chats.filter((chat) => {
      const receiver = chat[getReceiver(user)];
      return (
        receiver?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        receiver?.lastName?.toLowerCase().includes(search.toLowerCase())
      );
    });

    return filtered.sort(
      (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }, [search, chats, user]);

  // const sortedChats = useMemo(() => {
  //   console.log('');

  //   return filteredChats.sort(
  //     (a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
  //   );
  // }, [filteredChats]);

  const getUnreadMessages = (chat: IChat) =>
    chat[(user.role + 'UnreadMessages') as 'clientUnreadMessages' | 'operatorUnreadMessages'];

  const fetchNewChats = async () => {
    const field = user.role === 'client' ? 'clientId' : 'operatorId';

    const response: Paginated<IChat> = await apiClient.service('chats').find({
      query: {
        [field]: user._id,
        $limit: 15,
        $skip: chats.length,
        $search: search || undefined,
        $sort: { lastMessageDate: -1 },
      },
    });

    const newItems = chats.concat(response.data);
    setChats(newItems);

    if (newItems.length >= response.total) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      const field = user.role === 'client' ? 'clientId' : 'operatorId';

      const response: Paginated<IChat> = await apiClient.service('chats').find({
        query: {
          [field]: user._id,
          $limit: 15,
          $skip: 0,
          $sort: { lastMessageDate: -1 },
        },
      });

      console.log('chats', response);
      setChats(response.data);
    };

    fetchChats();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="chat__side">
      <div className="chat__side-search">
        <Avatar src={user.avatar?.path} icon={<UserOutlined />} />
        <Input placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <h2 className="chat__title">Чаты</h2>
      <div className="chat__side-items" id="scrollableContainer">
        <InfiniteScroll
          dataLength={chats.length}
          next={fetchNewChats}
          hasMore={hasMore}
          loader={
            chats.length === 0 ? (
              <span />
            ) : (
              <ReactLoading type="bars" color="#69C262" width="40px" className="loading-center" />
            )
          }
          scrollableTarget="scrollableContainer"
        >
          {filteredChats.map((chat) => {
            return (
              <div
                key={chat._id}
                className={clsx('chat__box', {
                  'chat__box--active': chat._id === activeChat._id,
                })}
                onClick={() => onChatClick(chat)}
              >
                <div className="chat__box__left">
                  <Avatar src={chat[getReceiver(user)]?.avatar?.path} icon={<UserOutlined />} />
                </div>
                <div className="chat__box__center">
                  <div className="chat__box__name">
                    {/* {chat[getReceiver(user)]?.firstName} {chat[getReceiver(user)]?.lastName} */}
                    Клиент {chat.client?.num || '-'}
                  </div>
                  <div className="chat__box__last-message">
                    {chat.lastMessage?.userId === user._id && <span>Вы:</span>}
                    {chat.lastMessage?.type === 'text' && chat.lastMessage?.text}
                    {chat.lastMessage?.type === 'photo' && '📥 Photo'}
                  </div>
                </div>
                <div className="chat__box__right">
                  <div className="chat__box__time">
                    {chat.lastMessageDate ? moment(chat.lastMessageDate).format('HH:mm') : ''}
                  </div>
                  {!!getUnreadMessages(chat) && (
                    <div className="chat__box__messages-count">{getUnreadMessages(chat)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Side;
