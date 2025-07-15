import { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {socket} from '../../utils/socket'
export default function ChatWindow({ friend, user, onClose, setMessages,messages }) {
 
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (user && user.id) {
      socket.emit('join', user.id);
    }
  }, [user]);

  // Mark messages as read when chat window opens
  useEffect(() => {
    if (friend && user && friend._id && user.id) {
      socket.emit('mark_as_read', { from: friend._id, to: user.id });
    }
  }, [friend, user]);

 

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { to: friend._id, from: user.id, message: input };   
    socket.emit('send_message', msg);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Paper sx={{
      position: 'fixed', bottom: 24, right: 24, width: 320, zIndex: 1300, p: 2, boxShadow: 6
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>{friend.username}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{
            textAlign: msg.from === user.id ? 'right' : 'left',
            mb: 0.5
          }}>
            <Typography
              sx={{
                display: 'inline-block',
                bgcolor: msg.from === user.id ? '#1976d2' : '#e0e0e0',
                color: msg.from === user.id ? '#fff' : '#000',
                px: 1.5, py: 0.5, borderRadius: 2, maxWidth: '80%'
              }}
            >
              {msg.message}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Box>
    </Paper>
  );
}