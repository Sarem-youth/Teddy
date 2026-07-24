import { useEffect, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import { useSnackbar } from '../../context/SnackbarContext';

const EMPTY = { name: '', description: '', icon: '', is_active: true, sort_order: 0 };

export default function Categories() {
  const { notify } = useSnackbar();
  const [categories, setCategories] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get('/admin/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      is_active: Boolean(category.is_active),
      sort_order: category.sort_order ?? 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
      } else {
        await api.post('/admin/categories', form);
      }
      notify(editing ? 'Category updated' : 'Category created');
      setDialogOpen(false);
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.name}"? Its ${category.products_count} product(s) will become uncategorized.`
      )
    )
      return;
    try {
      await api.delete(`/admin/categories/${category.id}`);
      notify('Category deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  return (
    <Box>
      <Seo title="Manage Categories" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      {!categories ? (
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{category.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 340 }}>
                      <Typography variant="body2" noWrap>
                        {category.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={category.products_count} variant="outlined" />
                    </TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={category.is_active ? 'Active' : 'Hidden'}
                        color={category.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(category)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => remove(category)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No categories yet — create your first one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 700 }}>
          {editing ? 'Edit Category' : 'New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.2} sx={{ mt: 0.2 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                label="Category Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Sort Order"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Icon"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                SelectProps={{ native: true }}
              >
                <option value="">Default (water drop)</option>
                <option value="pump">Pump</option>
                <option value="filter">Filter</option>
                <option value="pipes">Pipes</option>
                <option value="valve">Valve</option>
                <option value="tank">Tank</option>
                <option value="irrigation">Irrigation</option>
                <option value="meter">Meter</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !form.name.trim()}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
