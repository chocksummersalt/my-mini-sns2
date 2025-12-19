import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

const MiniRoomView = ({ 
  wallColor, 
  bgImage, 
  setBgImage, 
  avatar, 
  setAvatar, 
  isAvatarImage, 
  setIsAvatarImage,
  showAvatarSelector,
  setShowAvatarSelector,
  avatarTab,
  setAvatarTab,
  isOwner,
  userId,
  currentUser,
  userProfile,
  handleBgUpload
}) => {
  const onEmojiClick = async (emojiObject) => {
    if (!isOwner) return;
    setAvatar(emojiObject.emoji); 
    setIsAvatarImage(false);      
    setShowAvatarSelector(false);
    
    // 프로필 업데이트
    if (userId && currentUser) {
      try {
        await setDoc(doc(db, 'users', userId), {
          ...userProfile,
          avatar: emojiObject.emoji
        }, { merge: true });
      } catch (error) {
        console.error('프로필 업데이트 실패:', error);
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = { 
      maxSizeMB: 0.1,
      maxWidthOrHeight: 200,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const fileName = `avatars/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      setAvatar(downloadURL);
      setIsAvatarImage(true);
      setShowAvatarSelector(false);
      
      if (userId && currentUser) {
        try {
          await setDoc(doc(db, 'users', userId), {
            ...userProfile,
            avatar: downloadURL
          }, { merge: true });
        } catch (error) {
          console.error('프로필 업데이트 실패:', error);
        }
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("사진 업로드 중 문제가 생겼습니다.");
    }
  };

  return (
    <div className="home-content">
      <div className="room-frame">
        <div 
          className="room-wall" 
          style={{ 
            backgroundColor: bgImage ? 'transparent' : wallColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover', 
            backgroundPosition: 'center'
          }}
        >
          {!bgImage && <div className="room-floor"></div>}
          
          <div className="avatar">
            {isAvatarImage ? (
              <img src={avatar} alt="my avatar" className="avatar-img" />
            ) : (
              avatar
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="controls">
          <div className="control-actions">
            <label className="custom-file-btn">
              📷 배경 꾸미기
              <input type="file" onChange={handleBgUpload} accept="image/*" />
            </label>

            <div className="avatar-control-wrapper">
              <button 
                className="avatar-select-main-btn"
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              >
                😊 아바타 변경
              </button>

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
      )}
    </div>
  );
};

export default MiniRoomView;

