import React, { useState, useRef } from 'react';
import './MiniRoom.css';

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
// 5. 💬 메신저 컴포넌트 (채팅)
// ==========================================
const Messenger = () => {
  // 대화 상대 목록
  const friends = [
    { id: 1, name: "단짝친구", avatar: "🐱", status: "온라인" },
    { id: 2, name: "김코딩", avatar: "💻", status: "부재중" },
    { id: 3, name: "댄스강사", avatar: "💃", status: "오프라인" },
  ];

  const [activeChatId, setActiveChatId] = useState(1); // 현재 대화 중인 상대 ID
  const [inputMsg, setInputMsg] = useState("");
  
  // 대화 내용 데이터
  const [chatLogs, setChatLogs] = useState([
    { roomId: 1, sender: 'them', text: "안녕! 오랜만이야 ㅋㅋ" },
    { roomId: 1, sender: 'me', text: "오 진짜 오랜만이네!" },
    { roomId: 2, sender: 'them', text: "과제 다 했어?" },
  ]);

  // 메시지 전송 기능
  const sendMessage = () => {
    if (!inputMsg.trim()) return;

    // 1. 내가 쓴 글 추가
    const newMsg = { roomId: activeChatId, sender: 'me', text: inputMsg };
    setChatLogs(prev => [...prev, newMsg]);
    setInputMsg("");

    // 2. 상대방 자동 답장 (1초 뒤 시뮬레이션)
    setTimeout(() => {
      const replyMsg = { 
        roomId: activeChatId, 
        sender: 'them', 
        text: "오, 그렇구나! (자동 응답)" 
      };
      setChatLogs(prev => [...prev, replyMsg]);
    }, 1000);
  };

  const currentMessages = chatLogs.filter(msg => msg.roomId === activeChatId);
  const currentFriend = friends.find(f => f.id === activeChatId);

  return (
    <div className="tab-content messenger-container">
      {/* 왼쪽: 친구 목록 */}
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

      {/* 오른쪽: 채팅창 */}
      <div className="chat-room">
        <div className="chat-header">
          <span>{currentFriend.avatar} <strong>{currentFriend.name}</strong>님과의 대화</span>
        </div>
        
        <div className="chat-messages">
          {currentMessages.length === 0 ? (
            <p className="no-msg">대화를 시작해보세요!</p>
          ) : (
            currentMessages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="메시지를 입력하세요..." 
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
      <nav className="sidebar">
        <div className="logo">My SNS</div>
        <ul className="menu-list">
          <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>🏠 홈</li>
          <li className={activeTab === 'album' ? 'active' : ''} onClick={() => setActiveTab('album')}>📷 앨범</li>
          <li className={activeTab === 'diary' ? 'active' : ''} onClick={() => setActiveTab('diary')}>📒 다이어리</li>
          <li className={activeTab === 'guestbook' ? 'active' : ''} onClick={() => setActiveTab('guestbook')}>📝 방명록</li>
          <li className={activeTab === 'messenger' ? 'active' : ''} onClick={() => setActiveTab('messenger')}>💬 메신저</li>
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

            <div className="controls">
               <button onClick={() => setWallColor('#ffe4e1')}>분홍</button>
               <label className="file-upload-btn" style={{display:'inline-block', border:'1px solid #ccc', padding:'2px 5px', fontSize:'12px', cursor:'pointer'}}>
                 배경변경 <input type="file" onChange={handleBgUpload} style={{display:'none'}} />
               </label>
               <button onClick={() => setAvatar('🧑‍💻')}>나</button>
               <button onClick={() => setAvatar('🐱')}>냥이</button>
            </div>

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