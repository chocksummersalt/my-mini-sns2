import React, { useState, useEffect } from 'react';
import './Messenger.css';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Messenger = () => {
  const friends = [
    { id: "1", name: "전체 채팅방", avatar: "📢", status: "누구나 환영" },
    { id: "2", name: "김코딩", avatar: "💻", status: "부재중" },
    { id: "3", name: "댄스강사", avatar: "💃", status: "오프라인" },
  ];

  const [activeChatId, setActiveChatId] = useState("1");
  const [inputMsg, setInputMsg] = useState("");
  const [chatLogs, setChatLogs] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [myId] = useState(() => {
    const savedId = localStorage.getItem('my_chat_id');
    if (savedId) return savedId;
    const newId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('my_chat_id', newId);
    return newId;
  });

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", activeChatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatLogs(newMessages);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  const sendMessage = async () => {
    if (!inputMsg.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        roomId: activeChatId,
        text: inputMsg,
        senderId: myId,
        createdAt: serverTimestamp(),
      });
      setInputMsg("");
    } catch (error) {
      console.error("전송 실패:", error);
    }
  };

  const currentFriend = friends.find(f => f.id === activeChatId) || friends[0];

  const handleFriendSelect = (id) => {
    setActiveChatId(id);
    setShowSidebar(false);
  };

  return (
    <div className={`tab-content messenger-container ${showSidebar ? 'sidebar-open' : ''}`}>
      <div className="chat-sidebar">
        <h3>
          💬 대화상대
          <button className="mobile-close-btn" onClick={() => setShowSidebar(false)}>✖</button>
        </h3>
        <ul>
          {friends.map(friend => (
            <li 
              key={friend.id} 
              className={`friend-item ${activeChatId === friend.id ? 'active' : ''}`}
              onClick={() => handleFriendSelect(friend.id)}
            >
              <span className="friend-avatar">{friend.avatar}</span>
              <div className="friend-info">
                <span className="friend-name">{friend.name}</span>
                <span className="friend-status">{friend.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-room">
        <div className="chat-header">
          <span className="header-title">
            {currentFriend.avatar} <strong>{currentFriend.name}</strong>
          </span>
          <button className="mobile-menu-btn" onClick={() => setShowSidebar(true)}>👥 목록</button>
        </div>
        
        <div className="chat-messages">
          {chatLogs.length === 0 ? (
            <p className="no-msg">대화 내용이 없습니다.</p>
          ) : (
            chatLogs.map((msg) => (
              <div key={msg.id} className={`message-bubble ${msg.senderId === myId ? 'me' : 'them'}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="메시지 입력..." 
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>전송</button>
        </div>
      </div>
    </div>
  );
};

export default Messenger;

