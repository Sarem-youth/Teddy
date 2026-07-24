import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import BrandLogo from '../../components/BrandLogo';
import { useSnackbar } from '../../context/SnackbarContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState({
    email: emailParam,
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { ...form, token });
      notify('Password reset! Please sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(apiError(err));
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 9 }}>
        <Seo title="Reset Password" />
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5">Invalid reset link</Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            This password reset link is invalid or incomplete. Please request a new one.
          </Typography>
          <Button component={RouterLink} to="/forgot-password" variant="contained" sx={{ mt: 3 }}>
            Request New Link
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 9 } }}>
      <Seo title="Reset Password" />
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BrandLogo />
        </Box>
        <Typography variant="h4" align="center" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Set a new password
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Choose a strong password with letters and numbers.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit} noValidate>
          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            sx={{ mb: 2.5 }}
          />
          <TextField
            fullWidth
            required
            type="password"
            label="New Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            helperText="Minimum 8 characters with letters and numbers"
            sx={{ mb: 2.5 }}
          />
          <TextField
            fullWidth
            required
            type="password"
            label="Confirm New Password"
            value={form.password_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ py: 1.5, fontSize: 16 }}
          >
            {submitting ? 'Resetting…' : 'Reset Password'}
          </Button>
        </Box>

        <Typography align="center" sx={{ mt: 3.5, fontSize: 14.5 }}>
          <Link component={RouterLink} to="/login" fontWeight={700}>
            Back to Sign In
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}
