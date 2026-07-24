import { useState } from 'react';
import { Outlet, NavLink, Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 262;

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <SpaceDashboardRoundedIcon /> },
  { to: '/admin/products', label: 'Products', icon: <Inventory2RoundedIcon /> },
  { to: '/admin/categories', label: 'Categories', icon: <CategoryRoundedIcon /> },
  { to: '/admin/orders', label: 'Orders', icon: <ReceiptLongRoundedIcon /> },
  { to: '/admin/customers', label: 'Customers', icon: <GroupRoundedIcon /> },
  { to: '/admin/messages', label: 'Inquiries', icon: <MarkEmailUnreadRoundedIcon /> },
  { to: '/admin/settings', label: 'Store Settings', icon: <SettingsRoundedIcon /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg,#052440 0%,#063356 100%)',
        color: '#B9CEDF',
      }}
    >
      <Box sx={{ p: 2.6, display: 'flex', alignItems: 'center', gap: 1.4 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg,#1B8FE0,#0891B2)',
            color: '#fff',
          }}
        >
          <WaterDropRoundedIcon />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, color: '#fff', fontSize: 16 }}>
            TEDDY Admin
          </Typography>
          <Typography sx={{ fontSize: 11, letterSpacing: 1.4, color: 'rgba(185,206,223,.6)' }}>
            MANAGEMENT PORTAL
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.08)' }} />

      <List sx={{ px: 1.4, py: 1.6, flex: 1 }}>
        {LINKS.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2.5,
              mb: 0.5,
              color: 'rgba(185,206,223,.85)',
              '& .MuiListItemIcon-root': { color: 'rgba(185,206,223,.6)', minWidth: 42 },
              '&:hover': { bgcolor: 'rgba(255,255,255,.06)' },
              '&.active': {
                bgcolor: 'rgba(34,211,238,.14)',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#22D3EE' },
              },
            }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,.08)' }} />
      <List sx={{ px: 1.4, py: 1.2 }}>
        <ListItemButton
          component={RouterLink}
          to="/"
          sx={{ borderRadius: 2.5, color: 'rgba(185,206,223,.85)', '& .MuiListItemIcon-root': { color: 'rgba(185,206,223,.6)', minWidth: 42 } }}
        >
          <ListItemIcon><StorefrontRoundedIcon /></ListItemIcon>
          <ListItemText primary="View Storefront" primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
        </ListItemButton>
        <ListItemButton
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          sx={{ borderRadius: 2.5, color: '#FCA5A5', '& .MuiListItemIcon-root': { color: '#FCA5A5', minWidth: 42 } }}
        >
          <ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F2F6FA' }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,.9)',
            backdropFilter: 'blur(10px)',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {!isDesktop && (
              <IconButton onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
                <MenuRoundedIcon />
              </IconButton>
            )}
            <Typography sx={{ fontWeight: 700, fontFamily: '"Sora",sans-serif' }}>
              Administration
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={user?.email || ''}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                <Avatar
                  sx={{ width: 36, height: 36, fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg,#1B8FE0,#0891B2)' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 600, fontSize: 14.5, display: { xs: 'none', sm: 'block' } }}>
                  {user?.name}
                </Typography>
              </Box>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
