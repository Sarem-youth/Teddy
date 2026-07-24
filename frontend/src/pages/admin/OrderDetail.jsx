import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import LoadingScreen from '../../components/LoadingScreen';
import { OrderStatusChip, PaymentStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate, ORDER_STATUS, PAYMENT_METHOD } from '../../utils/format';
import { useSnackbar } from '../../context/SnackbarContext';
import { useSettings } from '../../context/SettingsContext';
import printInvoice from '../../utils/printInvoice';

export default function OrderDetail() {
  const { id } = useParams();
  const { notify } = useSnackbar();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ status: '', payment_status: '', admin_notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.order);
        setForm({
          status: data.order.status,
          payment_status: data.order.payment_status,
          admin_notes: data.order.admin_notes || '',
        });
      })
      .catch(() => notify('Order not found', 'error'));
  }, [id, notify]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/orders/${id}`, form);
      setOrder(data.order);
      notify('Order updated');
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <LoadingScreen label="Loading order…" />;

  return (
    <Box>
      <Seo title={`Order ${order.order_number}`} />
      <Button component={RouterLink} to="/admin/orders" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2 }}>
        All Orders
      </Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 } }}>
          {order.order_number}
        </Typography>
        <OrderStatusChip status={order.status} size="medium" />
        <PaymentStatusChip status={order.payment_status} size="medium" />
        <Typography variant="body2" color="text.secondary">
          Placed {formatDate(order.created_at, true)}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PrintRoundedIcon />}
          onClick={() => printInvoice(order, settings)}
          sx={{ ml: 'auto' }}
        >
          Print Invoice
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.4 }}>
              Items
            </Typography>
            {order.items?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1.6 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} fontSize={14.5}>
                    {item.product_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatETB(item.unit_price)} × {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                  {formatETB(item.line_total)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Stack spacing={0.8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>{formatETB(order.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">VAT</Typography>
                <Typography variant="body2" fontWeight={600}>{formatETB(order.tax)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {Number(order.shipping_fee) === 0 ? 'FREE' : formatETB(order.shipping_fee)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Typography fontWeight={800}>Total</Typography>
                <Typography fontWeight={800} color="primary.dark" fontSize={18}>
                  {formatETB(order.total)}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1.6 }}>
                  Customer
                </Typography>
                <Typography fontWeight={700}>{order.user?.name || order.shipping_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                  {order.user?.email || order.shipping_email || '—'}
                  <br />
                  {order.user?.phone || order.shipping_phone}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1.6 }}>
                  Delivery
                </Typography>
                <Typography fontWeight={700}>{order.shipping_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                  {order.shipping_phone}
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.shipping_city}
                  {order.shipping_region ? `, ${order.shipping_region}` : ''}
                </Typography>
                {order.notes && (
                  <>
                    <Divider sx={{ my: 1.4 }} />
                    <Typography variant="body2" color="text.secondary">
                      <b>Customer notes:</b> {order.notes}
                    </Typography>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, position: 'sticky', top: 84 }}>
            <Typography variant="h6" sx={{ mb: 2.6 }}>
              Manage Order
            </Typography>
            <TextField
              select
              fullWidth
              label="Order Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              sx={{ mb: 2.5 }}
            >
              {Object.entries(ORDER_STATUS).map(([value, meta]) => (
                <MenuItem key={value} value={value}>
                  {meta.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Payment Status"
              helperText={`Method: ${PAYMENT_METHOD[order.payment_method] || order.payment_method}`}
              value={form.payment_status}
              onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}
              sx={{ mb: 2.5 }}
            >
              <MenuItem value="pending">Payment Pending</MenuItem>
              <MenuItem value="confirmed">Payment Confirmed</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Internal Notes"
              placeholder="Verification details, delivery notes…"
              value={form.admin_notes}
              onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={save}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Saving…' : 'Update Order'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Cancelling an order automatically restores product stock. Re-activating deducts it again.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
