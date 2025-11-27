import React, { useState, useRef } from 'react';
import './MiniRoom.css';
// 기존 import 아래에 추가
import { db } from './firebase'; // 방금 만든 설정 파일
import { collection, addDoc, query, orderBy, onSnapshot, where, serverTimestamp } from 'firebase/firestore';

// ==========================================
// 1. 📷 앨범 컴포넌트 (사진첩)
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
// 2. 📒 다이어리 컴포넌트 (일기장)
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
// 3. 📝 방명록 컴포넌트 (친구들의 글)
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
// 5. 💬 메신저 컴포넌트 (파이어베이스 실시간 연동)
// ==========================================
const Messenger = () => {
  const friends = [
    { id: 1, name: "전체 채팅방", avatar: "📢", status: "누구나 환영" }, // 테스트를 위해 1번방을 공용방으로
    { id: 2, name: "김코딩", avatar: "💻", status: "부재중" },
  ];

  const [activeChatId, setActiveChatId] = useState(1);
  const [inputMsg, setInputMsg] = useState("");
  const [chatLogs, setChatLogs] = useState([]);
  
  // 내 브라우저 전용 ID 생성 (새로고침 전까지 유지)
  // 실제로는 로그인한 유저 ID를 써야 하지만, 지금은 임시로 랜덤 ID 사용
  const [myId] = useState(() => "user_" + Math.random().toString(36).substr(2, 9));

  // --- 1. 실시간 데이터 듣기 (Read) ---
  React.useEffect(() => {
    // 'messages'라는 컬렉션에서 -> 현재 방(activeChatId)의 글만 -> 시간순으로 가져오기
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", activeChatId),
      orderBy("createdAt", "asc")
    );

    // 실시간 구독 (onSnapshot)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatLogs(newMessages);
    });

    return () => unsubscribe(); // 채팅방 나갈 때 구독 취소 (메모리 절약)
  }, [activeChatId]);

// --- 2. 메시지 보내기 (수정됨: 자동응답 제거) ---
const sendMessage = async () => {
  if (!inputMsg.trim()) return;

  try {
    // 파이어베이스 DB에 내 메시지 저장하기
    await addDoc(collection(db, "messages"), {
      roomId: activeChatId,
      text: inputMsg,
      senderId: myId, // 내가 보냈다는 표시
      createdAt: serverTimestamp(), // 서버 시간
    });
    
    setInputMsg(""); // 입력창 비우기
    
    // ❌ 중요: 여기에 있던 setTimeout 코드는 삭제되었습니다! ❌

  } catch (error) {
    console.error("전송 실패:", error);
  }
};

  const currentFriend = friends.find(f => f.id === activeChatId) || friends[0];

  return (
    <div className="tab-content messenger-container">
      {/* 친구 목록 */}
      <div className="chat-sidebar">
        <h3>💬 채팅목록</h3>
        <ul>
          {friends.map(friend => (
            <li 
              key={friend.id} 
              className={`friend-item ${activeChatId === friend.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(friend.id)}
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

      {/* 채팅창 */}
      <div className="chat-room">
        <div className="chat-header">
          <span>{currentFriend.avatar} <strong>{currentFriend.name}</strong></span>
        </div>
        
        <div className="chat-messages">
          {chatLogs.length === 0 ? (
            <p className="no-msg">첫 메시지를 남겨보세요!</p>
          ) : (
            chatLogs.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-bubble ${msg.senderId === myId ? 'me' : 'them'}`}
              >
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
// 4. 🏠 메인 미니룸 컴포넌트 (통합)
// ==========================================
const MiniRoom = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  
  // 미니룸 상태
  const [wallColor, setWallColor] = useState('#ffe4e1');
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [bgImage, setBgImage] = useState(null);

  // 피드 상태
  const [inputText, setInputText] = useState('');
  const [posts, setPosts] = useState([
    { id: 1, text: "미니룸 오픈! 환영합니다.", author: "🧑‍💻", time: "방금 전", likes: 0, isLiked: false }
  ]);

  const handlePostSubmit = () => {
    if (inputText.trim() === '') return;
    const newPost = { id: Date.now(), text: inputText, author: avatar, time: "방금", likes: 0, isLiked: false };
    setPosts([newPost, ...posts]);
    setInputText('');
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  return (
    <div className="app-container">
      {/* 좌측 사이드바 */}
      {/* --- 1. 좌측 사이드바 (모바일에서는 상단+하단으로 분리됨) --- */}
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
            
            {/* 미니룸 프레임 (버튼 없음) */}
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

            {/* --- 컨트롤 패널 (2단 구성) --- */}
            <div className="controls">
               {/* 윗줄: 색상 및 아바타 변경 버튼들 */}
               <div className="control-row top-row">
                  <span>벽지: </span>
                  <button onClick={() => setWallColor('#ffe4e1')}>분홍</button>
                  <button onClick={() => setWallColor('#e0ffff')}>하늘</button>
                  <span className="divider">|</span>
                  <span>아바타: </span>
                  <button onClick={() => setAvatar('🧑‍💻')}>나</button>
                  <button onClick={() => setAvatar('🐱')}>냥이</button>
               </div>

               {/* 아랫줄: 배경 변경 버튼 (중앙 배치) */}
               <div className="control-row bottom-row">
                 <label className="custom-file-btn">
                   📷 내 사진으로 배경 꾸미기
                   <input type="file" onChange={handleBgUpload} accept="image/*" />
                 </label>
               </div>
            </div>

            {/* ... (이하 피드 영역은 그대로 유지) ... */}
            <div className="feed-section">
              <h3>📢 뉴스피드</h3>
              <div className="input-box">
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="무슨 생각 하세요?" />
                <button onClick={handlePostSubmit}>등록</button>
              </div>
              <div className="post-list">
                {posts.map(p => (
                  <div key={p.id} className="post-card">
                    <span style={{marginRight:'10px'}}>{p.author}</span>
                    <span>{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 다른 탭들 연결 */}
        {activeTab === 'album' && <Album />}
        {activeTab === 'diary' && <Diary />}
        {activeTab === 'guestbook' && <Guestbook />}
        {activeTab === 'messenger' && <Messenger />}

      </main>
    </div>
  );
};

export default MiniRoom;