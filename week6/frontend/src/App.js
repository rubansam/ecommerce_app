import React, { useState ,useCallback,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/User/Profile';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import { getUserFromToken, removeToken } from './utils/auth';
import { AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Box, Button } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FeedIcon from '@mui/icons-material/DynamicFeed';
import SearchIcon from '@mui/icons-material/Search';
import Feed from './components/Feed/Feed';
import PostDialog from './components/Feed/PostDialog';
import Search from './components/Search/Search';
import ChatList from './components/Chat/ChatList';
import Tooltip from '@mui/material/Tooltip';
import axios from './api/axios';
import { io } from 'socket.io-client';
import Badge from '@mui/material/Badge';
import { useSelector,useDispatch } from 'react-redux';
import { resetUnread } from './slices/chatSlice';
  ;


function AppContent() {
  const [user, setUser] = useState(getUserFromToken());
  const [anchorEl, setAnchorEl] = useState(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const socket = io('http://localhost:4000')
  const unreadCounts = useSelector(state => state.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const dispatch = useDispatch();
  const handleLogin = () => {setUser(getUserFromToken()); navigate('/dashboard');};
  const handleLogout = () => {
    removeToken();
    setUser(null);
    setAnchorEl(null);
    navigate('/login');
  };
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const [posts, setPosts] = useState(null);

  // Function to fetch posts
  const fetchPosts = useCallback(() => {
    axios.get('/posts')
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));
  }, []);

  // Fetch posts when the app loads or user logs in
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (user) {
      socket.emit('join', user.id);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{
          position: 'absolute',
          top: 24,
          right: 32,
          zIndex: 10
        }}>
          {showRegister ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowRegister(false)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                px: 3,
                py: 1,
                fontSize: '1rem'
              }}
            >
              Back to Login
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowRegister(true)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                px: 3,
                py: 1,
                fontSize: '1rem'
              }}
            >
              Register
            </Button>
          )}
        </div>
        <div>
          {showRegister ? (
            <Register onRegister={() => setShowRegister(false)} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
            <Tooltip title="Dashboard" arrow>
              <IconButton color="primary" onClick={() => navigate('/dashboard')}>
                <DashboardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Feed" arrow>
              <IconButton color="primary" onClick={() => { fetchPosts(); navigate('/feed'); }}>
                <FeedIcon/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Create Post" arrow>
              <IconButton color="primary" onClick={() => setPostDialogOpen(true)}>
                <AddBoxIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Search" arrow>
              <IconButton color="primary" onClick={() => navigate('/search')}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chats" arrow>
            <Badge badgeContent={totalUnread} color="error" onClick={() => dispatch(resetUnread(user._id))}>
              <IconButton color="primary" onClick={() => navigate('/chats')}>
                <ChatIcon />
              </IconButton>
              </Badge>
            </Tooltip>
          </Box>
          <IconButton onClick={handleAvatarClick} size="large">
            <Avatar src={user.avatar} alt={user.username || user.email} sx={{ bgcolor: '#1976d2' }}>
              {(user?.username && user.username[0])
                ? user.username[0].toUpperCase()
                : (user?.email && user.email[0])
                  ? user.email[0].toUpperCase()
                  : "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed posts={posts}/>} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <PostDialog open={postDialogOpen} onClose={() => setPostDialogOpen(false)} onPost={() =>{ fetchPosts(); navigate('/feed')}} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;