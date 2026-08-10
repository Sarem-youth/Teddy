import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { useAuth } from '../../context/AuthContext';
import NavigationBackButton from '../../components/NavigationBackButton';

const LINKS = [
  { to: '/account', label: 'Overview', icon: <SpaceDashboardRoundedIcon />, end: true },
  { to: '/account/orders', label: 'My Orders', icon: <ReceiptLongRoundedIcon /> },
  { to: '/account/addresses', label: 'Addresses', icon: <PlaceRoundedIcon /> },
  { to: '/account/profile', label: 'Profile & Security', icon: <ManageAccountsRoundedIcon /> },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, overflowX: 'clip' }}>
      <NavigationBackButton
        hideOn={['/account']}
        fallbackTo="/account"
        sticky
        sx={{ mb: 2, py: 0.9, justifyContent: 'flex-start' }}
      />
      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        <Grid item xs={12} md={3.5} lg={3}>
          <Card sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg,#111827,#334155)',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  fontSize: 22,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg,#334155,#64748B)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#fff', fontWeight: 700 }} noWrap>
                  {user?.name}
                </Typography>
                <Typography sx={{ color: 'rgba(222,238,250,.7)', fontSize: 13 }} noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <List sx={{ p: 1.2 }}>
              {LINKS.map((link) => (
                <ListItemButton
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.4,
                    '&.active': { bgcolor: 'rgba(51,65,85,.1)', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
                </ListItemButton>
              ))}
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                sx={{ borderRadius: 2.5, color: 'error.main' }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <LogoutRoundedIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
              </ListItemButton>
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={8.5} lg={9}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
}
