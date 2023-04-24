import styles from '../styles/Home.module.scss';
import Image from 'next/image';
import ItemImage from '../../assets/profissao-programador_f801491a16284b568c89f23520ea8679.jpg';
import SendMessageIcon from '../../assets/send_4febd72a71c34f3c9c99e5536d44887e.png';
import socket from 'socket.io-client';
import { useEffect } from 'react';

const io = socket('http://localhost:3000/api/socket');

export default function Home() {
  useEffect(() => {
    io.emit('join', ' Um usuário entrou');
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.chatContainer}>
          <div className={styles.chatContacts}>
            <div className={styles.chatOptions}></div>
            <div className={styles.chatItem}>
              <Image
                className={styles.itemImage}
                src={ItemImage}
                alt="Group Image"
              />
              <div className={styles.chatTitleContainer}>
                <span className={styles.titleMessage}>Kadu Viana</span>
                <span className={styles.lastMessage}>Mensagem</span>
              </div>
            </div>
          </div>

          <div className={styles.chatMessages}>
            <div className={styles.chatOptions}>
              <div className={styles.chatItem}>
                <Image
                  className={styles.itemImage}
                  src={ItemImage}
                  alt="Group Image"
                />
                <div className={styles.chatTitleContainer}>
                  <span className={styles.titleMessage}>Kadu Viana</span>
                  <span className={styles.lastMessage}>Mensagem</span>
                </div>
              </div>
            </div>

            <div className={styles.chatMessagesArea}></div>
            <div className={styles.inputArea}>
              <form>
                <input
                  placeholder="Message"
                  type="text"
                  className={styles.chatInput}
                />
                <Image
                  className={styles.sendMessageIcon}
                  src={SendMessageIcon}
                  alt="Send message arrow icon"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
