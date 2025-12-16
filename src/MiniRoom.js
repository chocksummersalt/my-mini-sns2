import React, { useState, useEffect } from 'react';
import './MiniRoom.css';
import { db, storage } from './firebase'; // storage 추가됨
import bgwebImage from './assets/bgweb.png';
import bgmobileImage from './assets/bgmobile.png';
import imageCompression from 'browser-image-compression'; 
import EmojiPicker from 'emoji-picker-react';

import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, deleteDoc, doc, where
} from 'firebase/firestore';

// 스토리지 관련 함수 불러오기
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ==========================================
// 1. 📷 앨범 컴포넌트
// ==========================================
const Album = () => {
  const [photos, setPhotos] = useState([
    { 
      id: 1, 
      url: "https://via.placeholder.com/600/FFB6C1/000000?text=Trip", 
      title: "여름 휴가", 
      desc: "제주도 바다 정말 예뻤다! 🌊",
      likes: 12, 
      comments: [{ id: 1, user: "친구1", text: "우와 부럽다!" }] 
    },
    { 
      id: 2, 
      url: "https://via.placeholder.com/600/87CEEB/000000?text=Food", 
      title: "맛집 탐방", 
      desc: "이 집 파스타 진짜 잘함 🍝",
      likes: 8, 
      comments: [] 
    },
    { 
      id: 3, 
      url: "https://via.placeholder.com/600/F0E68C/000000?text=Cat", 
      title: "우리집 고양이", 
      desc: "자는 모습이 천사야 😻",
      likes: 25, 
      comments: [{ id: 1, user: "냥집사", text: "츄르길만 걷자" }, { id: 2, user: "지나가던사람", text: "귀여워요ㅠㅠ" }] 
    },
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState(null); // 현재 클릭해서 보고 있는 사진
  const [commentInput, setCommentInput] = useState("");     // 댓글 입력창 내용

  // 사진 업로드 (미리보기만 구현)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPhoto = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        title: "새로운 사진",
        desc: "새로 올린 사진입니다.",
        likes: 0,
        comments: []
      };
      setPhotos([newPhoto, ...photos]);
    }
  };

  // 상세 보기 모달 열기
  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setCommentInput(""); // 입력창 초기화
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // 좋아요 기능 (모달 내부)
  const handleLike = () => {
    if (!selectedPhoto) return;
    
    // 1. 전체 목록 업데이트
    const updatedPhotos = photos.map(p => 
      p.id === selectedPhoto.id ? { ...p, likes: p.likes + 1 } : p
    );
    setPhotos(updatedPhotos);

    // 2. 현재 보고 있는 모달 데이터도 업데이트
    setSelectedPhoto({ ...selectedPhoto, likes: selectedPhoto.likes + 1 });
  };

  // 댓글 작성 기능
  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedPhoto) return;

    const newComment = {
      id: Date.now(),
      user: "나", // 로그인 기능이 없으므로 '나'로 고정
      text: commentInput
    };

    // 1. 전체 목록 업데이트
    const updatedPhotos = photos.map(p => 
      p.id === selectedPhoto.id 
        ? { ...p, comments: [...p.comments, newComment] } 
        : p
    );
    setPhotos(updatedPhotos);

    // 2. 현재 모달 데이터 업데이트
    setSelectedPhoto({ 
      ...selectedPhoto, 
      comments: [...selectedPhoto.comments, newComment] 
    });
    setCommentInput("");
  };

  return (
    <div className="tab-content album-container">
      <div className="album-header">
        <h2>📷 나의 사진첩</h2>
        <label className="upload-btn-box">
          ➕ 사진 추가
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}}/>
        </label>
      </div>

      {/* 사진 그리드 */}
      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-item" onClick={() => openModal(photo)}>
            <img src={photo.url} alt={photo.title} />
            {/* 마우스 올렸을 때 뜨는 정보 (호버 오버레이) */}
            <div className="photo-overlay">
              <span>❤️ {photo.likes}</span>
              <span>💬 {photo.comments.length}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ▼▼▼ 상세 보기 모달 (팝업창) ▼▼▼ */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* 왼쪽: 사진 영역 */}
            <div className="modal-image-box">
              <img src={selectedPhoto.url} alt="detail" />
            </div>

            {/* 오른쪽: 정보 및 댓글 영역 */}
            <div className="modal-info-box">
              <div className="modal-header">
                <span className="modal-user-id">🧑‍💻 user_id</span>
                <button className="modal-close-btn" onClick={closeModal}>✕</button>
              </div>
              
              <div className="modal-body">
                {/* 본문 설명 */}
                <div className="modal-desc">
                  <strong>user_id</strong> {selectedPhoto.desc}
                </div>
                
                {/* 댓글 리스트 */}
                <div className="modal-comments">
                  {selectedPhoto.comments.map(c => (
                    <div key={c.id} className="comment-row">
                      <strong>{c.user}</strong> {c.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <div className="modal-actions">
                  <button onClick={handleLike}>❤️</button>
                  <button>💬</button>
                </div>
                <div className="modal-likes">좋아요 {selectedPhoto.likes}개</div>
                
                {/* 댓글 입력창 */}
                <div className="modal-input-area">
                  <input 
                    type="text" 
                    placeholder="댓글 달기..." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button onClick={handleAddComment}>게시</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
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

// ==========================================
// 5. 🏠 메인 미니룸 컴포넌트 (통합)
// ==========================================
const MiniRoom = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [wallColor] = useState('#ffe4e1'); // setWallColor는 현재 사용하지 않음
  const [bgImage, setBgImage] = useState(null);
  
  // 아바타 & 이모지 상태 (로컬 스토리지 연동: 새로고침 유지)
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('my_mini_avatar');
    return saved || '🧑‍💻';
  });
  
  const [isAvatarImage, setIsAvatarImage] = useState(() => {
    const saved = localStorage.getItem('my_mini_avatar');
    // 저장된 값이 http로 시작하면 사진이라고 판단
    return saved && (saved.startsWith('http') || saved.startsWith('blob:')); 
  });

  // 상태 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('my_mini_avatar', avatar);
  }, [avatar]);
  
  // 팝업 관련 상태
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarTab, setAvatarTab] = useState('emoji');

  // 피드 상태
  const [inputText, setInputText] = useState('');
  const [posts, setPosts] = useState([]);

  // --- 기능 함수들 ---

  // 1. 이모티콘 클릭
  const onEmojiClick = (emojiObject) => {
    setAvatar(emojiObject.emoji); 
    setIsAvatarImage(false);      
    setShowAvatarSelector(false);    
  };
  // --- [추가] 17글자마다 줄바꿈 해주는 함수 ---
  const formatText = (text) => {
    if (!text) return "";
    // 정규식 설명: 모든 글자(.)를 1개에서 17개까지({1,17}) 묶어서 배열로 만듦
    const chunks = text.match(/.{1,17}/g); 
    // 그 묶음들을 줄바꿈 문자(\n)로 연결해서 리턴
    return chunks ? chunks.join('\n') : text;
  };

  // 2. 아바타 사진 업로드 (파이어베이스 스토리지로 전송!)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 압축 옵션
    const options = { 
      maxSizeMB: 0.1,  // 용량 제한
      maxWidthOrHeight: 200, // 크기 제한
      useWebWorker: true
    };

    try {
      // 1. 압축하기
      const compressedFile = await imageCompression(file, options);
      
      // 2. 서버(Storage)에 올릴 이름 만들기 (겹치지 않게 시간 추가)
      const fileName = `avatars/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // 3. 업로드!
      await uploadBytes(storageRef, compressedFile);
      
      // 4. 업로드된 진짜 인터넷 주소 가져오기
      const downloadURL = await getDownloadURL(storageRef);
      
      // 5. 내 아바타로 설정
      setAvatar(downloadURL);
      setIsAvatarImage(true);
      setShowAvatarSelector(false); // 창 닫기
      
      console.log("업로드 성공! 주소:", downloadURL);

    } catch (error) {
      console.error("업로드 실패:", error);
      alert("사진 업로드 중 문제가 생겼습니다.");
    }
  };

  // 배경 업로드 (로컬 미리보기만 유지)
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  // 피드 불러오기
  useEffect(() => {
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

  // 글 작성 (아바타 URL도 함께 저장됨)
  const handlePostSubmit = async () => {
    if (inputText.trim() === '') return;
    try {
      await addDoc(collection(db, "feeds"), {
        text: inputText,
        author: avatar, // 여기에 http://... 주소가 들어감!
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setInputText('');
    } catch (error) {
      console.error("글 작성 실패:", error);
    }
  };

  // 좋아요
  const handleLike = async (id, currentLikes) => {
    const postRef = doc(db, "feeds", id);
    await updateDoc(postRef, { likes: currentLikes + 1 });
  };

  // 삭제
  const handleDelete = async (id) => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
      const postRef = doc(db, "feeds", id);
      await deleteDoc(postRef);
    }
  };

  // 화면 크기에 따라 배경 이미지 선택
  const backgroundImage = window.innerWidth <= 768 ? bgmobileImage : bgwebImage;

  return (
    <div 
      className="app-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
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
                
                {/* 미니룸 안의 아바타 */}
                <div className="avatar">
                  {isAvatarImage ? (
                    <img src={avatar} alt="my avatar" className="avatar-img" />
                  ) : (
                    avatar
                  )}
                </div>
              </div>
            </div>

            {/* --- 컨트롤 패널 --- */}
            <div className="controls">
              <div className="control-actions">
                {/* 1. 배경 꾸미기 버튼 */}
                <label className="custom-file-btn">
                  📷 배경 꾸미기
                  <input type="file" onChange={handleBgUpload} accept="image/*" />
                </label>

                {/* 2. 아바타 변경 버튼 */}
                <div className="avatar-control-wrapper">
                  <button 
                    className="avatar-select-main-btn"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  >
                    😊 아바타 변경
                  </button>

                  {/* 아바타 선택 팝업 */}
                  {showAvatarSelector && (
                    <div className="avatar-popup">
                      <div className="popup-tabs">
                        <button 
                          className={avatarTab === 'emoji' ? 'active' : ''} 
                          onClick={() => setAvatarTab('emoji')}
                        >
                          이모티콘
                        </button>
                        <button 
                          className={avatarTab === 'photo' ? 'active' : ''} 
                          onClick={() => setAvatarTab('photo')}
                        >
                          사진
                        </button>
                      </div>

                      <div className="popup-content">
                        {avatarTab === 'emoji' && (
                          <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={300} />
                        )}
                        
                        {avatarTab === 'photo' && (
                          <div className="photo-upload-area">
                            <p>원하는 사진을 올려주세요</p>
                            <label className="popup-upload-btn">
                              파일 선택
                              {/* 여기 함수가 바뀐 handleAvatarUpload를 실행합니다 */}
                              <input type="file" onChange={handleAvatarUpload} accept="image/*" />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 뉴스피드 */}
            <div className="feed-section">
              <h3>📢 뉴스피드 (전체 공유)</h3>
              <div className="input-box">
                <textarea
                  className="feed-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="모두와 공유할 이야기를 남겨보세요... (최대 300자)"
                  maxLength={300}
                />
                <button onClick={handlePostSubmit} className="feed-submit-btn">등록</button>
              </div>

              <div className="post-list">
                {posts.map(p => (
                  <div key={p.id} className="post-card">
                    <div className="post-header">
                      {/* 게시글 아바타 표시 (http 주소면 사진, 아니면 이모지) */}
                      <div className="post-avatar">
                        {p.author && (p.author.startsWith('http') || p.author.startsWith('blob:')) ? (
                          <img src={p.author} alt="author" />
                        ) : (
                          p.author 
                        )}
                      </div>

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
                     <p className="post-text">{formatText(p.text)}</p>
                    </div>
                    <div className="post-actions">
                      <button className="like-btn" onClick={() => handleLike(p.id, p.likes)}>
                          ❤️ {p.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'album' && <Album />}
        {activeTab === 'diary' && <Diary />}
        {activeTab === 'guestbook' && <Guestbook />}
        {activeTab === 'messenger' && <Messenger />}

      </main>
    </div>
  );
};

export default MiniRoom;