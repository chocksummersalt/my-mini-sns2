import React, { useState, useRef } from 'react';
import './MiniRoom.css';
import { db } from './firebase'; 
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  doc,
  where
} from 'firebase/firestore';

// ==========================================
// 1. 📷 앨범 컴포넌트
// ==========================================
const Album = () => {
  const [photos, setPhotos] = useState([
    { id: 1, url: "https://via.placeholder.com/150/FFB6C1/000000?text=Trip", title: "여름 휴가" },
    { id: 2, url: "https://via.placeholder.com/150/87CEEB/000000?text=Food", title: "맛집 탐방" },
    { id: 3, url: "https://via.placeholder.com/150/F0E68C/000000?text=Cat", title: "우리집 고양이" },
  ]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPhoto = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        title: "새로운 사진"
      };
      setPhotos([newPhoto, ...photos]);
    }
  };

  return (
    <div className="tab-content">
      <h2>📷 나의 사진첩</h2>
      <label className="upload-btn-box">
        ➕ 사진 추가하기
        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}}/>
      </label>
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-item">
            <img src={photo.url} alt={photo.title} />
            <p>{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. 📒 다이어리 컴포넌트
// ==========================================
const Diary = () => {
  const [entries, setEntries] = useState([
    { id: 1, date: "2024-05-01", text: "오늘은 코딩을 배웠다. 재미있었다!", mood: "😄" }
  ]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  const addEntry = () => {
    if (!text || !date) return;
    setEntries([{ id: Date.now(), date, text, mood: "😄" }, ...entries]);
    setText("");
    setDate("");
  };

  return (
    <div className="tab-content">
      <h2>📒 비밀 일기장</h2>
      <div className="diary-input">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <textarea 
          placeholder="오늘 무슨 일이 있었나요?" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addEntry}>일기 쓰기</button>
      </div>
      <div className="diary-list">
        {entries.map(entry => (
          <div key={entry.id} className="diary-card">
            <span className="diary-date">{entry.date} {entry.mood}</span>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. 📝 방명록 컴포넌트
// ==========================================
const Guestbook = () => {
  const [messages, setMessages] = useState([
    { id: 1, name: "일촌1", text: "홈피 개설 축하해~!" }
  ]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const addMessage = () => {
    if (!name || !msg) return;
    setMessages([{ id: Date.now(), name, text: msg }, ...messages]);
    setName("");
    setMsg("");
  };

  return (
    <div className="tab-content">
      <h2>📝 방명록</h2>
      <div className="guestbook-input">
        <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} style={{width:'80px'}} />
        <input placeholder="한마디 남겨주세요" value={msg} onChange={(e) => setMsg(e.target.value)} style={{flex:1}} />
        <button onClick={addMessage}>남기기</button>
      </div>
      <ul className="guestbook-list">
        {messages.map(m => (
          <li key={m.id} className="guestbook-item">
            <strong>{m.name}:</strong> {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ==========================================
// 4. 💬 메신저 컴포넌트
// ==========================================
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

  React.useEffect(() => {
    // 인덱스 없이도 작동하도록 where만 사용 (orderBy 제거)
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", activeChatId)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const newMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        // 클라이언트 측에서 시간순 정렬
        newMessages.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
          const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
          return timeA - timeB;
        });
        setChatLogs(newMessages);
      },
      (error) => {
        console.error("❌ 실시간 메시지 수신 오류:", error);
        console.error("에러 코드:", error.code);
        console.error("에러 메시지:", error.message);
        
        if (error.code === 'failed-precondition') {
          console.error("⚠️ Firestore 인덱스가 필요합니다!");
          console.error("해결 방법: Firebase 콘솔에서 에러 메시지의 인덱스 생성 링크를 클릭하세요.");
        } else if (error.code === 'permission-denied') {
          console.error("⚠️ Firestore 보안 규칙 문제입니다!");
          console.error("Firebase 콘솔 > Firestore > 규칙에서 읽기 권한을 확인하세요.");
        }
      }
    );

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

// ==========================================
// 5. 🏠 메인 미니룸 컴포넌트 (통합)
// ==========================================
const MiniRoom = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  
  // 미니룸 꾸미기 상태
  const [wallColor, setWallColor] = useState('#ffe4e1');
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [bgImage, setBgImage] = useState(null);

  // 피드 상태
  const [inputText, setInputText] = useState('');
  const [posts, setPosts] = useState([]);

  // 1. 피드 데이터 가져오기 (Read)
  React.useEffect(() => {
    const q = query(
      collection(db, "feeds"),
      orderBy("createdAt", "desc") 
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(newPosts);
    });
    return () => unsubscribe();
  }, []);

  // 2. 글 작성하기 (Create)
  const handlePostSubmit = async () => {
    if (inputText.trim() === '') return;
    try {
      await addDoc(collection(db, "feeds"), {
        text: inputText,
        author: avatar,
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setInputText('');
    } catch (error) {
      console.error("글 작성 실패:", error);
    }
  };

  // 3. 좋아요 (Update)
  const handleLike = async (id, currentLikes) => {
    const postRef = doc(db, "feeds", id);
    await updateDoc(postRef, { likes: currentLikes + 1 });
  };

  // 4. 삭제 (Delete)
  const handleDelete = async (id) => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
      const postRef = doc(db, "feeds", id);
      await deleteDoc(postRef);
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  return (
    <div className="app-container">
      {/* 좌측 사이드바 */}
      <nav className="sidebar">
        <div className="logo">My SNS</div>
        <ul className="menu-list">
          <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
            🏠 <span className="menu-text">홈</span>
          </li>
          <li className={activeTab === 'album' ? 'active' : ''} onClick={() => setActiveTab('album')}>
            📷 <span className="menu-text">앨범</span>
          </li>
          <li className={activeTab === 'diary' ? 'active' : ''} onClick={() => setActiveTab('diary')}>
            📒 <span className="menu-text">다이어리</span>
          </li>
          <li className={activeTab === 'guestbook' ? 'active' : ''} onClick={() => setActiveTab('guestbook')}>
             📝 <span className="menu-text">방명록</span>
          </li>
          <li className={activeTab === 'messenger' ? 'active' : ''} onClick={() => setActiveTab('messenger')}>
             💬 <span className="menu-text">메신저</span>
          </li>
        </ul>
      </nav>

      {/* 우측 콘텐츠 영역 */}
      <main className="content-area">
        
        {/* 1. 홈 탭 */}
        {activeTab === 'home' && (
          <div className="home-content">
            <div className="room-frame">
              <div 
                className="room-wall" 
                style={{ 
                  backgroundColor: bgImage ? 'transparent' : wallColor,
                  backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}
              >
                {!bgImage && <div className="room-floor"></div>}
                <div className="avatar">{avatar}</div>
              </div>
            </div>

            {/* 컨트롤 패널 (2단 구성) */}
            <div className="controls">
               <div className="control-row top-row">
                  <span>벽지: </span>
                  <button onClick={() => setWallColor('#ffe4e1')}>분홍</button>
                  <button onClick={() => setWallColor('#e0ffff')}>하늘</button>
                  <span className="divider">|</span>
                  <span>아바타: </span>
                  <button onClick={() => setAvatar('🧑‍💻')}>나</button>
                  <button onClick={() => setAvatar('🐱')}>냥이</button>
               </div>
               <div className="control-row bottom-row">
                 <label className="custom-file-btn">
                   📷 배경 꾸미기
                   <input type="file" onChange={handleBgUpload} accept="image/*" />
                 </label>
               </div>
            </div>

{/* 뉴스피드 (공유 기능) */}
              <div className="feed-section">
              <h3>📢 뉴스피드 (전체 공유)</h3>
              
              {/* ▼▼▼ 여기를 수정했습니다 (textarea로 교체) ▼▼▼ */}
              <div className="input-box">
                <textarea
                  className="feed-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="모두와 공유할 이야기를 남겨보세요... (최대 300자)"
                  maxLength={300} // 300자 제한
                />
                <button onClick={handlePostSubmit} className="feed-submit-btn">등록</button>
              </div>
              {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

              <div className="post-list">
                {posts.map(p => (
                  <div key={p.id} className="post-card">
                    <div className="post-header">
                      <div className="post-avatar">{p.author}</div>
                      <div className="post-info">
                        <span className="post-time">
                          {p.createdAt?.seconds 
                            ? new Date(p.createdAt.seconds * 1000).toLocaleTimeString() 
                            : '방금 전'}
                        </span>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                    <div className="post-content">
                      {/* 긴 글 줄바꿈 허용 */}
                      <p className="post-text">{p.text}</p>
                    </div>
                    <div className="post-actions">
                    <button className="like-btn" onClick={() => handleLike(p.id, p.likes)}>
                        💖 {p.likes}
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 다른 탭들 연결 */}
        {activeTab === 'album' && <Album />}
        {activeTab === 'diary' && <Diary />}
        {activeTab === 'guestbook' && <Guestbook />}
        {activeTab === 'messenger' && <Messenger />}

      </main>
    </div>
  );
};

export default MiniRoom;