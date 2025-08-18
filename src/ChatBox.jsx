import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const CHAT_SERVER = 'http://localhost:4000';

export default function ChatBox({
  account,
  twitterHandle,
  collapsedRight = 10,
  collapsedTop = 58
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const viewRef = useRef(null);
  const socketRef = useRef(null);

  const name = useMemo(() => {
    if (!account) return 'Guest';
    const short = `${account.slice(0, 4)}...${account.slice(-3)}`;
    return twitterHandle ? `@${twitterHandle} (${short})` : short;
  }, [account, twitterHandle]);

  useEffect(() => {
    const s = io(CHAT_SERVER, { transports: ['websocket'] });
    socketRef.current = s;

    s.on('connect', () => {
      // no room join needed; server puts all in 'global'
    });

    s.on('history', (items) => setMessages(items));
    s.on('message', (msg) => {
      setMessages((m) => [...m, msg]);
      if (!open) setUnread((u) => u + 1);
    });

    return () => { s.disconnect(); };
  }, [open]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = viewRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    socketRef.current?.emit('message', { name, text });
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) setUnread(0); }}
        style={{
          position: 'absolute',
          top: collapsedTop,
          right: collapsedRight,
          zIndex: 120,
          background: '#2f2f2f',
          color: '#f1e5c6',
          border: '1px solid #555',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer'
        }}
      >
        Chat {unread > 0 ? `(${unread})` : ''}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: collapsedTop + 40,
            right: collapsedRight,
            width: 360,
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(34,34,34,0.95)',
            border: '1px solid #666',
            borderRadius: 12,
            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            color: '#f1e5c6',
            zIndex: 120
          }}
        >
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #555', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Global Chat</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.75 }}>{name}</span>
          </div>

          <div ref={viewRef} style={{ flex: 1, overflowY: 'auto', padding: 10, gap: 8, display: 'flex', flexDirection: 'column' }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.name === name ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sys ? 'transparent' : (m.name === name ? '#4c566a' : '#3b4252'),
                border: m.sys ? '1px dashed #777' : '1px solid #555',
                color: '#f1e5c6',
                padding: m.sys ? '6px 8px' : '8px 10px',
                borderRadius: 10,
                opacity: m.sys ? 0.8 : 1,
              }}>
                {!m.sys && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>{m.name}</div>}
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #555' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={account ? 'Type a message…' : 'Connect wallet to chat'}
              disabled={!account}
              style={{
                flex: 1,
                background: '#232323',
                color: '#f1e5c6',
                border: '1px solid #555',
                borderRadius: 8,
                padding: '8px'
              }}
            />
            <button
              onClick={send}
              disabled={!account || !input.trim()}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: (!account || !input.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
