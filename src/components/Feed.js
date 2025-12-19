import React from 'react';
import './Feed.css';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Feed = ({ posts, inputText, setInputText, avatar, isOwner, currentUser, userId, username, navigate, formatText }) => {
  const handlePostSubmit = async () => {
    if (inputText.trim() === '') return;
    if (!currentUser || !isOwner) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    try {
      await addDoc(collection(db, "feeds"), {
        text: inputText,
        author: avatar,
        userId: userId,
        username: username,
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setInputText('');
    } catch (error) {
      console.error("글 작성 실패:", error);
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

  return (
    <div className="feed-section">
      <h3>📢 뉴스피드 (전체 공유)</h3>
      {isOwner && (
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
  );
};

export default Feed;

