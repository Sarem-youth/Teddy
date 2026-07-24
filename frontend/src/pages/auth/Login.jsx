import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import BrandLogo from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.is_admin && redirectTo === '/account' ? '/admin' : redirectTo, { replace: true });
    } catch (err) {
      setError(apiError(err, 'Invalid email or password.'));
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 9 } }}>
      <Seo title="Sign In" />
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BrandLogo />
        </Box>
        <Typography variant="h4" align="center" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Welcome back
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Sign in to track orders and check out faster.
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
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            sx={{ mb: 2.5 }}
          />
          <TextField
            fullWidth
            required
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="Toggle password visibility">
                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Link component={RouterLink} to="/forgot-password" fontSize={14} fontWeight={600}>
              Forgot password?
            </Link>
          </Box>
          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ py: 1.5, fontSize: 16 }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>

        <Typography align="center" color="text.secondary" sx={{ mt: 3.5, fontSize: 14.5 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" fontWeight={700}>
            Create one free
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}
