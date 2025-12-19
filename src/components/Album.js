import React, { useState } from 'react';

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

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          id: Date.now(),
          url: event.target.result,
          title: "새 사진",
          desc: "",
          likes: 0,
          comments: []
        };
        setPhotos([newPhoto, ...photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setCommentInput("");
  };

  const handleLike = (photoId) => {
    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, likes: p.likes + 1 } : p
    ));
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto({ ...selectedPhoto, likes: selectedPhoto.likes + 1 });
    }
  };

  const handleComment = () => {
    if (!commentInput.trim() || !selectedPhoto) return;

    const newComment = {
      id: Date.now(),
      user: "나",
      text: commentInput
    };

    const updatedPhotos = photos.map(p => 
      p.id === selectedPhoto.id 
        ? { ...p, comments: [...p.comments, newComment] } 
        : p
    );
    setPhotos(updatedPhotos);

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

      <div className="photo-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-item" onClick={() => openModal(photo)}>
            <img src={photo.url} alt={photo.title} />
            <div className="photo-overlay">
              <span>❤️ {photo.likes}</span>
              <span>💬 {photo.comments.length}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-photo-section">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} />
              <div className="photo-actions">
                <button onClick={() => handleLike(selectedPhoto.id)}>
                  ❤️ {selectedPhoto.likes}
                </button>
              </div>
            </div>
            
            <div className="modal-info-section">
              <h3>{selectedPhoto.title}</h3>
              <p>{selectedPhoto.desc}</p>
              
              <div className="comments-section">
                <h4>댓글 ({selectedPhoto.comments.length})</h4>
                <div className="comments-list">
                  {selectedPhoto.comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <strong>{comment.user}:</strong> {comment.text}
                    </div>
                  ))}
                </div>
                
                <div className="comment-input-area">
                  <input
                    type="text"
                    placeholder="댓글을 입력하세요..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button onClick={handleComment}>전송</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Album;

