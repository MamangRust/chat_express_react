import React, { useEffect } from 'react';
import useSocket from './hooks/socketConnect';
import Navbar from './components/Navbar/Navbar';
import FriendList from './components/FriendList/FriendList';
import Messenger from './components/Messeger/Messeger';
import './Chat.scss';
import useAuthStore from '../../store/auth';

const Chat = () => {
  const { user } = useAuthStore();

  const socket = useSocket(user);

  return (
    <div id="chat-container">
      <Navbar />
      <div id="chat-wrap">
        <FriendList socket={socket} />
        <Messenger socket={socket} />
      </div>
    </div>
  );
};

export default Chat;
