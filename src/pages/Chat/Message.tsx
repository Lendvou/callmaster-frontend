import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { CheckOutlined } from '@ant-design/icons';

import { IMessage } from 'types';
import { useTypedSelector } from 'store';

type Props = {
  message: IMessage;
};

const Message: React.FC<Props> = ({ message }) => {
  const user = useTypedSelector((state) => state.user.user);

  return (
    <div
      className={clsx('chat-message', {
        'chat-message--yours': message.userId === user._id,
        'chat-message--his': message.userId !== user._id,
      })}
    >
      <div className="chat-message__wrapper">
        {message.type === 'text' && <div className="chat-message__text">{message.text}</div>}
        {message.type === 'photo' && (
          <div className="chat-message__photo">
            {message.photos.map((photo) => (
              <img key={photo._id} src={photo.path} alt="tut doljno bit foto" />
            ))}
          </div>
        )}

        <div className="chat-message__info">
          <div className="chat-message__time">{moment(message.createdAt).format('HH:mm')}</div>
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
};

export default Message;
