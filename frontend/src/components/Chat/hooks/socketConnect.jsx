import { useEffect } from 'react';
import socketIOClient from 'socket.io-client';

import { useChatStore } from '../../../store/chat';

function useSocket(user) {
  const {
    fetchChats,
    setSocket,
    onlineFriends,
    friendOnline,
    friendOffline,
    receivedMessage,
    senderTyping,
    createChat,
    senderTypingFunction,
    addUserToGroup,
    leaveCurrentChat,
    deleteCurrentChat,
  } = useChatStore();
  const socket = socketIOClient.connect('http://127.0.0.1:3000');

  useEffect(() => {
    fetchChats()
      .then((res) => {
        setSocket(socket);
        socket.emit('join', user);

        socket.on('typing', (sender) => {
          senderTypingFunction(sender);
        });

        socket.on('friends', (friends) => {
          console.log('Friends', friends);
          onlineFriends(friends);
        });

        socket.on('online', (onlineUser) => {
          friendOnline(onlineUser);
          console.log('Online', onlineUser);
        });

        socket.on('offline', (offlineUser) => {
          friendOffline(offlineUser);
          console.log('Offline', offlineUser);
        });

        socket.on('received', (message) => {
          receivedMessage(message, user.id);
        });

        socket.on('new-chat', (chat) => {
          createChat(chat);
        });

        socket.on('added-user-to-group', (group) => {
          addUserToGroup(group);
        });

        socket.on('remove-user-from-chat', (data) => {
          data.currentUserId = user.id;
          leaveCurrentChat(data);
        });

        socket.on('delete-chat', (chatId) => {
          deleteCurrentChat(chatId);
        });

        console.log('Hello: ', JSON.stringify(res));
      })
      .catch((err) => console.log(err));
  }, [
    user,
    fetchChats,
    setSocket,
    friendOnline,
    friendOffline,
    receivedMessage,
    senderTyping,
    createChat,
    addUserToGroup,
    leaveCurrentChat,
    deleteCurrentChat,
  ]);

  return socket;
}

export default useSocket;
