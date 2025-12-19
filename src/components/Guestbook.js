import React, { useState } from 'react';
import './Guestbook.css';

const Guestbook = () => {
  const [messages, setMessages] = useState([
    { id: 1, name: "일촌1", text: "홈피 개설 축하해~!" }
  ]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const addMessage = () => {
    if (!name || !msg) return;
    setMessages([{ id: Date.now(), name, text: msg }, ...messages]);
    setName("");
    setMsg("");
  };

  return (
    <div className="tab-content">
      <h2>📝 방명록</h2>
      <div className="guestbook-input">
        <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} style={{width:'80px'}} />
        <input placeholder="한마디 남겨주세요" value={msg} onChange={(e) => setMsg(e.target.value)} style={{flex:1}} />
        <button onClick={addMessage}>남기기</button>
      </div>
      <ul className="guestbook-list">
        {messages.map(m => (
          <li key={m.id} className="guestbook-item">
            <strong>{m.name}:</strong> {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Guestbook;

