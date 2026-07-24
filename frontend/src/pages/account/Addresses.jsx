import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import EmptyState from '../../components/EmptyState';
import { useSnackbar } from '../../context/SnackbarContext';

const EMPTY_FORM = {
  label: '',
  name: '',
  phone: '',
  address_line: '',
  city: 'Addis Ababa',
  region: '',
  is_default: false,
};

export default function Addresses() {
  const { notify } = useSnackbar();
  const [addresses, setAddresses] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get('/addresses')
      .then(({ data }) => setAddresses(data.addresses || []))
      .catch(() => setAddresses([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    setForm({
      label: address.label || '',
      name: address.name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      region: address.region || '',
      is_default: address.is_default,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/addresses/${editing.id}`, form);
      } else {
        await api.post('/addresses', form);
      }
      notify(editing ? 'Address updated' : 'Address added');
      setDialogOpen(false);
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (address) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await api.delete(`/addresses/${address.id}`);
      notify('Address removed');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  return (
    <Box>
      <Seo title="My Addresses" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          My Addresses
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          Add Address
        </Button>
      </Box>

      {addresses && addresses.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PlaceRoundedIcon />}
            title="No saved addresses"
            subtitle="Save delivery addresses to check out faster."
            actionLabel="Add Your First Address"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {(addresses || []).map((address) => (
            <Grid item xs={12} sm={6} key={address.id}>
              <Card sx={{ p: 2.6, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    {address.label && (
                      <Typography variant="overline" color="secondary.main" fontWeight={700}>
                        {address.label}
                      </Typography>
                    )}
                    <Typography fontWeight={700}>{address.name}</Typography>
                  </Box>
                  {address.is_default && <Chip size="small" color="primary" label="Default" />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.9 }}>
                  {address.phone}
                  <br />
                  {address.address_line}
                  <br />
                  {address.city}
                  {address.region ? `, ${address.region}` : ''}
                </Typography>
                <Box sx={{ mt: 1.6, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(address)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton size="small" color="error" onClick={() => remove(address)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 700 }}>
          {editing ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.2} sx={{ mt: 0.2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Label (e.g. Home, Office)"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Receiver Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                minRows={2}
                label="Address"
                placeholder="Sub-city, woreda, street, building…"
                value={form.address_line}
                onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region (optional)"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_default}
                    onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                  />
                }
                label="Set as default"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !form.name || !form.phone || !form.address_line || !form.city}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saving…' : 'Save Address'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
