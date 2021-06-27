import React, { useEffect, useRef, useState } from 'react';
import querystring from 'query-string';
import Peer from 'peerjs';
import { Modal } from 'antd';
import { useLocation } from 'react-router';

import Side from './Side';
import Body from './Body';

import apiClient from 'utils/apiClient';
import { getRandomInteger, getUnreadMessages, getUnreadMessagesKey } from 'utils';

import { Paginated } from '@feathersjs/feathers';
import { IChat, IUser } from 'types';
import { useTypedSelector } from 'store';

const Chat = () => {
  const { search } = useLocation();

  const audioRef = useRef<HTMLAudioElement>(null);

  const user = useTypedSelector((state) => state.user.user);
  const peer = useTypedSelector((state) => state.core.peer);

  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChat, setActiveChat] = useState<Partial<IChat>>({});
  const [currentCall, setCurrentCall] = useState<Peer.MediaConnection | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  const chatClicked = (chat: IChat) => {
    const newChats = chats.map((item) => {
      if (item._id === chat._id) {
        return {
          ...chat,
          [getUnreadMessagesKey(user)]: 0,
        };
      }
      return item;
    });

    setChats(newChats);
    setActiveChat(chat);
  };

  const callUser = async () => {
    if (!activeChat?._id) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const otherId = ['operator', 'admin'].includes(user.role)
      ? activeChat.client!._id
      : activeChat.operator!._id;
    const call = peer.call(otherId, stream);

    call.on('stream', (userAudioStream) => {
      const audioEl = audioRef.current;
      addAudioStream(audioEl!, userAudioStream);
      setCurrentCall(call);
    });

    call.on('close', () => {
      console.log('caller onclose');
      setCurrentCall(null);
      setIsCallActive(false);
    });
  };

  useEffect(() => {
    const onPeerCall = async (call: Peer.MediaConnection) => {
      const caller = await apiClient.service('users').get(call.peer);
      console.log('call', call, caller, call.peer);
      // const caller = await apiClient.service('users').get(call.peer);

      Modal.confirm({
        title: `Клиент ${caller.num} вам звонит, ответить?`,
        centered: true,
        okText: 'Да',
        cancelText: 'Нет',
        onOk: async () => {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          call.answer(stream);
          setIsCallActive(true);
          setCurrentCall(call);

          call.on('stream', (userAudioStream) => {
            const audioEl = audioRef.current;
            addAudioStream(audioEl!, userAudioStream);
          });
          call.on('close', () => {
            console.info('callee onclose');
            setCurrentCall(null);
            setIsCallActive(false);
          });
        },
        onCancel: () => {
          call.close();
        },
      });
    };

    peer.on('call', onPeerCall);

    const logg = () => {
      console.log('zaclousil');
    };

    peer.on('close', logg);

    return () => {
      peer.off('call', onPeerCall);
      peer.off('close', logg);
    };
  }, [peer, activeChat, currentCall]);

  useEffect(() => {
    const parsedQuery = querystring.parse(search);
    if (parsedQuery.from === 'client' && user.role === 'client') {
      const connectToOperator = async () => {
        const { data: idleOperators }: Paginated<IUser> = await apiClient.service('users').find({
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
            clientId: user._id,
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
    const onChatCreated = (chat: IChat) => {
      console.log('created chat', chat);
      setChats((v) => [chat, ...v]);
    };
    const onChatPatched = (chat: IChat) => {
      console.log('patched chat', chat);
      const newChats = chats.map((item) => {
        if (item._id === chat._id) {
          return {
            ...chat,
            [getUnreadMessagesKey(user)]:
              activeChat._id === chat._id ? 0 : getUnreadMessages(chat, user),
          };
        }
        return item;
      });
      setChats(newChats);
    };

    apiClient.service('chats').on('created', onChatCreated);
    apiClient.service('chats').on('patched', onChatPatched);
    return () => {
      apiClient.service('chats').removeListener('created', onChatCreated);
      apiClient.service('chats').removeListener('patched', onChatPatched);
    };
    // TODO CHECK
  }, [chats, activeChat._id, user]);

  return (
    <div className="chat">
      <audio ref={audioRef} />

      <Side chats={chats} activeChat={activeChat} setChats={setChats} onChatClick={chatClicked} />
      <Body
        activeChat={activeChat}
        onCallUser={callUser}
        isCallActive={isCallActive}
        currentCall={currentCall}
      />
    </div>
  );
};

function addAudioStream(audio: HTMLAudioElement, stream: MediaStream) {
  audio.srcObject = stream;
  audio.addEventListener('loadedmetadata', () => {
    audio.play();
  });
}

export default Chat;
