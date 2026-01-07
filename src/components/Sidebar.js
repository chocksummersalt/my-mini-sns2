import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  menuIcons, 
  username, 
  avatar, 
  currentUser, 
  isOwner 
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className="sidebar">
      <div className="logo" onClick={() => navigate('/')}>My SNS</div>
      <div className="user-info">
        <div className="user-avatar-display">
          {avatar && (avatar.startsWith('http') || avatar.startsWith('blob:')) ? (
            <img src={avatar} alt="avatar" className="user-avatar-img" />
          ) : (
            avatar
          )}
        </div>
        <div className="user-name">@{username}</div>
        {currentUser && (
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        )}
        {!currentUser && (
          <button className="login-btn" onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </div>
      <ul className="menu-list">
        <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          {menuIcons.home} <span className="menu-text">홈</span>
        </li>
        <li className={activeTab === 'album' ? 'active' : ''} onClick={() => setActiveTab('album')}>
          {menuIcons.album} <span className="menu-text">앨범</span>
        </li>
        <li className={activeTab === 'diary' ? 'active' : ''} onClick={() => setActiveTab('diary')}>
          {menuIcons.diary} <span className="menu-text">다이어리</span>
        </li>
        <li className={activeTab === 'guestbook' ? 'active' : ''} onClick={() => setActiveTab('guestbook')}>
          {menuIcons.guestbook} <span className="menu-text">방명록</span>
        </li>
        <li className={activeTab === 'messenger' ? 'active' : ''} onClick={() => setActiveTab('messenger')}>
          {menuIcons.messenger} <span className="menu-text">메신저</span>
        </li>
        <li className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>
          {menuIcons.ai || '🤖'} <span className="menu-text">AI 이미지</span>
        </li>
        {isOwner && (
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            ⚙️ <span className="menu-text">설정</span>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;

