import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import { useSnackbar } from '../../context/SnackbarContext';
import { useSettings } from '../../context/SettingsContext';

const SECTIONS = [
  {
    title: 'Store Identity',
    fields: [
      { key: 'store_name', label: 'Store Name' },
      { key: 'store_tagline', label: 'Tagline', multiline: true },
      { key: 'banner_announcement', label: 'Banner Announcement', multiline: true },
      { key: 'about_text', label: 'About Us Text', multiline: true, rows: 4 },
    ],
  },
  {
    title: 'Storefront Defaults',
    fields: [
      { key: 'currency', label: 'Default Currency (e.g., ETB)' },
      { key: 'theme_accent', label: 'Theme Accent Color (hex)' },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { key: 'store_email', label: 'Contact Email', helper: 'Contact form inquiries are emailed here (REQ-3.5.2)' },
      { key: 'store_phone', label: 'Primary Phone' },
      { key: 'store_phone_alt', label: 'Secondary Phone' },
      { key: 'store_address', label: 'Physical Address', multiline: true },
      { key: 'facebook_url', label: 'Facebook URL' },
      { key: 'telegram_url', label: 'Telegram URL' },
      { key: 'whatsapp_number', label: 'WhatsApp Number' },
    ],
  },
  {
    title: 'Pricing & Delivery',
    fields: [
      { key: 'tax_rate', label: 'VAT Rate', adornment: '%', type: 'number' },
      { key: 'shipping_fee', label: 'Flat Shipping Fee', adornment: 'ETB', type: 'number' },
      { key: 'free_shipping_threshold', label: 'Free Shipping Above', adornment: 'ETB', type: 'number', helper: 'Set 0 to disable free shipping' },
    ],
  },
  {
    title: 'Payment Instructions (shown at checkout)',
    fields: [
      { key: 'bank_name', label: 'Bank Name' },
      { key: 'bank_account_name', label: 'Account Holder Name' },
      { key: 'bank_account_number', label: 'Account Number' },
      { key: 'telebirr_number', label: 'Telebirr Number' },
    ],
  },
];

const SECTION_LINKS = {
  'Store Identity': { to: '/', label: 'Open Homepage' },
  'Storefront Defaults': { to: '/shop', label: 'Preview Shop' },
  'Contact Information': { to: '/contact', label: 'Open Contact Page' },
  'Pricing & Delivery': { to: '/shop', label: 'Open Catalog' },
  'Payment Instructions (shown at checkout)': { to: '/admin/orders', label: 'Review Orders' },
};

export default function Settings() {
  const { notify } = useSnackbar();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .get('/admin/settings')
      .then(({ data }) => setSettings(data.settings || {}))
      .catch(() => setSettings({}));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', { settings });
      setSettings(data.settings || {});
      await refreshSettings().catch(() => {});
      notify('Settings saved');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <Skeleton variant="rounded" height={480} sx={{ borderRadius: 4 }} />;
  }

  return (
    <Box>
      <Seo title="Store Settings" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
            Store Settings
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.6, fontSize: 14 }}>
            Changes are persisted immediately and the public settings API is refreshed after save.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button variant="text" onClick={load} disabled={saving}>
            Reload
          </Button>
          <Button component={RouterLink} to="/" variant="outlined">
            Open Storefront
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={save}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ px: 4 }}
          >
            {saving ? 'Saving…' : 'Save All Settings'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {SECTIONS.map((section) => (
          <Grid item xs={12} md={6} key={section.title}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                <Typography variant="h6">
                  {section.title}
                </Typography>
                {SECTION_LINKS[section.title] && (
                  <Button component={RouterLink} to={SECTION_LINKS[section.title].to} size="small">
                    {SECTION_LINKS[section.title].label}
                  </Button>
                )}
              </Box>
              <Grid container spacing={2.4}>
                {section.fields.map((field) => (
                  <Grid item xs={12} key={field.key}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type={field.type || 'text'}
                      multiline={field.multiline}
                      minRows={field.rows || (field.multiline ? 2 : undefined)}
                      helperText={field.helper}
                      value={settings[field.key] ?? ''}
                      onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                      InputProps={
                        field.adornment
                          ? { startAdornment: <InputAdornment position="start">{field.adornment}</InputAdornment> }
                          : undefined
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
