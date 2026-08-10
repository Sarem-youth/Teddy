import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
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
import PermMediaRoundedIcon from '@mui/icons-material/PermMediaRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

import { useAuth } from '../../context/AuthContext';
import NavigationBackButton from '../../components/NavigationBackButton';
import { openAppUrl } from '../../utils/appNavigation';

const DRAWER_WIDTH = 262;

const LINKS = [
  { to: '/admin/dashboard', label: 'Overview / Analytics', icon: <SpaceDashboardRoundedIcon /> },
  { to: '/admin/products', label: 'Product Management', icon: <Inventory2RoundedIcon /> },
  { to: '/admin/categories', label: 'Categories', icon: <CategoryRoundedIcon /> },
  { to: '/admin/orders', label: 'Orders', icon: <ReceiptLongRoundedIcon /> },
  { to: '/admin/media', label: 'Gallery Manager', icon: <PermMediaRoundedIcon /> },
  { to: '/admin/construction', label: 'Construction Ops', icon: <ConstructionRoundedIcon /> },
  { to: '/admin/customers', label: 'Customers', icon: <GroupRoundedIcon /> },
  { to: '/admin/messages', label: 'Inquiries', icon: <MarkEmailUnreadRoundedIcon /> },
  { to: '/admin/settings', label: 'System & Store Settings', icon: <SettingsRoundedIcon /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg,#111827 0%,#1F2937 100%)',
        color: '#CBD5E1',
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
            background: 'linear-gradient(135deg,#334155,#64748B)',
            color: '#fff',
          }}
        >
          <WaterDropRoundedIcon />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, color: '#fff', fontSize: 16 }}>
            TEDDY Admin
          </Typography>
          <Typography sx={{ fontSize: 11, letterSpacing: 1.4, color: 'rgba(203,213,225,.62)' }}>
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
              color: 'rgba(203,213,225,.86)',
              '& .MuiListItemIcon-root': { color: 'rgba(203,213,225,.62)', minWidth: 42 },
              '&:hover': { bgcolor: 'rgba(255,255,255,.06)' },
              '&.active': {
                bgcolor: 'rgba(148,163,184,.2)',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#CBD5E1' },
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
          onClick={() => openAppUrl('/', 'public')}
          sx={{ borderRadius: 2.5, color: 'rgba(203,213,225,.86)', '& .MuiListItemIcon-root': { color: 'rgba(203,213,225,.62)', minWidth: 42 } }}
        >
          <ListItemIcon><StorefrontRoundedIcon /></ListItemIcon>
          <ListItemText primary="View Storefront" primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
        </ListItemButton>
        <ListItemButton
          onClick={async () => {
            await logout();
            openAppUrl('/login', 'admin');
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
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
          <Toolbar sx={{ gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
            {!isDesktop && (
              <IconButton onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
                <MenuRoundedIcon />
              </IconButton>
            )}
            <NavigationBackButton
              hideOn={['/admin', '/admin/dashboard']}
              fallbackTo="/admin/dashboard"
              sx={{ py: 0.9, justifyContent: 'flex-start' }}
            />
            <Typography sx={{ fontWeight: 700, fontFamily: '"Sora",sans-serif', fontSize: { xs: 15, sm: 16 } }}>
              Administration
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={user?.email || ''}>
              <Box
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.4, cursor: 'pointer', flexShrink: 0 }}
                aria-label="Admin profile menu"
              >
                <Avatar
                  sx={{ width: 36, height: 36, fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg,#334155,#64748B)' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 600, fontSize: 14.5, display: { xs: 'none', sm: 'block' } }}>
                  {user?.name}
                </Typography>
              </Box>
            </Tooltip>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 230, borderRadius: 3 } } }}
            >
              <Box sx={{ px: 2, py: 1.2 }}>
                <Typography fontWeight={700} noWrap>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setProfileAnchor(null); openAppUrl('/account', 'public'); }}>
                <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
                My Account
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); openAppUrl('/account/profile#security', 'public'); }}>
                <ListItemIcon><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
                Change Password
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/admin/dashboard'); }}>
                <ListItemIcon><SpaceDashboardRoundedIcon fontSize="small" /></ListItemIcon>
                Back to Dashboard
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/admin/settings'); }}>
                <ListItemIcon><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
                Store Settings
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); openAppUrl('/', 'public'); }}>
                <ListItemIcon><StorefrontRoundedIcon fontSize="small" /></ListItemIcon>
                View Storefront
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={async () => {
                  setProfileAnchor(null);
                  await logout();
                  openAppUrl('/login', 'admin');
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 1.5, sm: 2.5, md: 3.5 }, flex: 1, overflowX: 'clip' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
