import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

import api from '../../api/client';
import Seo from '../../components/Seo';
import { OrderStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate } from '../../utils/format';

function StatCard({ icon, label, value, sub, color = '#0A5C9E' }) {
  return (
    <Card sx={{ p: 2.6, display: 'flex', gap: 2, alignItems: 'center', height: '100%' }}>
      <Box
        sx={{
          width: 54,
          height: 54,
          borderRadius: '18px',
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.2 }} noWrap>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
          {label}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {sub}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setData({ stats: {}, sales_chart: [], recent_orders: [], top_products: [], low_stock_products: [] }));
  }, []);

  if (!data) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={104} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    );
  }

  const { stats } = data;

  return (
    <Box>
      <Seo title="Admin Dashboard" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        Dashboard
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<PaidRoundedIcon />}
            label="Confirmed Revenue"
            value={formatETB(stats.total_revenue ?? 0, { decimals: 0 })}
            sub={`${formatETB(stats.pending_revenue ?? 0, { decimals: 0 })} pending`}
            color="#0E9F6E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<ReceiptLongRoundedIcon />}
            label="Total Orders"
            value={stats.orders_count ?? 0}
            color="#0A5C9E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<PendingActionsRoundedIcon />}
            label="Pending Verification"
            value={stats.pending_orders ?? 0}
            color="#D97706"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<GroupRoundedIcon />}
            label="Registered Customers"
            value={stats.customers_count ?? 0}
            color="#4338CA"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<Inventory2RoundedIcon />}
            label="Products"
            value={stats.products_count ?? 0}
            sub={`${stats.active_products ?? 0} active`}
            color="#0891B2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<WarningAmberRoundedIcon />}
            label="Low Stock Items"
            value={stats.low_stock ?? 0}
            sub={`${stats.unread_messages ?? 0} unread inquiries`}
            color="#DC2626"
          />
        </Grid>

        {/* sales chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales — Last 30 Days
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sales_chart} margin={{ left: 0, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A5C9E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0A5C9E" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E3ECF3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#54708A' }}
                    tickFormatter={(v) => v?.slice(5)}
                    interval={4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#54708A' }}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <RechartsTooltip
                    formatter={(value, name) =>
                      name === 'revenue' ? [formatETB(value), 'Revenue'] : [value, 'Orders']
                    }
                    labelFormatter={(v) => formatDate(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E3ECF3', fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0A5C9E" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* top products + low stock */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, mb: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Products
            </Typography>
            {data.top_products.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No sales yet.
              </Typography>
            )}
            {data.top_products.map((p, i) => (
              <Box key={p.product_title} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.6 }}>
                <Chip size="small" label={`#${i + 1}`} sx={{ fontWeight: 800, bgcolor: 'rgba(10,92,158,.1)', color: 'primary.dark' }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {p.product_title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.units} units · {formatETB(p.revenue, { decimals: 0 })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Card>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Low Stock Alert
            </Typography>
            {data.low_stock_products.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                All products are well stocked. 🎉
              </Typography>
            )}
            {data.low_stock_products.map((p) => (
              <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1.4 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                  {p.title}
                </Typography>
                <Chip size="small" color={p.stock_quantity === 0 ? 'error' : 'warning'} label={`${p.stock_quantity} left`} />
              </Box>
            ))}
          </Card>
        </Grid>

        {/* recent orders */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button component={RouterLink} to="/admin/orders" size="small">
                Manage All
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recent_orders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      component={RouterLink}
                      to={`/admin/orders/${order.id}`}
                      sx={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{order.order_number}</TableCell>
                      <TableCell>{order.user?.name || order.shipping_name}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.items_count}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatETB(order.total)}</TableCell>
                      <TableCell><OrderStatusChip status={order.status} /></TableCell>
                    </TableRow>
                  ))}
                  {data.recent_orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No orders yet — they'll show up here as customers start buying.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
