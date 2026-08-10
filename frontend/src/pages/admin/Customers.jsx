import { useCallback, useEffect, useState } from 'react';
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
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import api from '../../api/client';
import Seo from '../../components/Seo';
import { formatETB, formatDate } from '../../utils/format';
import downloadCsv from '../../utils/downloadCsv';

export default function Customers() {
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setResult(null);
    api
      .get('/admin/customers', { params: { search: search || undefined, page } })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1, total: 0 }));
  }, [search, page]);

  useEffect(load, [load]);

  return (
    <Box>
      <Seo title="Customers" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Customers
          {result && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: 16 }}>
              ({result.total})
            </Typography>
          )}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadRoundedIcon />}
          onClick={() => downloadCsv('/admin/export/customers', `customers-${new Date().toISOString().slice(0, 10)}.csv`)}
        >
          Export CSV
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          sx={{ maxWidth: 420 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search name or email…"
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
      </Card>

      {!result ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Total Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.data.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                          <Avatar sx={{ width: 38, height: 38, fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg,#334155,#64748B)' }}>
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={650} fontSize={14.5}>
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.phone || '—'}</TableCell>
                      <TableCell>{formatDate(customer.created_at)}</TableCell>
                      <TableCell>{customer.orders_count}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {formatETB(customer.total_spent ?? 0, { decimals: 0 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {result.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No customers found.
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
