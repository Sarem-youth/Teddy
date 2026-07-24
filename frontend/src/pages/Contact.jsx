import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

import api, { apiError } from '../api/client';
import Seo from '../components/Seo';
import { useSettings } from '../context/SettingsContext';
import { useSnackbar } from '../context/SnackbarContext';

export default function Contact() {
  const { settings } = useSettings();
  const { notify } = useSnackbar();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Your name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Enter a valid email address';
    if (!form.subject.trim()) er.subject = 'Subject is required';
    if (form.message.trim().length < 10) er.message = 'Message should be at least 10 characters';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSent(true);
      notify('Message sent — we will reply shortly!');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const INFO = [
    { icon: <PlaceRoundedIcon />, title: 'Visit Us', text: settings.store_address || 'Addis Ababa, Ethiopia' },
    { icon: <CallRoundedIcon />, title: 'Call Us', text: [settings.store_phone, settings.store_phone_alt].filter(Boolean).join(' · ') || '+251 —' },
    { icon: <EmailRoundedIcon />, title: 'Email Us', text: settings.store_email || 'info@teddytrading.com' },
    { icon: <AccessTimeRoundedIcon />, title: 'Working Hours', text: 'Mon – Sat: 8:00 AM – 6:00 PM' },
  ];

  return (
    <Box>
      <Seo
        title="Contact Us"
        description="Get in touch with Teddy General Trading for quotations, technical advice and product availability."
      />

      <Box sx={{ background: 'linear-gradient(120deg,#052440,#0A5C9E)', color: '#fff', py: { xs: 4.5, md: 6 } }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 36 } }}>
            Contact Us
          </Typography>
          <Typography sx={{ mt: 1, color: 'rgba(222,238,250,.8)', maxWidth: 640 }}>
            Questions about a product, need a bulk quotation, or want sizing advice? Our team
            responds within one business day.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5} lg={4}>
            <Stack spacing={2.4}>
              {INFO.map((item) => (
                <Card key={item.title} sx={{ p: 2.6, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '18px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg,#0A5C9E,#0891B2)',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography fontWeight={700}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Card sx={{ p: { xs: 2.5, md: 4 } }}>
              {sent ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 84,
                      height: 84,
                      mx: 'auto',
                      mb: 2.5,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg,#0E9F6E,#34D399)',
                    }}
                  >
                    <SendRoundedIcon sx={{ fontSize: 38, color: '#fff' }} />
                  </Box>
                  <Typography variant="h5">Message sent successfully!</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.4 }}>
                    Thank you for reaching out. Our team will get back to you within one business day.
                  </Typography>
                  <Button sx={{ mt: 3 }} variant="outlined" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={submit} noValidate>
                  <Typography variant="h5" sx={{ mb: 3 }}>
                    Send us a message
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                      {error}
                    </Alert>
                  )}
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        value={form.name}
                        onChange={setField('name')}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        type="email"
                        label="Email Address"
                        value={form.email}
                        onChange={setField('email')}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Subject"
                        value={form.subject}
                        onChange={setField('subject')}
                        error={Boolean(errors.subject)}
                        helperText={errors.subject}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={5}
                        label="Your Message"
                        value={form.message}
                        onChange={setField('message')}
                        error={Boolean(errors.message)}
                        helperText={errors.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        size="large"
                        variant="contained"
                        disabled={submitting}
                        endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
                        sx={{ px: 5, py: 1.4 }}
                      >
                        {submitting ? 'Sending…' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
