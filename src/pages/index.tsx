import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.scss';
import { StaticImageData } from 'next/image';
import ItemImage from '../../assets/profissao-programador_f801491a16284b568c89f23520ea8679.jpg';
import socket from 'socket.io-client';
import SideBar from '@/components/SideBar';
import ChatArea from '@/components/ChatArea';

export const io = socket(process.env.BASE_URL || 'http://localhost:4000/');

export type User = {
  id: string;
  name: string;
};

export type Messages = {
  name: string;
  message: string;
  userId: string;
  currentRoom: string;
};

export type Conversations = {
  title: string;
  image: StaticImageData;
  room: string;
  messages: Messages[];
  unseenMessages: number;
  isFixed: boolean;
};

export default function Home() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState<Messages>();
  const [displayedMessages, setDisplayedMessages] = useState<Messages[]>([]);
  const [userId, setUserId] = useState(io.id);
  const [bool, setBool] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('Profissão-Programador');
  const [conversations, setConversations] = useState<Conversations[]>([
    {
      title: 'Profissão Programador',
      image: ItemImage,
      room: 'Profissão-Programador',
      messages: [],
      unseenMessages: 0,
      isFixed: false,
    },
  ]);

  const [displayedConversation, setDisplayedConversation] = useState(
    conversations.filter(c => c.room === currentRoom)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    io.on('users', users => {
      setUsers(users);
    });
    io.on('message', message => {
      setNewMessage(message);
    });
  }, []);

  useEffect(() => {
    if (newMessage && bool === true) {
      updateConversationsMessages(newMessage);
      setBool(false);
    }
  }, [bool]);

  useEffect(() => {
    joinRoom();
    const displayRoom = conversations.findIndex(c => c.room === currentRoom);
    setDisplayedMessages(conversations[displayRoom].messages);
    setConversations(prev => {
      return prev.map(c => {
        return c.room === currentRoom ? { ...c, unseenMessages: 0 } : c;
      });
    });
  }, [currentRoom]);

  const handleJoin = () => {
    if (name) {
      io.emit('join', name);
      setJoined(true);
      if (userId === undefined) {
        setUserId(io.id);
      }
    }
  };

  const updateConversationsMessages = (newMessage: Messages) => {
    if (
      newMessage.currentRoom === userId ||
      newMessage.userId === userId ||
      newMessage.currentRoom === 'Profissão-Programador'
    ) {
      setConversations(prev => {
        const index = conversations.findIndex(
          c => c.room === newMessage.currentRoom
        );

        if (prev[index]) {
          return [
            {
              ...prev[index],
              messages: [...prev[index].messages, newMessage],
              unseenMessages:
                newMessage.currentRoom === 'Profissão-Programador'
                  ? newMessage.currentRoom !== currentRoom
                    ? prev[index].unseenMessages + 1
                    : 0
                  : newMessage.userId !== userId &&
                    newMessage.userId !== currentRoom &&
                    newMessage.currentRoom !== currentRoom
                  ? prev[index].unseenMessages + 1
                  : 0,
            },
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ];
        } else {
          const index = conversations.findIndex(
            c => c.room === newMessage.userId
          );

          return [
            {
              ...prev[index],
              messages: [...prev[index].messages, newMessage],
              unseenMessages:
                newMessage.currentRoom === 'Profissão-Programador'
                  ? newMessage.currentRoom !== currentRoom
                    ? prev[index].unseenMessages + 1
                    : 0
                  : newMessage.userId !== userId &&
                    newMessage.userId !== currentRoom &&
                    newMessage.currentRoom !== currentRoom
                  ? prev[index].unseenMessages + 1
                  : 0,
            },
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ];
        }
      });
    }
  };

  const joinRoom = () => {
    if (currentRoom) {
      io.emit('join-room', currentRoom);
      setDisplayedConversation(
        conversations.filter(c => c.room === currentRoom)
      );
    }
  };

  if (!joined) {
    return (
      <>
        <div className={styles.background}></div>
        <div className={styles.loginContainer}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleJoin();
            }}
          >
            <label htmlFor="name">Digite seu nome</label>
            <input
              ref={inputRef}
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button type="submit">Entrar</button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.chatContainer}>
          <SideBar
            conversations={conversations}
            setConversations={setConversations}
            setCurrentRoom={setCurrentRoom}
          />

          <div className={styles.chatMessages}>
            <ChatArea
              displayedConversation={displayedConversation}
              displayedMessages={displayedMessages}
              currentRoom={currentRoom}
              users={users}
              name={name}
              userId={userId}
              conversations={conversations}
              setConversations={setConversations}
              setCurrentRoom={setCurrentRoom}
              setDisplayedMessages={setDisplayedMessages}
              setBool={setBool}
              newMessage={newMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
