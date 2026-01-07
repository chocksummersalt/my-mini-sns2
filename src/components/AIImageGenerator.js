import React, { useState } from 'react';
import './AIImageGenerator.css';

const AIImageGenerator = ({ setBgImage }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);

  const MAX_GENERATIONS = 5; // 세션당 생성 횟수 제한

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    if (generationCount >= MAX_GENERATIONS) {
      alert(`최대 생성 횟수 (${MAX_GENERATIONS}회)를 초과했습니다.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API 키가 유효하지 않습니다. 환경 변수를 확인해주세요.');
        } else if (response.status === 429) {
          throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (response.status === 400) {
          throw new Error('프롬프트가 정책을 위반했습니다. 다른 내용으로 시도해주세요.');
        } else {
          throw new Error(`이미지 생성 실패 (HTTP ${response.status})`);
        }
      }

      const data = await response.json();

      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedImage(data.data[0].url);
        setGenerationCount(prev => prev + 1);
      } else {
        throw new Error('이미지 URL을 받지 못했습니다.');
      }

    } catch (err) {
      console.error('AI 이미지 생성 오류:', err);
      setError(err.message || '이미지 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const applyAsBackground = () => {
    if (!generatedImage) {
      alert('먼저 이미지를 생성해주세요.');
      return;
    }

    setBgImage(generatedImage);
    alert('배경이 성공적으로 적용되었습니다!');
  };

  const downloadImage = () => {
    if (!generatedImage) {
      alert('먼저 이미지를 생성해주세요.');
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ai-generator-container">
      <h2>🤖 AI 이미지 생성</h2>
      <p className="ai-description">
        DALL-E 3를 사용해 원하는 배경 이미지를 생성하세요!
      </p>

      <div className="generation-info">
        <span className="generation-count">
          생성 횟수: {generationCount} / {MAX_GENERATIONS}
        </span>
      </div>

      <div className="prompt-input-area">
        <textarea
          className="prompt-textarea"
          placeholder="예: A serene mountain landscape at sunset with pink and orange sky, digital art style"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={4}
        />

        <button
          className="generate-btn"
          onClick={generateImage}
          disabled={loading || generationCount >= MAX_GENERATIONS}
        >
          {loading ? '생성 중...' : '이미지 생성'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {generatedImage && (
        <div className="generated-image-section">
          <h3>생성된 이미지</h3>
          <div className="image-preview">
            <img src={generatedImage} alt="AI generated" />
          </div>

          <div className="action-buttons">
            <button className="apply-bg-btn" onClick={applyAsBackground}>
              배경으로 설정
            </button>
            <button className="download-btn" onClick={downloadImage}>
              다운로드
            </button>
          </div>
        </div>
      )}

      <div className="usage-tips">
        <h4>💡 팁</h4>
        <ul>
          <li>영어로 입력하면 더 좋은 결과를 얻을 수 있습니다</li>
          <li>구체적이고 상세한 설명이 더 나은 이미지를 만듭니다</li>
          <li>스타일을 명시하면 더 원하는 느낌의 이미지를 얻을 수 있어요 (예: digital art, watercolor, 3D render)</li>
        </ul>
      </div>
    </div>
  );
};

export default AIImageGenerator;
