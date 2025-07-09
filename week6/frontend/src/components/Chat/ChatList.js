import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Button, IconButton, Tooltip, Paper } from '@mui/material';
import ChatWindow from './ChatWindow';
import Badge from '@mui/material/Badge';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import { getUserFromToken } from '../../utils/auth';
import {socket} from '../../utils/socket';

const user = getUserFromToken();

export default function ChatList({ onMessage }) {
  const [chats, setChats] = useState([]);
  const [chatFriend, setChatFriend] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [openChatUserId, setOpenChatUserId] = useState(null);
  const [unreadChats, setUnreadChats] = useState({});
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('user/chat/list')
      .then(res => setChats(res.data))
      .catch(() => setChats([]));
  }, []);

  useEffect(() => {
    socket.on('chat_notification', ({ from }) => {
        console.log("chart_notification");
      setUnreadChats(prev => ({ ...prev, [from]: true }));
    });
    return () => {
      socket.off('chat_notification');
    };
  }, []);

  useEffect(() => {
    const handler = (msg) => {
      console.log("ChatList receive_message:", msg);
      if (!openChatUserId || openChatUserId !== msg.from) {
        console.log("inside consition");
        
        setUnreadCounts(prev => ({
          ...prev,
          [msg.from]: (prev[msg.from] || 0) + 1
        }));
      }
    };
    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  }, [openChatUserId,messages]);

  useEffect(() => {
    const handler = (msg) => {
        console.log("ChatList receive_message:", msg);
        if (!openChatUserId || openChatUserId !== msg.from) {
          console.log("inside consition");
          
          setUnreadCounts(prev => ({
            ...prev,
            [msg.from]: (prev[msg.from] || 0) + 1
          }));
        }
      };
    
    socket.on('receive_message', handler);
    return () => {
      socket.off('receive_message', handler);
    };
  }, [user.id]);

  useEffect(() => {
    if (chatFriend && unreadChats[chatFriend._id]) {
      setUnreadChats(prev => ({ ...prev, [chatFriend._id]: false }));
    }
  }, [chatFriend, unreadChats, setUnreadChats]);

  if (!chats) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  const handleOpenChat = (user) => {
    setOpenChatUserId(user._id);
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
    setChatFriend(user);
  };

  console.log("un:",unreadCounts,user);
  
  

  return (
    <List>
      {chats.map(user => (
        <Paper
          key={user._id}
          elevation={3}
          sx={{
            mb: 2,
            borderRadius: 2,
            opacity: unreadCounts[user._id] ? 1 : 0.7,
            transition: 'opacity 0.3s',
            background: '#fff',
            p: 1
          }}
        >
          <ListItem
            disableGutters
            secondaryAction={
              <Button variant="contained" onClick={() => handleOpenChat(user)}>
                Message
              </Button>
            }
          >
            <ListItemAvatar>
              <Badge
                badgeContent={unreadCounts[user._id] || 0}
                color="error"
                overlap="circular"
                invisible={!unreadCounts[user._id]}
              >
                <Avatar src={user.avatar}>
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText primary={user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ''} secondary={user.email} />
          </ListItem>
        </Paper>
      ))}
      {chatFriend && <ChatWindow friend={chatFriend} user={user} messages={messages} setMessages={setMessages} onClose={() => setChatFriend(null)} />}
    </List>
  );
}