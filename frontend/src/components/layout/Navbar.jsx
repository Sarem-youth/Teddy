import { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';

import BrandLogo from '../BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

const NAV_LINKS = [
  { label: 'Home', to: '/', icon: <HomeRoundedIcon /> },
  { label: 'Shop', to: '/shop', icon: <StorefrontRoundedIcon /> },
  { label: 'Gallery', to: '/gallery', icon: <CollectionsRoundedIcon /> },
  { label: 'About', to: '/about', icon: <InfoRoundedIcon /> },
  { label: 'Contact', to: '/contact', icon: <MailRoundedIcon /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totals } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [search, setSearch] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    const term = search.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    setSearch('');
  };

  const handleLogout = async () => {
    setMenuAnchor(null);
    await logout();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 64, md: 72 } }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
              aria-label="Open menu"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', flexShrink: 0 }}>
              <BrandLogo />
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 3 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end={link.to === '/'}
                  sx={{
                    color: 'text.secondary',
                    px: 1.8,
                    '&.active': { color: 'primary.main', bgcolor: 'rgba(10,92,158,.08)' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box
              component="form"
              onSubmit={submitSearch}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                bgcolor: '#F0F5FA',
                borderRadius: 3,
                px: 1.5,
                py: 0.4,
                width: { sm: 200, md: 260 },
                border: '1px solid transparent',
                transition: 'all .2s',
                '&:focus-within': { borderColor: 'primary.light', bgcolor: '#fff' },
              }}
            >
              <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Search pumps, pipes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ fontSize: 14.5, flex: 1 }}
                inputProps={{ 'aria-label': 'Search products' }}
              />
            </Box>

            <IconButton
              component={RouterLink}
              to="/cart"
              aria-label="Shopping cart"
              sx={{
                bgcolor: 'rgba(10,92,158,.08)',
                '&:hover': { bgcolor: 'rgba(10,92,158,.16)' },
              }}
            >
              <Badge badgeContent={totals.count} color="secondary" max={99}>
                <ShoppingCartRoundedIcon sx={{ color: 'primary.dark' }} />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      fontSize: 15,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg,#1B8FE0,#0891B2)',
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 3 } } }}
                >
                  <Box sx={{ px: 2, py: 1.2 }}>
                    <Typography fontWeight={700} noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {user.is_admin && (
                    <MenuItem onClick={() => { setMenuAnchor(null); navigate('/admin'); }}>
                      <ListItemIcon><SpaceDashboardRoundedIcon fontSize="small" /></ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { setMenuAnchor(null); navigate('/account'); }}>
                    <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
                    My Account
                  </MenuItem>
                  <MenuItem onClick={() => { setMenuAnchor(null); navigate('/account/orders'); }}>
                    <ListItemIcon><ReceiptLongRoundedIcon fontSize="small" /></ListItemIcon>
                    My Orders
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.secondary' }}
                >
                  Sign In
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" disableElevation>
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 290, pt: 2 }} role="presentation">
          <Box sx={{ px: 2.5, pb: 2 }}>
            <BrandLogo />
          </Box>
          <Divider />
          <List sx={{ px: 1 }}>
            {NAV_LINKS.map((link) => (
              <ListItemButton
                key={link.to}
                component={NavLink}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setDrawerOpen(false)}
                sx={{ borderRadius: 2.5, my: 0.3, '&.active': { bgcolor: 'rgba(10,92,158,.1)', color: 'primary.main' } }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1 }} />
            {user ? (
              <>
                <ListItemButton
                  onClick={() => { setDrawerOpen(false); navigate('/account'); }}
                  sx={{ borderRadius: 2.5, my: 0.3 }}
                >
                  <ListItemAvatar sx={{ minWidth: 42 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 14 }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="My Account" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
                {user.is_admin && (
                  <ListItemButton
                    onClick={() => { setDrawerOpen(false); navigate('/admin'); }}
                    sx={{ borderRadius: 2.5, my: 0.3 }}
                  >
                    <ListItemIcon sx={{ minWidth: 42 }}><SpaceDashboardRoundedIcon /></ListItemIcon>
                    <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItemButton>
                )}
              </>
            ) : (
              <>
                <ListItemButton
                  onClick={() => { setDrawerOpen(false); navigate('/login'); }}
                  sx={{ borderRadius: 2.5, my: 0.3 }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}><PersonRoundedIcon /></ListItemIcon>
                  <ListItemText primary="Sign In" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => { setDrawerOpen(false); navigate('/register'); }}
                  sx={{ borderRadius: 2.5, my: 0.3 }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}><PersonRoundedIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Create Account" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
