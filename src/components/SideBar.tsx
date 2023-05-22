import { SetStateAction, useEffect, useState } from 'react';
import styles from '../styles/Home.module.scss';
import Image from 'next/image';
import PinEnabled from '../../assets/pin_enabled.png';
import PinDisabled from '../../assets/pin_disabled.png';
import { ReactSortable } from 'react-sortablejs';
import { Conversations } from '@/pages';

type SideBarProps = {
  conversations: Conversations[];
  setConversations: (value: SetStateAction<Conversations[]>) => void;
  setCurrentRoom: (value: SetStateAction<string>) => void;
};

function SideBar({
  conversations,
  setConversations,
  setCurrentRoom,
}: SideBarProps) {
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

  return (
    <>
      {' '}
      <aside className={styles.chatContacts}>
        <header className={styles.chatOptions}></header>
        {conversations &&
          conversations
            .filter(c => c.isFixed === true)
            .map(c => (
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
                  <Image src={PinEnabled} width={25} height={25} alt="pin" />
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
              .map(c => (
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
                    <Image src={PinDisabled} width={25} height={25} alt="pin" />
                  </button>
                </div>
              ))}
        </ReactSortable>
      </aside>
    </>
  );
}

export default SideBar;
