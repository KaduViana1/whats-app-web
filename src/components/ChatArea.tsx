import React, { useState, SetStateAction, useEffect } from 'react';
import styles from '../styles/ChatArea.module.scss';
import Image from 'next/image';
import DefaultUserImage from '../../assets/user.png';
import SendMessageIcon from '../../assets/send_4febd72a71c34f3c9c99e5536d44887e.png';
import { Messages, User, io, Conversations } from '@/pages';

type ChatProps = {
  conversations: Conversations[];
  setConversations: (value: SetStateAction<Conversations[]>) => void;
  setCurrentRoom: (value: SetStateAction<string>) => void;
  userId: String;
  name: String;
  currentRoom: String;
  users: User[];
  displayedMessages: Messages[];
  displayedConversation: Conversations[];
  newMessage?: Messages;
  setDisplayedMessages: (value: SetStateAction<Messages[]>) => void;
  setBool: (value: SetStateAction<boolean>) => void;
};

function ChatArea({
  displayedConversation,
  currentRoom,
  users,
  displayedMessages,
  name,
  userId,
  conversations,
  setConversations,
  setCurrentRoom,
  newMessage,
  setDisplayedMessages,
  setBool,
}: ChatProps) {
  const [message, setMessage] = useState('');

  const handleMessage = () => {
    if (message) {
      io.emit('message', { message, name, userId, currentRoom });
      setMessage('');
    }
  };

  const handleOpenConversation = (user: User) => {
    if (conversations.filter(c => c.room === user.id).length > 0) {
      setCurrentRoom(user.id);
      return;
    }
    if (user.id !== userId) {
      setCurrentRoom(user.id);
      setConversations(prev => [
        ...prev,
        {
          title: user.name,
          image: DefaultUserImage,
          room: user.id,
          messages: [],
          unseenMessages: 0,
          isFixed: false,
        },
      ]);
    }
  };

  useEffect(() => {
    if (newMessage) {
      if (
        conversations.filter(c => c.room === newMessage.userId).length === 0 &&
        newMessage.userId != userId &&
        newMessage.currentRoom != 'Profissão-Programador' &&
        newMessage.currentRoom === userId
      ) {
        setConversations(prev => [
          {
            title: newMessage.name,
            image: DefaultUserImage,
            room: newMessage.userId,
            messages: [],
            unseenMessages: 0,
            isFixed: false,
          },
          ...prev,
        ]);
      }
      if (
        newMessage.currentRoom === currentRoom ||
        (newMessage.currentRoom === userId &&
          currentRoom !== 'Profissão-Programador')
      ) {
        newMessage.userId === userId ||
        newMessage.currentRoom === userId ||
        newMessage.currentRoom === 'Profissão-Programador'
          ? setDisplayedMessages(prev => [...prev, newMessage])
          : setDisplayedMessages(prev => [...prev]);
      }
      setBool(true);
    }
  }, [newMessage]);

  return (
    <>
      {' '}
      <header className={styles.chatOptions}>
        <div className={styles.chatItem}>
          <Image
            className={styles.itemImage}
            src={displayedConversation[0]?.image}
            alt="Group Image"
          />
          <div className={styles.chatTitleContainer}>
            <span className={styles.titleMessage}>
              {displayedConversation[0].title}
            </span>
            <span className={styles.lastMessage}>
              {currentRoom === 'Profissão-Programador' &&
                users.map((user, index) => (
                  <span
                    onClick={() => handleOpenConversation(user)}
                    key={index}
                  >
                    {user.name}
                    {index + 1 < users.length ? ', ' : ''}
                  </span>
                ))}
            </span>
          </div>
        </div>
      </header>
      <div className={styles.chatMessagesArea}>
        {displayedMessages.map((message, index) => (
          <div
            key={index}
            className={
              message.userId === userId
                ? styles.messageContainerRight
                : styles.messageContainerLeft
            }
          >
            {message.userId === userId ? (
              <span className={styles.myMessages}>{message.message}</span>
            ) : (
              <span className={styles.othersMessages}>
                <span className={styles.othersName}>{message.name}</span>
                <span>{message.message}</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleMessage();
          }}
        >
          <input
            autoFocus
            placeholder="Message"
            type="text"
            className={styles.chatInput}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button className={styles.sendMessageButton} type="submit">
            <Image
              className={styles.sendMessageIcon}
              src={SendMessageIcon}
              alt="Send message arrow icon"
            />
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatArea;
