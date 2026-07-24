import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import LoadingScreen from '../../components/LoadingScreen';
import { useSnackbar } from '../../context/SnackbarContext';

const EMPTY = {
  title: '',
  category_id: '',
  sku: '',
  short_description: '',
  details: '',
  price: '',
  compare_at_price: '',
  stock_quantity: 0,
  is_active: true,
  is_featured: false,
  meta_title: '',
  meta_description: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useSnackbar();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/admin/products/${id}`)
      .then(({ data }) => {
        const p = data.product;
        setForm({
          title: p.title || '',
          category_id: p.category_id || '',
          sku: p.sku || '',
          short_description: p.short_description || '',
          details: p.details || '',
          price: p.price ?? '',
          compare_at_price: p.compare_at_price ?? '',
          stock_quantity: p.stock_quantity ?? 0,
          is_active: Boolean(p.is_active),
          is_featured: Boolean(p.is_featured),
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
        });
        setExistingImages(p.images || []);
      })
      .catch(() => notify('Product not found', 'error'))
      .finally(() => setLoading(false));
  }, [id, isEdit, notify]);

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    setNewFiles((prev) => [...prev, ...files].slice(0, 8));
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'is_active' || key === 'is_featured') {
        fd.append(key, value ? '1' : '0');
      } else if (value !== '' && value != null) {
        fd.append(key, value);
      }
    });
    newFiles.forEach((file) => fd.append('images[]', file));

    try {
      if (isEdit) {
        await api.post(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Product updated');
      } else {
        await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const deleteImage = async (image) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      const { data } = await api.delete(`/admin/products/${id}/images/${image.id}`);
      setExistingImages(data.product.images || []);
      notify('Image removed');
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  const makePrimary = async (image) => {
    try {
      const { data } = await api.put(`/admin/products/${id}/images/${image.id}/primary`);
      setExistingImages(data.product.images || []);
      notify('Primary image updated');
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  if (loading) return <LoadingScreen label="Loading product…" />;

  return (
    <Box component="form" onSubmit={submit}>
      <Seo title={isEdit ? 'Edit Product' : 'New Product'} />
      <Button component={RouterLink} to="/admin/products" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2 }}>
        All Products
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </Typography>
        <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null} sx={{ px: 4 }}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Product Title" value={form.title} onChange={setField('title')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Category" value={form.category_id} onChange={setField('category_id')}>
                  <MenuItem value="">Uncategorized</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="SKU" value={form.sku} onChange={setField('sku')} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Short Description"
                  helperText="Shown on product cards and search results (max 600 chars)"
                  value={form.short_description}
                  onChange={setField('short_description')}
                  inputProps={{ maxLength: 600 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  label="Technical Details & Specifications"
                  helperText="Free-form field (REQ-3.1.2) — dimensions, materials, standards, warranty… line breaks are preserved."
                  value={form.details}
                  onChange={setField('details')}
                />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Images
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
              {existingImages.map((img) => (
                <Box key={img.id} sx={{ position: 'relative', width: 110 }}>
                  <Box
                    component="img"
                    src={img.path}
                    alt={img.alt_text || ''}
                    sx={{
                      width: 110,
                      height: 110,
                      objectFit: 'cover',
                      borderRadius: 3,
                      border: '2.5px solid',
                      borderColor: img.is_primary ? 'primary.main' : 'divider',
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.3 }}>
                    <Tooltip title={img.is_primary ? 'Primary image' : 'Make primary'}>
                      <IconButton
                        size="small"
                        onClick={() => makePrimary(img)}
                        sx={{ bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: '#fff' } }}
                      >
                        {img.is_primary ? (
                          <StarRoundedIcon fontSize="small" sx={{ color: '#F59E0B' }} />
                        ) : (
                          <StarBorderRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => deleteImage(img)}
                        sx={{ bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: '#fff' } }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}

              {newFiles.map((file, idx) => (
                <Box key={idx} sx={{ position: 'relative', width: 110 }}>
                  <Box
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 3, border: '2.5px dashed', borderColor: 'secondary.main' }}
                  />
                  <Chip
                    size="small"
                    label="new"
                    color="secondary"
                    sx={{ position: 'absolute', bottom: 6, left: 6, height: 20 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,.9)' }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              ))}

              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 110,
                  height: 110,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  transition: 'all .2s',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(10,92,158,.04)' },
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUploadRoundedIcon />
                  <Typography variant="caption" display="block">
                    Upload
                  </Typography>
                </Box>
              </Box>
            </Box>
            <input ref={fileInputRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={onFilesSelected} />
            <Typography variant="caption" color="text.secondary">
              JPG, PNG, WebP, AVIF or GIF · max 4 MB each · up to 8 images. First image becomes the primary.
              {isEdit ? '' : ' New images are uploaded when you create the product.'}
            </Typography>
          </Card>

          <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              SEO (optional)
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  helperText="Appears in search engine results — defaults to the product title"
                  value={form.meta_title}
                  onChange={setField('meta_title')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Meta Description"
                  inputProps={{ maxLength: 500 }}
                  value={form.meta_description}
                  onChange={setField('meta_description')}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 3, position: 'sticky', top: 84 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Pricing &amp; Inventory
            </Typography>
            <TextField
              fullWidth
              required
              type="number"
              label="Selling Price"
              value={form.price}
              onChange={setField('price')}
              InputProps={{ startAdornment: <InputAdornment position="start">ETB</InputAdornment> }}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Compare-at Price (optional)"
              helperText="Show a discount by setting the old price"
              value={form.compare_at_price}
              onChange={setField('compare_at_price')}
              InputProps={{ startAdornment: <InputAdornment position="start">ETB</InputAdornment> }}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Stock Quantity"
              value={form.stock_quantity}
              onChange={setField('stock_quantity')}
              inputProps={{ min: 0 }}
              sx={{ mb: 2.5 }}
            />
            <FormControlLabel
              control={<Switch checked={form.is_active} onChange={setField('is_active')} />}
              label="Visible on storefront"
              sx={{ display: 'flex', mb: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={form.is_featured} onChange={setField('is_featured')} />}
              label="Featured on homepage"
              sx={{ display: 'flex' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
