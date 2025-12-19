import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, query, collection, where, orderBy, onSnapshot } from 'firebase/firestore';

// 컴포넌트 import
import Sidebar from './components/Sidebar';
import MiniRoomView from './components/MiniRoomView';
import Feed from './components/Feed';
import Album from './components/Album';
import Diary from './components/Diary';
import Guestbook from './components/Guestbook';
import Messenger from './components/Messenger';
import Settings from './components/Settings';

// 배경 이미지는 public 폴더에서 직접 참조 (Vercel 빌드 호환성)
const bgwebImage = '/bgweb.png';
const bgmobileImage = '/bgmobile.png';

const MiniRoom = () => {
  // URL에서 사용자 이름 가져오기
  const { username } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userId, setUserId] = useState(null);

  const [activeTab, setActiveTab] = useState('home'); 
  const [wallColor, setWallColor] = useState('#ffe4e1');
  const [bgImage, setBgImage] = useState(null);
  
  // 아바타 & 이모지 상태 (사용자 프로필에서 가져오기)
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [isAvatarImage, setIsAvatarImage] = useState(false);
  
  // 팝업 관련 상태
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarTab, setAvatarTab] = useState('emoji');

  // 피드 상태
  const [inputText, setInputText] = useState('');
  const [posts, setPosts] = useState([]);

  // 설정 관련 상태
  const [menuIcons, setMenuIcons] = useState({
    home: '🏠',
    album: '📷',
    diary: '📒',
    guestbook: '📝',
    messenger: '💬'
  });
  const [customBgImage, setCustomBgImage] = useState(null);

  // 사용자 프로필 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // username으로 userId 찾기
        let targetUserId = username;
        const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        
        if (usernameDoc.exists()) {
          targetUserId = usernameDoc.data().userId;
        }
        setUserId(targetUserId);

        // 사용자 프로필 가져오기
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (userDoc.exists()) {
          const profile = userDoc.data();
          setUserProfile(profile);
          setAvatar(profile.avatar || '🧑‍💻');
          setIsAvatarImage(profile.avatar && profile.avatar.startsWith('http'));
          setWallColor(profile.wallColor || '#ffe4e1');
        }

        // 현재 로그인한 사용자 확인
        onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setIsOwner(user && user.uid === targetUserId);
        });
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      }
    };

    if (username) {
      loadUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [username]);

  // 피드 불러오기 (사용자별)
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "feeds"),
      where("userId", "==", userId),
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
  }, [userId]);

  // 배경 업로드 (로컬 미리보기만 유지)
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  // 텍스트 포맷팅 함수
  const formatText = (text) => {
    if (!text) return "";
    const chunks = text.match(/.{1,17}/g); 
    return chunks ? chunks.join('\n') : text;
  };

  // 화면 크기에 따라 배경 이미지 선택 (반응형)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // 배경 이미지 선택 (안전하게 처리)
  const backgroundImage = isMobile ? bgmobileImage : bgwebImage;
  
  // 배경 이미지 스타일 (이미지가 없을 경우를 대비)
  const backgroundStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  } : {
    backgroundColor: '#f4f4f4'
  };

  // 프로필이 로드되지 않았으면 로딩 표시
  if (!username) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div 
      className="app-container"
      style={backgroundStyle}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuIcons={menuIcons}
        username={username}
        avatar={avatar}
        currentUser={currentUser}
        isOwner={isOwner}
      />

      <main className="content-area">
        {activeTab === 'home' && (
          <>
            <MiniRoomView
              wallColor={wallColor}
              bgImage={bgImage}
              setBgImage={setBgImage}
              avatar={avatar}
              setAvatar={setAvatar}
              isAvatarImage={isAvatarImage}
              setIsAvatarImage={setIsAvatarImage}
              showAvatarSelector={showAvatarSelector}
              setShowAvatarSelector={setShowAvatarSelector}
              avatarTab={avatarTab}
              setAvatarTab={setAvatarTab}
              isOwner={isOwner}
              userId={userId}
              currentUser={currentUser}
              userProfile={userProfile}
              handleBgUpload={handleBgUpload}
            />
            <Feed
              posts={posts}
              inputText={inputText}
              setInputText={setInputText}
              avatar={avatar}
              isOwner={isOwner}
              currentUser={currentUser}
              userId={userId}
              username={username}
              navigate={navigate}
              formatText={formatText}
            />
          </>
        )}

        {activeTab === 'album' && <Album />}
        {activeTab === 'diary' && <Diary />}
        {activeTab === 'guestbook' && <Guestbook />}
        {activeTab === 'messenger' && <Messenger />}
        
        {activeTab === 'settings' && isOwner && (
          <Settings
            menuIcons={menuIcons}
            setMenuIcons={setMenuIcons}
            customBgImage={customBgImage}
            setCustomBgImage={setCustomBgImage}
            setBgImage={setBgImage}
          />
        )}
      </main>
    </div>
  );
};

export default MiniRoom;
