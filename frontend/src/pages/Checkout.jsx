import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

import api, { apiError } from '../api/client';
import Seo from '../components/Seo';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSnackbar } from '../context/SnackbarContext';
import { formatETB } from '../utils/format';

const STEPS = ['Shipping Details', 'Payment Method', 'Review & Confirm'];

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { notify } = useSnackbar();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_email: user?.email || '',
    shipping_address: '',
    shipping_city: 'Addis Ababa',
    shipping_region: '',
    notes: '',
    payment_method: 'cash_on_delivery',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    api
      .get('/addresses')
      .then(({ data }) => {
        setAddresses(data.addresses || []);
        const def = (data.addresses || []).find((a) => a.is_default);
        if (def) applyAddress(def);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAddress = (a) => {
    setForm((f) => ({
      ...f,
      shipping_name: a.name,
      shipping_phone: a.phone,
      shipping_address: a.address_line,
      shipping_city: a.city,
      shipping_region: a.region || '',
    }));
  };

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const validateShipping = () => {
    const errors = {};
    if (!form.shipping_name.trim()) errors.shipping_name = 'Full name is required';
    if (!form.shipping_phone.trim()) errors.shipping_phone = 'Phone number is required';
    else if (!/^\+?[0-9\s-]{9,15}$/.test(form.shipping_phone.trim()))
      errors.shipping_phone = 'Enter a valid phone number';
    if (form.shipping_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shipping_email))
      errors.shipping_email = 'Enter a valid email';
    if (!form.shipping_address.trim() || form.shipping_address.trim().length < 8)
      errors.shipping_address = 'Please provide a complete delivery address';
    if (!form.shipping_city.trim()) errors.shipping_city = 'City is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateShipping()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        ...form,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      await clearCart({ remote: false });
      notify('Order placed successfully!');
      navigate(`/order-success/${data.order.order_number}`, { replace: true });
    } catch (err) {
      setError(apiError(err));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Seo title="Checkout" />
        <EmptyState
          icon={<ShoppingCartRoundedIcon />}
          title="Nothing to check out"
          subtitle="Your cart is empty. Add some products first."
          actionLabel="Go to Shop"
          actionTo="/shop"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Seo title="Secure Checkout" />
      <Typography variant="h4" sx={{ mb: 3.5, fontSize: { xs: 26, md: 32 } }}>
        Checkout
      </Typography>

      <Stepper activeStep={step} sx={{ mb: 4.5, display: { xs: 'none', sm: 'flex' } }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* STEP 1 — shipping */}
          {step === 0 && (
            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, mb: 3 }}>
                <LocalShippingRoundedIcon color="primary" />
                <Typography variant="h6">Shipping Details</Typography>
              </Box>

              {addresses.length > 0 && (
                <TextField
                  select
                  fullWidth
                  label="Use a saved address"
                  defaultValue=""
                  sx={{ mb: 3 }}
                  onChange={(e) => {
                    const a = addresses.find((x) => x.id === e.target.value);
                    if (a) applyAddress(a);
                  }}
                >
                  {addresses.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.label || a.address_line} — {a.city}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    value={form.shipping_name}
                    onChange={setField('shipping_name')}
                    error={Boolean(fieldErrors.shipping_name)}
                    helperText={fieldErrors.shipping_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone Number"
                    placeholder="+251 9X XXX XXXX"
                    value={form.shipping_phone}
                    onChange={setField('shipping_phone')}
                    error={Boolean(fieldErrors.shipping_phone)}
                    helperText={fieldErrors.shipping_phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email (for order updates)"
                    value={form.shipping_email}
                    onChange={setField('shipping_email')}
                    error={Boolean(fieldErrors.shipping_email)}
                    helperText={fieldErrors.shipping_email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    label="Delivery Address"
                    placeholder="Sub-city, woreda, street, building, landmark…"
                    value={form.shipping_address}
                    onChange={setField('shipping_address')}
                    error={Boolean(fieldErrors.shipping_address)}
                    helperText={fieldErrors.shipping_address}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="City"
                    value={form.shipping_city}
                    onChange={setField('shipping_city')}
                    error={Boolean(fieldErrors.shipping_city)}
                    helperText={fieldErrors.shipping_city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Region (optional)"
                    value={form.shipping_region}
                    onChange={setField('shipping_region')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Order Notes (optional)"
                    placeholder="Any special delivery instructions…"
                    value={form.notes}
                    onChange={setField('notes')}
                  />
                </Grid>
              </Grid>
            </Card>
          )}

          {/* STEP 2 — payment */}
          {step === 1 && (
            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, mb: 3 }}>
                <PaymentsRoundedIcon color="primary" />
                <Typography variant="h6">Payment Method</Typography>
              </Box>

              <RadioGroup value={form.payment_method} onChange={setField('payment_method')}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.4,
                    mb: 2,
                    cursor: 'pointer',
                    borderColor: form.payment_method === 'cash_on_delivery' ? 'primary.main' : 'divider',
                    borderWidth: 2,
                  }}
                  onClick={() => setForm((f) => ({ ...f, payment_method: 'cash_on_delivery' }))}
                >
                  <FormControlLabel
                    value="cash_on_delivery"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                        <PaymentsRoundedIcon sx={{ color: 'success.main' }} />
                        <Box>
                          <Typography fontWeight={700}>Cash on Delivery</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pay in cash when your order arrives at your door.
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2.4,
                    cursor: 'pointer',
                    borderColor: form.payment_method === 'bank_transfer' ? 'primary.main' : 'divider',
                    borderWidth: 2,
                  }}
                  onClick={() => setForm((f) => ({ ...f, payment_method: 'bank_transfer' }))}
                >
                  <FormControlLabel
                    value="bank_transfer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                        <AccountBalanceRoundedIcon sx={{ color: 'primary.main' }} />
                        <Box>
                          <Typography fontWeight={700}>Bank Transfer / Telebirr</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Transfer to our account and we verify within hours.
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {form.payment_method === 'bank_transfer' && (
                    <Alert severity="info" icon={false} sx={{ mt: 1.6, borderRadius: 2.5 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.9 }}>
                        <b>{settings.bank_name || 'Commercial Bank of Ethiopia'}</b>
                        <br />
                        Account Name: <b>{settings.bank_account_name || '—'}</b>
                        <br />
                        Account No: <b>{settings.bank_account_number || '—'}</b>
                        {settings.telebirr_number && (
                          <>
                            <br />
                            Telebirr: <b>{settings.telebirr_number}</b>
                          </>
                        )}
                        <br />
                        Use your <b>order number</b> as the transfer reference after checkout.
                      </Typography>
                    </Alert>
                  )}
                </Card>
              </RadioGroup>
            </Card>
          )}

          {/* STEP 3 — review */}
          {step === 2 && (
            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                Review Your Order
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="overline" color="text.secondary">
                    Deliver To
                  </Typography>
                  <Typography fontWeight={700}>{form.shipping_name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {form.shipping_phone}
                    <br />
                    {form.shipping_address}
                    <br />
                    {form.shipping_city}
                    {form.shipping_region ? `, ${form.shipping_region}` : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="overline" color="text.secondary">
                    Payment
                  </Typography>
                  <Typography fontWeight={700}>
                    {form.payment_method === 'bank_transfer' ? 'Bank Transfer / Telebirr' : 'Cash on Delivery'}
                  </Typography>
                  <Chip
                    size="small"
                    label="Verified manually after order"
                    sx={{ mt: 1 }}
                    color="warning"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.4, gap: 2 }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.product?.title}{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      × {item.quantity}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatETB(Number(item.product?.price ?? 0) * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            {step > 0 && (
              <Button size="large" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                Back
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <Button size="large" variant="contained" onClick={next} sx={{ px: 5 }}>
                Continue
              </Button>
            ) : (
              <Button
                size="large"
                variant="contained"
                onClick={placeOrder}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ px: 5 }}
              >
                {submitting ? 'Placing Order…' : 'Place Order'}
              </Button>
            )}
          </Box>
        </Grid>

        {/* summary sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 90 }}>
            <Typography variant="h6" sx={{ mb: 2.4 }}>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography color="text.secondary">
                Items ({totals.count})
              </Typography>
              <Typography fontWeight={700}>{formatETB(totals.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography color="text.secondary">VAT ({totals.taxRate}%)</Typography>
              <Typography fontWeight={700}>{formatETB(totals.tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography fontWeight={700} color={totals.shipping === 0 ? 'success.main' : 'inherit'}>
                {totals.shipping === 0 ? 'FREE' : formatETB(totals.shipping)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.dark" sx={{ fontFamily: '"Sora",sans-serif' }}>
                {formatETB(totals.total)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              By placing this order you agree to our offline payment verification process
              (REQ-3.4.1). Orders are confirmed by our team via phone.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
