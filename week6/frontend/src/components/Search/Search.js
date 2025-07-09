import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
  Box, TextField, Button, List, ListItem, ListItemText, Typography,
  Avatar, ListItemAvatar, CircularProgress, Paper, Stack, Dialog, DialogTitle, DialogContent, Snackbar, Alert
} from '@mui/material';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch incoming follow requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/user/requests');
      setRequests(res.data);
    } catch {
      setRequests([]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/user/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const sendFollowRequest = async (userId) => {
    try {
      await axios.post(`/user/${userId}/follow`);
      setSnackbar({ open: true, message: 'Follow request sent!', severity: 'success' });
      handleSearch();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error sending request', severity: 'error' });
    }
  };

  const acceptRequest = async (userId) => {
    try {
      await axios.post(`/user/${userId}/accept`);
      setSnackbar({ open: true, message: 'Follow request accepted!', severity: 'success' });
      fetchRequests();
      handleSearch();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error accepting request', severity: 'error' });
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await axios.post(`/user/${userId}/reject`);
      setSnackbar({ open: true, message: 'Follow request rejected!', severity: 'info' });
      fetchRequests();
      handleSearch();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error rejecting request', severity: 'error' });
    }
  };

  const openProfile = (user) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setSelectedUser(null);
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Search Users</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search users"
            value={query}
            onChange={e => setQuery(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch}>Search</Button>
        </Stack>
        {loading && <CircularProgress size={24} sx={{ mt: 1 }} />}
      </Paper>

      {/* Incoming Follow Requests */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Incoming Follow Requests</Typography>
        {requests.length === 0 && <Typography color="text.secondary">No requests</Typography>}
        <List>
          {requests.map(user => (
            <ListItem key={user._id} secondaryAction={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => acceptRequest(user._id)}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => rejectRequest(user._id)}
                >
                  Reject
                </Button>
              </Stack>
            }>
              <ListItemAvatar>
                <Avatar
                  src={user.avatar}
                  onClick={() => openProfile(user)}
                  sx={{ cursor: 'pointer' }}
                >
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span style={{ cursor: 'pointer' }} onClick={() => openProfile(user)}>
                    {user.username}
                  </span>
                }
                secondary={user.email}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Search Results */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Results</Typography>
        <List>
          {results.map(user => (
            <ListItem key={user._id} secondaryAction={
              user.followStatus === 'following' ? (
                <Button disabled color="success" variant="outlined">Following</Button>
              ) : user.followStatus === 'requested' ? (
                <Button disabled color="warning" variant="outlined">Requested</Button>
              ) : (
                <Button variant="contained" onClick={() => sendFollowRequest(user._id)}>Follow</Button>
              )
            }>
              <ListItemAvatar>
                <Avatar
                  src={user.avatar}
                  onClick={() => openProfile(user)}
                  sx={{ cursor: 'pointer' }}
                >
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span style={{ cursor: 'pointer' }} onClick={() => openProfile(user)}>
                    {user.username}
                  </span>
                }
                secondary={user.email}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* User Profile Dialog */}
      <Dialog open={profileOpen} onClose={closeProfile}>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Avatar
                src={selectedUser.avatar}
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
              >
                {selectedUser.username ? selectedUser.username[0].toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h6">{selectedUser.username}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
              {/* Add more profile info here if available */}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}