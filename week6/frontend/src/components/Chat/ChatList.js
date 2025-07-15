import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, Button, Paper, Badge, Tooltip } from '@mui/material';
import ChatWindow from './ChatWindow';
import { getUserFromToken } from '../../utils/auth';
import { connectSocket } from '../../utils/socket';
import { useSelector, useDispatch } from 'react-redux';
import { setUnreadCounts, incrementUnread, resetUnread } from '../../slices/chatSlice';

const user = getUserFromToken();

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [chatFriend, setChatFriend] = useState(null);
  const [openChatUserId, setOpenChatUserId] = useState(null);
  const [messages, setMessages] = useState({}); // { [userId]: [msg, ...] }
  const [onlineUsers, setOnlineUsers] = useState([]);
  const unreadCounts = useSelector(state => state.chat.unreadCounts);
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get('user/chat/list')
      .then(res => setChats(res.data.users || res.data))
      .catch(() => setChats([]));
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    if (!user?.id) return;
    socket.connect();
    socket.emit('join', user.id);
    socket.emit('get_online_users');

    socket.on('online_users', (userIds) => setOnlineUsers(userIds));
    socket.on('user_online', (id) => setOnlineUsers(prev => [...new Set([...prev, id])]));
    socket.on('user_offline', (id) => setOnlineUsers(prev => prev.filter(uid => uid !== id)));

    socket.on('chat_notification', ({ from }) => {
      // Optionally use for sound/toast, but do NOT update unreadCounts here
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        const chatId = msg.from === user.id ? msg.to : msg.from;
        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), msg]
        };
      });
      // Only increment unread if the message is TO me and NOT FROM me
      if (
        msg.to === user.id &&
        msg.from !== user.id &&
        (!openChatUserId || openChatUserId !== msg.from)
      ) {
        dispatch(incrementUnread(msg.from));
      }
    });

    socket.on('unread_messages', (msgs) => {
      // Group messages by chat partner
      const grouped = {};
      const counts = {};
      msgs.forEach(m => {
        const chatId = m.from === user.id ? m.to : m.from;
        if (!grouped[chatId]) grouped[chatId] = [];
        grouped[chatId].push(m);
        if (m.to === user.id && m.from !== user.id) {
          counts[m.from] = (counts[m.from] || 0) + 1;
        }
      });
      setMessages(prev => {
        const merged = { ...prev };
        Object.keys(grouped).forEach(chatId => {
          merged[chatId] = [...(merged[chatId] || []), ...grouped[chatId]];
        });
        return merged;
      });
      dispatch(setUnreadCounts(counts));
    });

    return () => {
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('chat_notification');
      socket.off('receive_message');
      socket.off('unread_messages');
      socket.disconnect();
    };
  }, [user?.id, openChatUserId, dispatch]);

  const handleOpenChat = (user) => {
    setOpenChatUserId(user._id);
    dispatch(resetUnread(user._id));
    setChatFriend(user);
  };

  const isOnline = (id) => onlineUsers.includes(id);

  if (!chats) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Chat</Typography>
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
              p: 1,
              display: 'flex',
              alignItems: 'center',
              boxShadow: isOnline(user._id) ? '0 0 0 2px #4caf50' : undefined
            }}
          >
            <ListItem disableGutters sx={{ width: '100%' }}>
              <ListItemAvatar>
                <Badge
                  badgeContent={unreadCounts[user._id] || 0}
                  color="error"
                  overlap="circular"
                  invisible={!unreadCounts[user._id]}
                  sx={{ mr: 1 }}
                >
                  <Avatar src={user.avatar} sx={{ border: isOnline(user._id) ? '2px solid #4caf50' : '2px solid #bdbdbd' }}>
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={<span style={{ fontWeight: 500 }}>{user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ''}</span>}
                secondary={<span style={{ color: isOnline(user._id) ? '#4caf50' : '#bdbdbd' }}>{isOnline(user._id) ? 'Online' : 'Offline'}</span>}
              />
              <Tooltip title="Open chat">
                <Button variant="contained" onClick={() => handleOpenChat(user)} sx={{ ml: 2 }}>
                  Message
                </Button>
              </Tooltip>
            </ListItem>
          </Paper>
        ))}
      </List>
      {chatFriend && (
        <ChatWindow
          friend={chatFriend}
          user={user}
          messages={messages[chatFriend._id] || []}
          setMessages={setMessages}
          onClose={() => {
            setChatFriend(null);
            setOpenChatUserId(null);
          }}
        />
      )}
    </Box>
  );
}