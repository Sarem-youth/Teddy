import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import api from '../../api/client';
import Seo from '../../components/Seo';
import EmptyState from '../../components/EmptyState';
import { OrderStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate, PAYMENT_METHOD } from '../../utils/format';

export default function Orders() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setResult(null);
    api
      .get('/orders', { params: { page } })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1 }));
  }, [page]);

  return (
    <Box>
      <Seo title="My Orders" />
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: 24, md: 30 } }}>
        My Orders
      </Typography>

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
                onChange={(_, p) => setPage(p)}
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
