import React from 'react';
import ChatHeader from '../ChatHeader/ChatHeader';
import MessageBox from '../MessegeBox/MessegeBox';
import MessageInput from '../MessegeInput/MessegeInput';
import './Messeger.scss';
import { useChatStore } from '../../../../store/chat';

const Messenger = ({ socket }) => {
  const { currentChat } = useChatStore();
  const activeChat = () => {
    return Object.keys(currentChat).length > 0;
  };

  return (
    <div id="messenger" className="shadow-light">
      {activeChat() ? (
        <div id="messenger-wrap">
          <ChatHeader socket={socket} chat={currentChat} />
          <hr />
          <MessageBox chat={currentChat} />
          <MessageInput socket={socket} chat={currentChat} />
        </div>
      ) : (
        <p>No active chat</p>
      )}
    </div>
  );
};

export default Messenger;
