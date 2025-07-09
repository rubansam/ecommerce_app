// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/user/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Followers</Typography>
            <Typography variant="h4">{stats?.followersCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Follow Requests</Typography>
            <Typography variant="h4">{stats?.followRequestsCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Images Uploaded</Typography>
            <Typography variant="h4">{stats?.totalImages || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Videos Uploaded</Typography>
            <Typography variant="h4">{stats?.totalVideos || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Posts Uploaded Today
        </Typography>
        <Typography variant="h3" color="primary">{stats?.postsToday || 0}</Typography>
      </Box>
      {/* Example: Add a bar chart for daily uploads (if you add this data to your backend) */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={Array.isArray(stats?.dailyUploads) ? stats.dailyUploads : []}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}