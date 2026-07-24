import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import BrandLogo from '../../components/BrandLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 9 } }}>
      <Seo title="Forgot Password" />
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BrandLogo />
        </Box>

        {sent ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2.5,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg,#0E9F6E,#34D399)',
              }}
            >
              <MarkEmailReadRoundedIcon sx={{ fontSize: 38, color: '#fff' }} />
            </Box>
            <Typography variant="h5">Check your inbox</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.4, lineHeight: 1.8 }}>
              If an account exists for <b>{email}</b>, we've sent a secure password reset link.
              The link expires in 60 minutes.
            </Typography>
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ mt: 3 }}>
              Back to Sign In
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h4" align="center" sx={{ fontSize: { xs: 24, md: 30 } }}>
              Forgot your password?
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              Enter your email and we'll send you a secure reset link.
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
                autoFocus
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                fullWidth
                type="submit"
                size="large"
                variant="contained"
                disabled={submitting || !email}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ py: 1.5, fontSize: 16 }}
              >
                {submitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </Box>

            <Typography align="center" sx={{ mt: 3.5, fontSize: 14.5 }}>
              <Link component={RouterLink} to="/login" fontWeight={700}>
                Back to Sign In
              </Link>
            </Typography>
          </>
        )}
      </Card>
    </Container>
  );
}
