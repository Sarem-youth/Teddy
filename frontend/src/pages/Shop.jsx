import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

import api from '../api/client';
import Seo from '../components/Seo';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const params = useMemo(
    () => ({
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || 'latest',
      page: Number(searchParams.get('page') || 1),
      in_stock: searchParams.get('in_stock') === '1',
    }),
    [searchParams]
  );

  useEffect(() => {
    setSearchInput(params.search);
  }, [params.search]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setResult(null);
    api
      .get('/products', {
        params: {
          category: params.category || undefined,
          search: params.search || undefined,
          sort: params.sort,
          page: params.page,
          in_stock: params.in_stock ? 1 : undefined,
          per_page: 12,
        },
      })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1, total: 0 }));
  }, [params]);

  const patchParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value == null || value === false) next.delete(key);
      else next.set(key, value);
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <Box>
      <Seo
        title={activeCategory ? `${activeCategory.name} — Shop` : 'Shop All Products'}
        description="Browse water pumps, filtration, pipes, valves, tanks and irrigation equipment with transparent ETB pricing."
      />

      {/* page header */}
      <Box
        sx={{
          background: 'linear-gradient(120deg,#052440,#0A5C9E)',
          color: '#fff',
          py: { xs: 4.5, md: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 36 } }}>
            {activeCategory ? activeCategory.name : 'Shop All Products'}
          </Typography>
          <Typography sx={{ mt: 1, color: 'rgba(222,238,250,.8)', maxWidth: 620 }}>
            {activeCategory?.description ||
              'Complete catalog of certified water materials with transparent pricing in Ethiopian Birr.'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* category chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            label="All"
            color={!params.category ? 'primary' : 'default'}
            variant={!params.category ? 'filled' : 'outlined'}
            onClick={() => patchParams({ category: '' })}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={`${cat.name} (${cat.products_count})`}
              color={params.category === cat.slug ? 'primary' : 'default'}
              variant={params.category === cat.slug ? 'filled' : 'outlined'}
              onClick={() => patchParams({ category: cat.slug })}
            />
          ))}
        </Box>

        {/* toolbar */}
        <Card sx={{ p: 2, mb: 3.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  patchParams({ search: searchInput.trim() });
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, spec or SKU…"
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
            <Grid item xs={7} sm={5} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sort by"
                value={params.sort}
                onChange={(e) => patchParams({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={5} sm={4} md={2.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.in_stock}
                    onChange={(e) => patchParams({ in_stock: e.target.checked ? '1' : '' })}
                  />
                }
                label="In stock"
              />
            </Grid>
            <Grid item xs={12} sm={3} md={1.5} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {result ? `${result.total} items` : '…'}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* grid */}
        {result && result.data.length === 0 ? (
          <EmptyState
            icon={<Inventory2RoundedIcon />}
            title="No products found"
            subtitle="Try changing your search terms or removing some filters."
            actionLabel="Clear Filters"
            onAction={() => setSearchParams({})}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {(result?.data || Array.from({ length: 8 })).map((product, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product?.id ?? idx}>
                  {product ? (
                    <ProductCard product={product} />
                  ) : (
                    <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
                  )}
                </Grid>
              ))}
            </Grid>

            {result && result.last_page > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={result.last_page}
                  page={params.page}
                  onChange={(_, page) => patchParams({ page })}
                  color="primary"
                  size="large"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
