import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.scss';
import Image, { StaticImageData } from 'next/image';
import ItemImage from '../../assets/profissao-programador_f801491a16284b568c89f23520ea8679.jpg';
import DefaultUserImage from '../../assets/user.png';
import PinEnabled from '../../assets/pin_enabled.png';
import PinDisabled from '../../assets/pin_disabled.png';
import SendMessageIcon from '../../assets/send_4febd72a71c34f3c9c99e5536d44887e.png';
import socket from 'socket.io-client';
import { ReactSortable } from 'react-sortablejs';
import SideBar from '@/components/SideBar';

const io = socket(process.env.BASE_URL || 'http://localhost:4000/');

type User = {
  id: string;
  name: string;
};

type Messages = {
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
  const [message, setMessage] = useState('');
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

  const changeConversation = (conversation: Conversations) => {
    setCurrentRoom(conversation.room);
  };

  const fixUnfixConversation = (conversationRoom: string) => {
    setConversations(prev =>
      prev.map(c => {
        return c.room === conversationRoom ? { ...c, isFixed: !c.isFixed } : c;
      })
    );
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
          {/* <aside className={styles.chatContacts}>
            <header className={styles.chatOptions}></header>
            {conversations &&
              conversations
                .filter(c => c.isFixed === true)
                .map((c, index) => (
                  <div
                    onClick={() => changeConversation(c)}
                    key={c.room}
                    className={styles.chatItem}
                  >
                    <Image
                      className={styles.itemImage}
                      src={c.image}
                      alt="Group Image"
                    />
                    <div className={styles.chatTitleContainer}>
                      <span className={styles.titleMessage}>{c.title}</span>
                      <span className={styles.lastMessage}>
                        {c.messages.length
                          ? `${c.messages[c.messages.length - 1].name}: ${
                              c.messages[c.messages.length - 1].message
                            } `
                          : ''}
                      </span>
                    </div>
                    {c.unseenMessages > 0 && (
                      <span className={styles.unseenMessages}>
                        {c.unseenMessages}
                      </span>
                    )}
                    <button
                      className={styles.pinButton}
                      onClick={e => {
                        e.stopPropagation();
                        fixUnfixConversation(c.room);
                      }}
                    >
                      <Image
                        src={PinEnabled}
                        width={25}
                        height={25}
                        alt="pin"
                      />
                    </button>
                  </div>
                ))}
            <ReactSortable
              list={conversations as any}
              setList={setConversations as any}
            >
              {conversations &&
                conversations
                  .filter(c => c.isFixed === false)
                  .map((c, index) => (
                    <div
                      onClick={() => changeConversation(c)}
                      key={c.room}
                      className={styles.chatItem}
                    >
                      <Image
                        className={styles.itemImage}
                        src={c.image}
                        alt="Group Image"
                      />
                      <div className={styles.chatTitleContainer}>
                        <span className={styles.titleMessage}>{c.title}</span>
                        <span className={styles.lastMessage}>
                          {c.messages.length
                            ? `${c.messages[c.messages.length - 1].name}: ${
                                c.messages[c.messages.length - 1].message
                              } `
                            : ''}
                        </span>
                      </div>
                      {c.unseenMessages > 0 && (
                        <span className={styles.unseenMessages}>
                          {c.unseenMessages}
                        </span>
                      )}
                      <button
                        className={styles.pinButton}
                        onClick={e => {
                          e.stopPropagation();
                          fixUnfixConversation(c.room);
                        }}
                      >
                        <Image
                          src={PinDisabled}
                          width={25}
                          height={25}
                          alt="pin"
                        />
                      </button>
                    </div>
                  ))}
            </ReactSortable>
          </aside> */}

          <div className={styles.chatMessages}>
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
          </div>
        </div>
      </div>
    </>
  );
}
