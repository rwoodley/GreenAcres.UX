import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWindow = ({ messages, onSend, loading, onQueryIdClick, selectedQueryId, shouldScrollToBottom, onScrollComplete, sessionId }) => {
  const [inputValue, setInputValue] = useState('');
  const [lastUserMessageIndex, setLastUserMessageIndex] = useState(-1);
  const topRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  // Scroll to bottom when NEW messages are added
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // New message was added, scroll to bottom
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Scroll to bottom when explicitly requested (e.g., when assistant response is updated)
  useEffect(() => {
    if (shouldScrollToBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      onScrollComplete && onScrollComplete();
    }
  }, [shouldScrollToBottom, onScrollComplete]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {sessionId && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              p: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#666'
            }}
          >
            Chat Session ID: {sessionId}
          </Typography>
        )}
        {messages.map((msg, idx) => (
          <Paper
            key={idx}
            data-message-idx={idx}
            elevation={1}
            sx={{
              p: 2,
              maxWidth: msg.sender === 'user' ? '80%' : '100%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              {msg.sender === 'user' ? 'You' : 'Assistant'}
            </Typography>
            {msg.sender === 'agent' ? (
              <>
                <Box sx={{
                  '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginTop: 1,
                    marginBottom: 1,
                    fontSize: '0.75rem'
                  },
                  '& th, & td': {
                    border: '1px solid #ddd',
                    padding: '4px 6px',
                    textAlign: 'left'
                  },
                  '& th': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  },
                  '& td': {
                    fontSize: '0.75rem'
                  },
                  '& tr:hover': {
                    backgroundColor: '#f9f9f9'
                  }
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </Box>
                {msg.queryId && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      fontStyle: 'italic',
                      fontSize: '0.8rem',
                      color: selectedQueryId === msg.queryId ? '#1976d2' : '#000',
                      backgroundColor: selectedQueryId === msg.queryId ? '#e3f2fd' : '#f9f9f9',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2'
                      }
                    }}
                    onClick={() => onQueryIdClick && onQueryIdClick(msg.queryId)}
                  >
                    Query ID: {msg.queryId}
                  </Typography>
                )}
              </>
            ) : (
              <Typography component="div" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {msg.text}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      <Box sx={{
        p: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        flexShrink: 0,
        minHeight: 80
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type your message..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={loading}
            multiline
            maxRows={4}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !inputValue.trim()}
            sx={{ minWidth: 80 }}
          >
            Send
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ChatWindow;
