import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import BrandLogo from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 30;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 25;
  if (/\d/.test(pw)) score += 25;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 20;
  return Math.min(score, 100);
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/account';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(form.password);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Enter a valid email address';
    if (form.password.length < 8) er.password = 'Password must be at least 8 characters';
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
      er.password = 'Include at least one letter and one number';
    if (form.password !== form.password_confirmation)
      er.password_confirmation = 'Passwords do not match';
    setFieldErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(apiError(err));
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Seo title="Create Account" />
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BrandLogo />
        </Box>
        <Typography variant="h4" align="center" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Create your account
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Order online, track deliveries and manage your addresses.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit} noValidate>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                autoFocus
                label="Full Name"
                value={form.name}
                onChange={setField('name')}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address"
                value={form.email}
                onChange={setField('email')}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Phone (optional)"
                placeholder="+251 9…"
                value={form.phone}
                onChange={setField('phone')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={form.password}
                onChange={setField('password')}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || 'Minimum 8 characters with letters and numbers'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="Toggle password visibility">
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {form.password && (
                <LinearProgress
                  variant="determinate"
                  value={strength}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#E7EFF6',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strength < 50 ? 'error.main' : strength < 80 ? 'warning.main' : 'success.main',
                      borderRadius: 3,
                    },
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={form.password_confirmation}
                onChange={setField('password_confirmation')}
                error={Boolean(fieldErrors.password_confirmation)}
                helperText={fieldErrors.password_confirmation}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                size="large"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ py: 1.5, fontSize: 16 }}
              >
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography align="center" color="text.secondary" sx={{ mt: 3.5, fontSize: 14.5 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={700}>
            Sign in
          </Link>
        </Typography>
      </Card>
    </Container>
  );
}
