import React from 'react';

const Settings = ({ menuIcons, setMenuIcons, customBgImage, setCustomBgImage, setBgImage }) => {
  return (
    <div className="tab-content settings-container">
      <h2>⚙️ 설정</h2>
      
      <div className="settings-section">
        <h3>배경 이미지</h3>
        <div className="settings-item">
          <label>배경 이미지 업로드:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setCustomBgImage(event.target.result);
                  setBgImage(event.target.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {customBgImage && (
            <div className="preview-image">
              <img src={customBgImage} alt="배경 미리보기" style={{ maxWidth: '200px', marginTop: '10px' }} />
              <button onClick={() => {
                setCustomBgImage(null);
                setBgImage(null);
              }}>제거</button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>메뉴 아이콘 변경</h3>
        <div className="settings-item">
          <label>홈 아이콘:</label>
          <input
            type="text"
            value={menuIcons.home}
            onChange={(e) => setMenuIcons({...menuIcons, home: e.target.value})}
            placeholder="이모지 입력"
            maxLength={2}
          />
        </div>
        <div className="settings-item">
          <label>앨범 아이콘:</label>
          <input
            type="text"
            value={menuIcons.album}
            onChange={(e) => setMenuIcons({...menuIcons, album: e.target.value})}
            placeholder="이모지 입력"
            maxLength={2}
          />
        </div>
        <div className="settings-item">
          <label>다이어리 아이콘:</label>
          <input
            type="text"
            value={menuIcons.diary}
            onChange={(e) => setMenuIcons({...menuIcons, diary: e.target.value})}
            placeholder="이모지 입력"
            maxLength={2}
          />
        </div>
        <div className="settings-item">
          <label>방명록 아이콘:</label>
          <input
            type="text"
            value={menuIcons.guestbook}
            onChange={(e) => setMenuIcons({...menuIcons, guestbook: e.target.value})}
            placeholder="이모지 입력"
            maxLength={2}
          />
        </div>
        <div className="settings-item">
          <label>메신저 아이콘:</label>
          <input
            type="text"
            value={menuIcons.messenger}
            onChange={(e) => setMenuIcons({...menuIcons, messenger: e.target.value})}
            placeholder="이모지 입력"
            maxLength={2}
          />
        </div>
        <button 
          onClick={() => {
            setMenuIcons({
              home: '🏠',
              album: '📷',
              diary: '📒',
              guestbook: '📝',
              messenger: '💬'
            });
          }}
          className="reset-btn"
        >
          기본값으로 복원
        </button>
      </div>
    </div>
  );
};

export default Settings;

