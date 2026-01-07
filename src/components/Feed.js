import React from 'react';
import './Feed.css';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import BlockEditor from './BlockEditor/BlockEditor';

const Feed = ({ posts, inputText, setInputText, avatar, isOwner, currentUser, userId, username, navigate, formatText }) => {
  // 블록 기반 게시물 등록
  const handleBlockPostSubmit = async (blocks) => {
    if (!currentUser || !isOwner) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      await addDoc(collection(db, "feeds"), {
        text: null,  // 레거시 필드
        blocks: blocks,
        imageCount: blocks.filter(b => b.type === 'image').length,
        videoCount: blocks.filter(b => b.type === 'video').length,
        author: avatar,
        userId: userId,
        username: username,
        createdAt: serverTimestamp(),
        likes: 0,
        _name_: username || userId,
      });
    } catch (error) {
      console.error("글 작성 실패:", error);
      alert('게시물 작성에 실패했습니다.');
    }
  };

  const handleLike = async (id, currentLikes) => {
    const postRef = doc(db, "feeds", id);
    await updateDoc(postRef, { likes: currentLikes + 1 });
  };

  const handleDelete = async (id) => {
    if (!isOwner) {
      alert('본인의 글만 삭제할 수 있습니다.');
      return;
    }
    if(window.confirm("정말 삭제하시겠습니까?")) {
      const postRef = doc(db, "feeds", id);
      await deleteDoc(postRef);
    }
  };

  // 블록 렌더링 함수
  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <p key={block.id} className="post-text">
            {formatText(block.content)}
          </p>
        );

      case 'image':
        return (
          <img
            key={block.id}
            src={block.content}
            alt="post"
            className="post-image"
            loading="lazy"
          />
        );

      case 'video':
        return (
          <video
            key={block.id}
            src={block.content}
            controls
            className="post-video"
            preload="metadata"
          >
            동영상을 재생할 수 없습니다.
          </video>
        );

      default:
        return null;
    }
  };

  return (
    <div className="feed-section">
      <h3>📢 뉴스피드 (전체 공유)</h3>
      {isOwner && (
        <BlockEditor
          onSubmit={handleBlockPostSubmit}
          currentUser={currentUser}
          userId={userId}
          isOwner={isOwner}
          avatar={avatar}
          username={username}
        />
      )}

      <div className="post-list">
        {posts.map(p => (
          <div key={p.id} className="post-card">
            <div className="post-header">
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
              {isOwner && (
                <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
              )}
            </div>
            <div className="post-content">
              {/* 레거시 게시물 (텍스트만) */}
              {p.text && !p.blocks ? (
                <p className="post-text">{formatText(p.text)}</p>
              ) : null}

              {/* 블록 게시물 */}
              {p.blocks && p.blocks.length > 0 ? (
                p.blocks
                  .sort((a, b) => a.order - b.order)
                  .map(block => renderBlock(block))
              ) : null}
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
  );
};

export default Feed;

