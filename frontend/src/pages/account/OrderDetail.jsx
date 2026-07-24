import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import Seo from '../../components/Seo';
import api from '../../api/client';
import LoadingScreen from '../../components/LoadingScreen';
import { OrderStatusChip, PaymentStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate, PAYMENT_METHOD } from '../../utils/format';

const FLOW = ['pending_verification', 'processing', 'shipped', 'delivered'];
const FLOW_LABELS = ['Pending Verification', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${orderNumber}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setError(true));
  }, [orderNumber]);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        Order not found.{' '}
        <Button component={RouterLink} to="/account/orders" size="small">
          Back to orders
        </Button>
      </Alert>
    );
  }

  if (!order) return <LoadingScreen label="Loading order…" />;

  const stepIndex = FLOW.indexOf(order.status);
  const cancelled = order.status === 'cancelled';

  return (
    <Box>
      <Seo title={`Order ${order.order_number}`} />
      <Button
        component={RouterLink}
        to="/account/orders"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{ mb: 2 }}
      >
        All Orders
      </Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 } }}>
          {order.order_number}
        </Typography>
        <OrderStatusChip status={order.status} size="medium" />
        <PaymentStatusChip status={order.payment_status} size="medium" />
      </Box>

      {cancelled ? (
        <Alert severity="error" sx={{ mb: 3.5, borderRadius: 3 }}>
          This order was cancelled. Contact us if you believe this is a mistake.
        </Alert>
      ) : (
        <Card sx={{ p: { xs: 2, md: 3.5 }, mb: 3.5 }}>
          <Stepper activeStep={stepIndex} alternativeLabel>
            {FLOW_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>
      )}

      <Grid container spacing={3.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2.4 }}>
              Items
            </Typography>
            {order.items?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1.6 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} fontSize={14.5} noWrap>
                    {item.product?.slug ? (
                      <RouterLink to={`/product/${item.product.slug}`} style={{ color: 'inherit' }}>
                        {item.product_title}
                      </RouterLink>
                    ) : (
                      item.product_title
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatETB(item.unit_price)} × {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight={700} fontSize={14.5} sx={{ whiteSpace: 'nowrap' }}>
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
                <Typography fontWeight={800} color="primary.dark">{formatETB(order.total)}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.6 }}>
              Delivery Details
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
          </Card>
          <Card sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1.6 }}>
              Payment
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>
              Method: <b>{PAYMENT_METHOD[order.payment_method] || order.payment_method}</b>
              <br />
              Placed: <b>{formatDate(order.created_at, true)}</b>
            </Typography>
            {order.notes && (
              <>
                <Divider sx={{ my: 1.6 }} />
                <Typography variant="body2" color="text.secondary">
                  <b>Your notes:</b> {order.notes}
                </Typography>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
