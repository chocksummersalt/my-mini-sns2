import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CommunityBoard from './CommunityBoard';
import './Minihompy.css';

const Minihompy = () => {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [visitCount, setVisitCount] = useState({ today: 221, total: 3709 });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        let targetUserId = username;
        const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));

        if (usernameDoc.exists()) {
          targetUserId = usernameDoc.data().userId;
        }

        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
        });
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      }
    };

    if (username) {
      loadUserProfile();
    }
  }, [username]);

  // Community 메뉴가 선택되면 커뮤니티 게시판 표시
  if (activeMenu === 'Community') {
    return <CommunityBoard />;
  }

  return (
    <div className="minihompy-container">
      {/* 왼쪽 프로필 사이드바 */}
      <div className="profile-sidebar">
        <div className="profile-header">
          <h2>{username}님의 미니홈피</h2>
          <div className="visit-counter">
            <span>TODAY <strong>{visitCount.today}</strong></span>
            <span className="divider">|</span>
            <span>TOTAL <strong>{visitCount.total}</strong></span>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-binder-holes">
            <div className="binder-hole"></div>
            <div className="binder-hole"></div>
            <div className="binder-hole"></div>
            <div className="binder-hole"></div>
          </div>

          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {userProfile?.avatar && userProfile.avatar.startsWith('http') ? (
                <img src={userProfile.avatar} alt="avatar" />
              ) : (
                <span className="emoji-avatar">{userProfile?.avatar || '🧑‍💻'}</span>
              )}
            </div>
          </div>

          <div className="profile-info">
            <div className="welcome-message">
              {username}님의 미니홈피에<br />
              오신 것을<br />
              환영합니다!
            </div>

            <div className="profile-name">{username}</div>

            <select className="mood-selector">
              <option>기분: 짱은</option>
              <option>기분: 행복</option>
              <option>기분: 슬픔</option>
              <option>기분: 화남</option>
              <option>기분: 피곤</option>
            </select>

            <button className="tag-button"># 추를 마도타키</button>
          </div>
        </div>
      </div>

      {/* 중앙 콘텐츠 영역 */}
      <div className="main-content">
        <div className="content-header">
          <div className="cyworld-logo">
            <div className="logo-icon">😊</div>
            <div className="logo-text">CYWORLD</div>
          </div>
          <div className="content-controls">
            <button className="bgm-button">🎵 BGM ▶</button>
            <button className="list-button">👥 LIST</button>
          </div>
        </div>

        <div className="content-main">
          <div className="content-tabs">
            <button
              className={`content-tab ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              특데이
            </button>
            <button
              className={`content-tab ${activeTab === 'jukebox' ? 'active' : ''}`}
              onClick={() => setActiveTab('jukebox')}
            >
              주크박스
            </button>
            <button
              className={`content-tab ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveTab('photo')}
            >
              사진첩 <span className="new-badge">N</span>
            </button>
            <button
              className={`content-tab ${activeTab === 'guestbook' ? 'active' : ''}`}
              onClick={() => setActiveTab('guestbook')}
            >
              방명록 <span className="new-badge">N</span>
            </button>
          </div>

          <div className="content-body">
            <div className="content-links">
              <div className="content-link">그간의 일기...</div>
              <div className="content-link">여행 사진들...</div>
            </div>

            <div className="miniroom-display">
              <div className="miniroom-scene">
                {/* 미니룸 일러스트 영역 */}
                <div className="miniroom-placeholder">
                  <div className="miniroom-text">🏠 미니룸</div>
                  <div className="miniroom-desc">나만의 공간을 꾸며보세요</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 네비게이션 메뉴 */}
      <div className="nav-menu">
        {['Home', 'Profile', 'Jukebox', 'Minroom', 'Photo', 'Board', 'Paper', 'Visitor', 'Community', 'Favorite'].map((menu) => (
          <button
            key={menu}
            className={`nav-button ${activeMenu === menu ? 'active' : ''}`}
            onClick={() => setActiveMenu(menu)}
          >
            {menu}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Minihompy;
