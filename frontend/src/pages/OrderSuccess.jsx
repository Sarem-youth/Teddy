import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import api from '../api/client';
import Seo from '../components/Seo';
import LoadingScreen from '../components/LoadingScreen';
import { useSettings } from '../context/SettingsContext';
import { formatETB, PAYMENT_METHOD } from '../utils/format';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api
      .get(`/orders/${orderNumber}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {});
  }, [orderNumber]);

  if (!order) return <LoadingScreen label="Loading your order…" />;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Seo title="Order Confirmed" />
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 92,
            height: 92,
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg,#0E9F6E,#34D399)',
            boxShadow: '0 18px 40px -12px rgba(14,159,110,.5)',
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#fff' }} />
        </Box>
        <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 36 } }}>
          Thank you! Order received.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.4, fontSize: 17 }}>
          Order number{' '}
          <Typography component="span" color="primary.dark" fontWeight={800} fontSize={17}>
            {order.order_number}
          </Typography>{' '}
          — we'll call you shortly to confirm.
        </Typography>
      </Box>

      {order.payment_method === 'bank_transfer' && (
        <Alert severity="info" sx={{ mb: 3.5, borderRadius: 3 }}>
          <Typography variant="body2" sx={{ lineHeight: 2 }}>
            <b>Complete your bank transfer to confirm the order:</b>
            <br />
            {settings.bank_name || 'Commercial Bank of Ethiopia'} — Account:{' '}
            <b>{settings.bank_account_number || '—'}</b> ({settings.bank_account_name || ''})
            {settings.telebirr_number && (
              <>
                <br />
                Telebirr: <b>{settings.telebirr_number}</b>
              </>
            )}
            <br />
            Reference: <b>{order.order_number}</b> · Amount: <b>{formatETB(order.total)}</b>
          </Typography>
        </Alert>
      )}

      <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Typography variant="h6" sx={{ mb: 2.4 }}>
          Order Details
        </Typography>
        {order.items?.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.3, gap: 2 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.product_title}{' '}
              <Typography component="span" variant="body2" color="text.secondary">
                × {item.quantity}
              </Typography>
            </Typography>
            <Typography variant="body2" fontWeight={700}>
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
            <Typography fontWeight={800} color="primary.dark">
              {formatETB(order.total)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
            Payment method: {PAYMENT_METHOD[order.payment_method] || order.payment_method} · Status:
            Pending verification
          </Typography>
        </Stack>
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
        <Button component={RouterLink} to="/account/orders" variant="contained" size="large">
          Track My Orders
        </Button>
        <Button component={RouterLink} to="/shop" variant="outlined" size="large">
          Continue Shopping
        </Button>
      </Stack>
    </Container>
  );
}
