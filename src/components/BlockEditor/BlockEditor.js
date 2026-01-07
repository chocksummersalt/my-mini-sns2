import React, { useState } from 'react';
import './BlockEditor.css';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const BlockEditor = ({ onSubmit, currentUser, userId, isOwner }) => {
  const [textContent, setTextContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());

  // 이미지 선택
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImages.length + files.length > 5) {
      alert('이미지는 최대 5개까지 추가할 수 있습니다.');
      return;
    }

    const newImages = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newImages);

    // input 초기화
    e.target.value = '';
  };

  // 영상 선택
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);

    if (selectedVideos.length + files.length > 2) {
      alert('영상은 최대 2개까지 추가할 수 있습니다.');
      return;
    }

    // 크기 제한 체크 (50MB)
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert(`${file.name}은(는) 50MB를 초과합니다.`);
        return;
      }
    }

    const newVideos = [...selectedVideos, ...files].slice(0, 2);
    setSelectedVideos(newVideos);

    // input 초기화
    e.target.value = '';
  };

  // 이미지 제거
  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // 영상 제거
  const removeVideo = (index) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  };

  // 이미지 업로드
  const uploadImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true
    };

    const compressedFile = await imageCompression(file, options);
    const fileName = `feeds/${userId}/temp_${Date.now()}/image_${Date.now()}_${Math.random()}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  // 영상 업로드
  const uploadVideo = async (file) => {
    const fileName = `feeds/${userId}/temp_${Date.now()}/video_${Date.now()}_${Math.random()}.mp4`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  // 게시물 등록
  const handleSubmit = async () => {
    if (!textContent.trim() && selectedImages.length === 0 && selectedVideos.length === 0) {
      alert('내용을 입력하거나 미디어를 추가해주세요.');
      return;
    }

    if (uploadingFiles.size > 0) {
      alert('파일 업로드가 완료될 때까지 기다려주세요.');
      return;
    }

    try {
      const blocks = [];
      let order = 0;

      // 1. 텍스트 블록 추가
      if (textContent.trim()) {
        blocks.push({
          id: `text_${Date.now()}`,
          type: 'text',
          order: order++,
          content: textContent,
          metadata: {}
        });
      }

      // 2. 이미지 일괄 업로드
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const fileId = `image_${Date.now()}_${i}`;

        setUploadingFiles(prev => new Set([...prev, fileId]));

        try {
          const downloadURL = await uploadImage(file);
          blocks.push({
            id: fileId,
            type: 'image',
            order: order++,
            content: downloadURL,
            metadata: {
              fileName: file.name,
              fileSize: file.size
            }
          });
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert(`이미지 업로드 실패: ${file.name}`);
        } finally {
          setUploadingFiles(prev => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
          });
        }
      }

      // 3. 영상 일괄 업로드
      for (let i = 0; i < selectedVideos.length; i++) {
        const file = selectedVideos[i];
        const fileId = `video_${Date.now()}_${i}`;

        setUploadingFiles(prev => new Set([...prev, fileId]));

        try {
          const downloadURL = await uploadVideo(file);
          blocks.push({
            id: fileId,
            type: 'video',
            order: order++,
            content: downloadURL,
            metadata: {
              fileName: file.name,
              fileSize: file.size
            }
          });
        } catch (error) {
          console.error('영상 업로드 실패:', error);
          alert(`영상 업로드 실패: ${file.name}`);
        } finally {
          setUploadingFiles(prev => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
          });
        }
      }

      // 4. 부모 컴포넌트로 전달
      if (blocks.length > 0) {
        await onSubmit(blocks);

        // 초기화
        setTextContent('');
        setSelectedImages([]);
        setSelectedVideos([]);
      }

    } catch (error) {
      console.error('게시물 등록 실패:', error);
      alert('게시물 등록에 실패했습니다.');
    }
  };

  return (
    <div className="block-editor">
      {/* 메인 텍스트 입력 */}
      <textarea
        className="editor-textarea"
        placeholder="무슨 생각을 하고 계신가요?"
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        disabled={uploadingFiles.size > 0}
      />

      {/* 미디어 미리보기 그리드 */}
      {(selectedImages.length > 0 || selectedVideos.length > 0) && (
        <div className="media-preview-grid">
          {/* 이미지 미리보기 */}
          {selectedImages.map((file, index) => (
            <div key={`img-${index}`} className="media-preview-item">
              <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
              <button
                className="media-remove-btn"
                onClick={() => removeImage(index)}
                title="제거"
              >
                ×
              </button>
            </div>
          ))}

          {/* 영상 미리보기 */}
          {selectedVideos.map((file, index) => (
            <div key={`vid-${index}`} className="media-preview-item">
              <video src={URL.createObjectURL(file)} />
              <div className="video-overlay">🎥</div>
              <button
                className="media-remove-btn"
                onClick={() => removeVideo(index)}
                title="제거"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 하단 툴바 */}
      <div className="editor-toolbar">
        <div className="media-buttons">
          {/* 이미지 버튼 */}
          <label className={`media-btn ${selectedImages.length >= 5 ? 'disabled' : ''}`}>
            <span className="media-icon">📷</span>
            <span className="media-label">
              사진 {selectedImages.length > 0 && `(${selectedImages.length}/5)`}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={selectedImages.length >= 5 || uploadingFiles.size > 0}
              style={{ display: 'none' }}
            />
          </label>

          {/* 영상 버튼 */}
          <label className={`media-btn ${selectedVideos.length >= 2 ? 'disabled' : ''}`}>
            <span className="media-icon">🎥</span>
            <span className="media-label">
              동영상 {selectedVideos.length > 0 && `(${selectedVideos.length}/2)`}
            </span>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoSelect}
              disabled={selectedVideos.length >= 2 || uploadingFiles.size > 0}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* 등록 버튼 */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={uploadingFiles.size > 0}
        >
          {uploadingFiles.size > 0 ? '업로드 중...' : '게시'}
        </button>
      </div>
    </div>
  );
};

export default BlockEditor;
