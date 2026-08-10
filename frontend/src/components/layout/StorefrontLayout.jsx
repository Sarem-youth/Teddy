import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './Navbar';
import Footer from './Footer';
import NavigationBackButton from '../NavigationBackButton';

export default function StorefrontLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, overflowX: 'clip' }}>
        <Container maxWidth="xl" sx={{ pt: { xs: 1.25, md: 1.75 }, pb: 0 }}>
          <NavigationBackButton
            hideOn={['/']}
            fallbackTo="/"
            sticky
            sx={{ py: 0.9, justifyContent: 'flex-start' }}
          />
        </Container>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
