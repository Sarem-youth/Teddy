import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import api from '../../api/client';
import Seo from '../../components/Seo';
import EmptyState from '../../components/EmptyState';
import { OrderStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate, ORDER_STATUS, PAYMENT_METHOD } from '../../utils/format';

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  useEffect(() => {
    setStatus(searchParams.get('status') || '');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  const patchParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  useEffect(() => {
    setResult(null);
    api
      .get('/orders', { params: { page, status: status || undefined } })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1 }));
  }, [page, status]);

  return (
    <Box>
      <Seo title="My Orders" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        My Orders
      </Typography>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Status"
          value={status}
          onChange={(e) => patchParams({ status: e.target.value, page: '' })}
        >
          <MenuItem value="">All Orders</MenuItem>
          {Object.entries(ORDER_STATUS).map(([value, meta]) => (
            <MenuItem key={value} value={value}>
              {meta.label}
            </MenuItem>
          ))}
        </TextField>
      </Card>

      {!result ? (
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      ) : result.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ReceiptLongRoundedIcon />}
            title="No orders yet"
            subtitle="Your order history will appear here after your first purchase."
            actionLabel="Browse Products"
            actionTo="/shop"
          />
        </Card>
      ) : (
        <>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.data.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      component={RouterLink}
                      to={`/account/orders/${order.order_number}`}
                      sx={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
                        {order.order_number}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.items_count}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {PAYMENT_METHOD[order.payment_method] || order.payment_method}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatETB(order.total)}
                      </TableCell>
                      <TableCell>
                        <OrderStatusChip status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          {result.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={result.last_page}
                page={page}
                onChange={(_, p) => patchParams({ page: String(p) })}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
