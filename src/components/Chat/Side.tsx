import { Paginated } from '@feathersjs/feathers';
import Avatar from 'antd/lib/avatar/avatar';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactLoading from 'react-loading';

import { IChat } from 'types';
import { getUser } from 'utils';
import apiClient from 'utils/apiClient';

type Props = {
  chats: IChat[];
  activeChat: Partial<IChat>;
  setChats: React.Dispatch<React.SetStateAction<IChat[]>>;
  onChatClick: (chat: IChat) => void;
};

const Side: React.FC<Props> = ({
  chats,
  activeChat,
  setChats,
  onChatClick,
}) => {
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchNewChats = async () => {
    const user = getUser();

    console.log('fetch new');

    const response: Paginated<IChat> = await apiClient.service('chats').find({
      query: {
        userId: user._id,
        $limit: 15,
        $skip: chats.length,
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
      const user = getUser();
      const field = user.role === 'client' ? 'clientId' : 'operatorId';

      const response: Paginated<IChat> = await apiClient.service('chats').find({
        query: {
          [field]: user._id,
          $limit: 15,
          $skip: 0,
        },
      });

      console.log('chats', response);

      setChats(response.data);
    };

    fetchChats();
  }, []);

  return (
    <div className="chat__side">
      <div className="chat__side-search"></div>
      <div className="chat__side-items" id="scrollableContainer">
        <InfiniteScroll
          dataLength={chats.length}
          next={fetchNewChats}
          hasMore={hasMore}
          loader={<ReactLoading type="bars" color="#69C262" width="40px" />}
          scrollableTarget="scrollableContainer"
        >
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={clsx('chat__box', {
                'chat__box--active': chat._id === activeChat._id,
              })}
              onClick={() => onChatClick(chat)}
            >
              <div className="chat__box__left">
                <Avatar />
              </div>
              <div className="chat__box__center">
                <div className="chat__box__name">
                  {chat.user.firstName} {chat.user.lastName}
                </div>
                <div className="chat__box__last-message">
                  потом фидбек дай да по цене, чтобы я мог поиметь % нфтм
                </div>
              </div>
              <div className="chat__box__right">
                <div className="chat__box__time">18:37</div>
                <div className="chat__box__messages-count">5</div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Side;
