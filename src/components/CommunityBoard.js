import React, { useState } from 'react';
import './CommunityBoard.css';

const CommunityBoard = () => {
  const [activeFilter, setActiveFilter] = useState('best');
  const [searchText, setSearchText] = useState('');

  // 샘플 게시글 데이터
  const [posts] = useState([
    {
      id: 1,
      thumbnail: '🎮',
      title: '오늘의 게임 추천',
      comments: 42,
      author: '게이머',
      time: '10:05',
      type: 'image'
    },
    {
      id: 2,
      thumbnail: '🎵',
      title: '요즘 듣기 좋은 노래 모음',
      comments: 246,
      author: '음악팬',
      time: '09:50',
      type: 'text'
    },
    {
      id: 3,
      thumbnail: '🎬',
      title: '이번 주말 볼만한 영화.gif',
      comments: 45,
      author: '영화광',
      time: '09:41',
      type: 'gif'
    },
    {
      id: 4,
      thumbnail: '🍕',
      title: '맛집 추천 받습니다',
      comments: 41,
      author: '먹방러',
      time: '09:30',
      type: 'text'
    },
    {
      id: 5,
      thumbnail: '⚽',
      title: '어제 경기 하이라이트.JPG',
      comments: 248,
      author: '축구팬',
      time: '09:20',
      type: 'image'
    },
    {
      id: 6,
      thumbnail: '💻',
      title: '프로그래밍 질문 있습니다',
      comments: 14,
      author: '개발자',
      time: '09:10',
      type: 'text'
    },
    {
      id: 7,
      thumbnail: '🎨',
      title: '오늘 그린 그림 평가 부탁드립니다',
      comments: 66,
      author: '화가',
      time: '09:00',
      type: 'image'
    },
    {
      id: 8,
      thumbnail: '📚',
      title: '이번 달 독서 목록 공유',
      comments: 90,
      author: '책벌레',
      time: '08:51',
      type: 'text'
    }
  ]);

  const topGalleries = [
    { name: '도도용', category: '음악인', count: 495, trend: 'up' },
    { name: '야구모판', category: '관무원', count: 1186, trend: 'up' },
    { name: '정품 포켓', category: '스포츠', count: 1405, trend: 'up' },
    { name: '연애격차위험', category: '인물/연예인', count: 3, trend: 'down' },
    { name: '베이커', category: '스포츠', count: 3, trend: 'down' },
    { name: '메시', category: '스포츠', count: 3, trend: 'down' },
    { name: '노무현', category: '문화/예술', count: 3, trend: 'down' },
    { name: '이나바 테위', category: '각성청', count: 3, trend: 'down' }
  ];

  return (
    <div className="community-board">
      {/* 상단 헤더 */}
      <div className="board-header">
        <div className="board-logo">
          <h1>📱 MySNS Community</h1>
          <p className="board-subtitle">트렌디 신규 웹진! <span className="highlight">'오미'</span></p>
        </div>
        <div className="board-search">
          <input
            type="text"
            placeholder="갤러리 & 통합검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {/* 네비게이션 탭 */}
      <div className="board-nav">
        <button className="nav-tab active">갤러리</button>
        <button className="nav-tab">마이너갤</button>
        <button className="nav-tab">미니갤</button>
        <button className="nav-tab">인물갤</button>
        <button className="nav-tab">갤로그 ▼</button>
      </div>

      {/* 필터 영역 */}
      <div className="board-filter">
        <div className="filter-left">
          <button
            className={`filter-btn ${activeFilter === 'best' ? 'active' : ''}`}
            onClick={() => setActiveFilter('best')}
          >
            실시간 베스트 ✓
          </button>
          <button
            className={`filter-btn ${activeFilter === 'lite' ? 'active' : ''}`}
            onClick={() => setActiveFilter('lite')}
          >
            실베라이트
          </button>
          <button
            className={`filter-btn ${activeFilter === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('gallery')}
          >
            실갤 ▶
          </button>
          <button className="filter-badge">평갤 ▽</button>
        </div>
        <div className="filter-right">
          <span className="page-info">1/10</span>
          <button className="page-btn">◀ 이전</button>
          <button className="page-btn">다음 ▶</button>
        </div>
      </div>

      <div className="board-main-content">
        {/* 게시글 목록 */}
        <div className="posts-container">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-thumbnail">
                <div className="thumbnail-icon">{post.thumbnail}</div>
              </div>
              <div className="post-content">
                <div className="post-title-row">
                  <img
                    src={`https://ui-avatars.com/api/?name=${post.author}&size=32&background=random`}
                    alt="avatar"
                    className="post-avatar"
                  />
                  <h3 className="post-title">
                    {post.title}
                    {post.comments > 0 && (
                      <span className="comment-count">[{post.comments}]</span>
                    )}
                  </h3>
                </div>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <span className="post-divider">|</span>
                  <span className="post-time">{post.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 우측 사이드바 */}
        <div className="board-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>실베갤</h3>
              <div className="sidebar-tabs">
                <button className="sidebar-tab active">예인</button>
                <button className="sidebar-tab">마이너</button>
                <button className="sidebar-tab">미니</button>
                <button className="sidebar-tab">인물</button>
              </div>
            </div>

            <div className="gallery-list">
              {topGalleries.map((gallery, index) => (
                <div key={index} className="gallery-item">
                  <span className="gallery-badge">갤</span>
                  <div className="gallery-info">
                    <span className="gallery-name">{gallery.name}</span>
                    <span className="gallery-category">{gallery.category}</span>
                  </div>
                  <div className="gallery-stats">
                    <span className="gallery-count">{gallery.count}</span>
                    <span className={`gallery-trend ${gallery.trend}`}>
                      {gallery.trend === 'up' ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="gallery-range">
              <span>11위 ~ 20위</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-login">
              <input type="text" placeholder="식별 코드" className="login-input" />
              <div className="login-options">
                <label>
                  <input type="checkbox" />
                  코드 저장
                </label>
                <label>
                  <input type="checkbox" />
                  보안접속
                </label>
              </div>
              <input type="password" placeholder="비밀번호" className="login-input" />
              <button className="login-btn">로그인</button>
            </div>
          </div>

          <div className="sidebar-notice">
            <p>고정식 상황 : 식별 표도·비밀번호찾기 🔔</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBoard;
