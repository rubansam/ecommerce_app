import React from 'react';
import { Box, Typography, Button, Avatar, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
// Import the background image (you'll need to place this in your assets folder)
import backgroundImage from '../assets/shoe.jpg';

const LandingPage = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative', // Establishes positioning context for absolute children
        overflow: 'hidden', // Hides any overflow from blur effect if it extends beyond bounds
      }}
    >
      {/* Layer 0: Blurred Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: -20, // Slight overflow to hide blur edges
          left: -10,
          right: -10,
          bottom: -50,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(15px)',
          zIndex: 0,
        }}
      />

      {/* Layer 1: Semi-transparent Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />

      {/* Layer 2: All Content */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white', // Default text color for content
          textAlign: 'center',
          p: 2,
          zIndex: 2,
        }}
      >
        {/* Photo Logo Section */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {/* Placeholder for the square icon, can be replaced with an actual SVG/image */}
          <Box sx={{
            width: 50,
            height: 50,
            bgcolor: '#FF007F',
            borderRadius: 1,
            mr: 1,
            display: 'inline-block',
            verticalAlign: 'middle',
          }} />
          <Typography variant="h2" sx={{ display: 'inline-block', verticalAlign: 'middle', color: 'black', fontWeight: 'bold' }}>
            photo
          </Typography>
        </Box>

        {/* User Credit Section */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'absolute', bottom: '180px', left: '50%', transform: 'translateX(-50%)', color: 'black' }}>
          <Avatar alt="Ruban Antony" src="https://mui.com/static/images/avatar/1.jpg" />
          <Box textAlign="left">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Ruban Antony</Typography>
            <Typography variant="body2">@Ruban_Antony</Typography>
          </Box>
        </Stack>

        {/* Buttons at the bottom */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 2, position: 'absolute', bottom: '40px' }}>
          <Button
            variant="outlined"
            component={Link}
            to="/login"
            sx={{
              color: 'black',
              borderColor: 'black',
              width: '45%',
              maxWidth: '200px',
              py: 1.5,
              borderRadius: '10px',
              fontWeight: 'bold',
            }}
          >
            LOG IN
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/register"
            sx={{
              bgcolor: 'black',
              color: 'white',
              width: '45%',
              maxWidth: '200px',
              py: 1.5,
              borderRadius: '10px',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#333',
              },
            }}
          >
            REGISTER
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage; 