import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import { formatETB } from '../../utils/format';
import { useSnackbar } from '../../context/SnackbarContext';

export default function Products() {
  const { notify } = useSnackbar();
  const [result, setResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category_id: '', status: '' });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setResult(null);
    api
      .get('/admin/products', {
        params: {
          search: filters.search || undefined,
          category_id: filters.category_id || undefined,
          status: filters.status || undefined,
          page,
        },
      })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1, total: 0 }));
  }, [filters, page]);

  useEffect(load, [load]);

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.title}" permanently? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      notify('Product deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  return (
    <Box>
      <Seo title="Manage Products" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Products
          {result && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: 16 }}>
              ({result.total})
            </Typography>
          )}
        </Typography>
        <Button component={RouterLink} to="/admin/products/new" variant="contained" startIcon={<AddRoundedIcon />}>
          Add Product
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setFilters((f) => ({ ...f, search: searchInput.trim() }));
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search title or SKU…"
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
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={filters.category_id}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, category_id: e.target.value }));
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, status: e.target.value }));
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Hidden</MenuItem>
              <MenuItem value="low_stock">Low Stock (≤5)</MenuItem>
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
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.data.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                          <Avatar
                            variant="rounded"
                            src={product.primary_image || undefined}
                            sx={{ width: 46, height: 46, borderRadius: 2.5, bgcolor: '#EDF4FA' }}
                          >
                            <WaterDropRoundedIcon sx={{ color: 'primary.light' }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={650} fontSize={14.5} noWrap sx={{ maxWidth: 320 }}>
                              {product.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.sku || '—'} · {product.views} views
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatETB(product.price, { decimals: 0 })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={product.stock_quantity}
                          color={product.stock_quantity === 0 ? 'error' : product.stock_quantity <= 5 ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={product.is_active ? 'Active' : 'Hidden'}
                            color={product.is_active ? 'success' : 'default'}
                          />
                          {product.is_featured && <Chip size="small" label="Featured" color="secondary" />}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View on storefront">
                          <IconButton size="small" component={RouterLink} to={`/product/${product.slug}`} target="_blank">
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" component={RouterLink} to={`/admin/products/${product.id}/edit`}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => remove(product)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {result.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No products match your filters.
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
