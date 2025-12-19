import React, { useState } from 'react';
import './Diary.css';

const Diary = () => {
  const [entries, setEntries] = useState([
    { id: 1, date: "2024-05-01", text: "오늘은 코딩을 배웠다. 재미있었다!", mood: "😄" }
  ]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  const addEntry = () => {
    if (!text || !date) return;
    setEntries([{ id: Date.now(), date, text, mood: "😄" }, ...entries]);
    setText("");
    setDate("");
  };

  return (
    <div className="tab-content">
      <h2>📒 비밀 일기장</h2>
      <div className="diary-input">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <textarea 
          placeholder="오늘 무슨 일이 있었나요?" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addEntry}>일기 쓰기</button>
      </div>
      <div className="diary-list">
        {entries.map(entry => (
          <div key={entry.id} className="diary-card">
            <span className="diary-date">{entry.date} {entry.mood}</span>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diary;

