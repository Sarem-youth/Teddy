import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';

import api from '../../api/client';
import Seo from '../../components/Seo';
import { OrderStatusChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';
import { formatETB, formatDate } from '../../utils/format';

export default function Overview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    api
      .get('/orders')
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {});

    api
      .get('/addresses')
      .then(({ data }) => setAddresses(data.addresses || []))
      .catch(() => {});
  }, []);

  const pending = orders.filter((o) => o.status === 'pending_verification').length;
  const active = orders.filter((o) => ['pending', 'confirmed', 'packing', 'dispatched'].includes(o.status)).length;

  const STATS = [
    { icon: <ReceiptLongRoundedIcon />, label: 'Total Orders', value: orders.length, to: '/account/orders' },
    { icon: <PendingActionsRoundedIcon />, label: 'Awaiting Verification', value: pending, to: '/account/orders?status=pending_verification' },
    { icon: <LocalShippingRoundedIcon />, label: 'Active Orders', value: active, to: '/account/orders?status=pending,confirmed,packing,dispatched' },
    { icon: <PlaceRoundedIcon />, label: 'Saved Addresses', value: addresses.length, to: '/account/addresses' },
  ];

  return (
    <Box>
      <Seo title="My Account" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        Hello, {user?.name?.split(' ')[0]} 👋
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {STATS.map((s) => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Card sx={{ p: 2.6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CardActionArea component={RouterLink} to={s.to} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0.2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg,#334155,#64748B)',
                    color: '#fff',
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, fontSize: 26 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {s.label}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2.5, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1.2 }}>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.2 }}>
          Open the part of your account you want to manage right now.
        </Typography>
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth component={RouterLink} to="/account/orders" variant="contained" startIcon={<ReceiptLongRoundedIcon />}>
              Track Orders
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth component={RouterLink} to="/account/addresses" variant="outlined" startIcon={<PlaceRoundedIcon />}>
              Manage Addresses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth component={RouterLink} to="/account/profile" variant="outlined" startIcon={<ManageAccountsRoundedIcon />}>
              Update Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth component={RouterLink} to="/shop" variant="text" startIcon={<StorefrontRoundedIcon />}>
              Continue Shopping
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Recent Orders</Typography>
          <Button component={RouterLink} to="/account/orders" size="small">
            View All
          </Button>
        </Box>
        {orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">You haven't placed any orders yet.</Typography>
            <Button component={RouterLink} to="/shop" variant="contained" sx={{ mt: 2 }}>
              Start Shopping
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    component={RouterLink}
                    to={`/account/orders/${order.order_number}`}
                    sx={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {order.order_number}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{order.items_count}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatETB(order.total)}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
