import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { notify } = useSnackbar();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      setUser(data.user);
      notify('Profile updated');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/auth/password', passwords);
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
      notify('Password changed successfully');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box>
      <Seo title="Profile & Security" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        Profile &amp; Security
      </Typography>

      <Grid container spacing={3.5}>
        <Grid item xs={12} md={6}>
          <Card component="form" onSubmit={saveProfile} sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Personal Information
            </Typography>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              required
              type="email"
              label="Email Address"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone || ''}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={savingProfile}
              startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card component="form" onSubmit={savePassword} sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Change Password
            </Typography>
            <TextField
              fullWidth
              required
              type="password"
              label="Current Password"
              value={passwords.current_password}
              onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              required
              type="password"
              label="New Password"
              helperText="Minimum 8 characters with letters and numbers"
              value={passwords.password}
              onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              required
              type="password"
              label="Confirm New Password"
              value={passwords.password_confirmation}
              onChange={(e) => setPasswords((p) => ({ ...p, password_confirmation: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={savingPassword}
              startIcon={savingPassword ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {savingPassword ? 'Updating…' : 'Update Password'}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
