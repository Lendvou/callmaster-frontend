import React, { useEffect, useMemo, useRef, useState } from 'react';
import querystring from 'query-string';
import Peer from 'peerjs';
import { Modal } from 'antd';
import { useLocation } from 'react-router';

import Side from './Side';
import Body from './Body';

import apiClient from 'utils/apiClient';
import {
  getRandomInteger,
  getUnreadMessages,
  getUnreadMessagesKey,
  getUser,
} from 'utils';

import { Paginated } from '@feathersjs/feathers';
import { IChat, IUser } from 'types';

const Chat = () => {
  const { search } = useLocation();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChat, setActiveChat] = useState<Partial<IChat>>({});
  const [currentCall, setCurrentCall] = useState<Peer.MediaConnection | null>(
    null
  );
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  const peer = useMemo(() => {
    const user = getUser();
    const myPeer = new Peer(user._id, {
      host: 'localhost',
      port: 3030,
      path: '/peerjs',
    });

    return myPeer;
  }, []);

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

  const callUser = async () => {
    if (!activeChat?._id) return;

    const user = getUser();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const otherId =
      user.role === 'operator'
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
    });
  };

  useEffect(() => {
    peer.on('call', async (call) => {
      console.log('call', call);
      const caller = await apiClient.service('users').get(call.peer);

      Modal.confirm({
        title: `${caller.firstName} ${caller.lastName} вам звонит, ответить?`,
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
            console.log('callee onclose');
            setCurrentCall(null);
          });
        },
        onCancel: () => {
          call.close();
        },
      });
    });
  }, [peer, activeChat, currentCall]);

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
      <audio ref={audioRef} />

      <Side
        chats={chats}
        activeChat={activeChat}
        setChats={setChats}
        onChatClick={chatClicked}
      />
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

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
  const vidos = document.getElementById('video-window') as HTMLVideoElement;

  vidos.srcObject = stream;
  vidos.addEventListener('loadedmetadata', () => {
    vidos.play();
  });
  // const videoGrid = document.getElementById(
  //   'video-container'
  // ) as HTMLDivElement;

  // video.srcObject = stream;
  // video.addEventListener('loadedmetadata', () => {
  //   console.log('video element', video, video.srcObject, stream);
  //   video.play();
  // });
  // videoGrid.append(video);
}

// function connectToNewUser(userId: string, stream: MediaStream, peer: Peer) {
//   const call = peer.call(userId, stream);
//   const video = document.createElement('video');
//   call.on('stream', (userVideoStream) => {
//     addVideoStream(video, userVideoStream);
//   });
//   call.on('close', () => {
//     video.remove();
//   });
// }

export default Chat;
