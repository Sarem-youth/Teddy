import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
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

import api from '../../api/client';
import Seo from '../../components/Seo';
import { OrderStatusChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';
import { formatETB, formatDate } from '../../utils/format';

export default function Overview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get('/orders')
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {});
  }, []);

  const pending = orders.filter((o) => o.status === 'pending_verification').length;
  const active = orders.filter((o) => ['processing', 'shipped'].includes(o.status)).length;

  const STATS = [
    { icon: <ReceiptLongRoundedIcon />, label: 'Total Orders', value: orders.length },
    { icon: <PendingActionsRoundedIcon />, label: 'Awaiting Verification', value: pending },
    { icon: <LocalShippingRoundedIcon />, label: 'In Progress', value: active },
  ];

  return (
    <Box>
      <Seo title="My Account" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        Hello, {user?.name?.split(' ')[0]} 👋
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {STATS.map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card sx={{ p: 2.6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '18px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg,#0A5C9E,#0891B2)',
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
            </Card>
          </Grid>
        ))}
      </Grid>

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
