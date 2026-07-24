import { useCallback, useEffect, useState } from 'react';
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import api from '../../api/client';
import Seo from '../../components/Seo';
import { OrderStatusChip, PaymentStatusChip } from '../../components/StatusChip';
import { formatETB, formatDate, ORDER_STATUS, PAYMENT_METHOD } from '../../utils/format';
import downloadCsv from '../../utils/downloadCsv';

export default function Orders() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setResult(null);
    api
      .get('/admin/orders', {
        params: { status: status || undefined, search: search || undefined, page },
      })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1, total: 0 }));
  }, [status, search, page]);

  useEffect(load, [load]);

  return (
    <Box>
      <Seo title="Manage Orders" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Orders
          {result && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: 16 }}>
              ({result.total})
            </Typography>
          )}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadRoundedIcon />}
          onClick={() => downloadCsv('/admin/export/orders', `orders-${new Date().toISOString().slice(0, 10)}.csv`)}
        >
          Export CSV
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search order #, customer name or phone…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.entries(ORDER_STATUS).map(([value, meta]) => (
                <MenuItem key={value} value={value}>
                  {meta.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {!result ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
      ) : (
        <>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.data.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      component={RouterLink}
                      to={`/admin/orders/${order.id}`}
                      sx={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.shipping_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.shipping_phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {PAYMENT_METHOD[order.payment_method] || order.payment_method}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatETB(order.total)}</TableCell>
                      <TableCell><PaymentStatusChip status={order.payment_status} /></TableCell>
                      <TableCell><OrderStatusChip status={order.status} /></TableCell>
                    </TableRow>
                  ))}
                  {result.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No orders match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          {result.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={result.last_page} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
