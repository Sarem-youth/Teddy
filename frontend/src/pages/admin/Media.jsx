import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Skeleton from '@mui/material/Skeleton';

import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

import api, { apiError } from '../../api/client';
import { useSnackbar } from '../../context/SnackbarContext';
import EmptyState from '../../components/EmptyState';

export default function AdminMedia() {
  const { notify } = useSnackbar();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const imagesInput = useRef(null);

  const load = () =>
    api
      .get('/admin/gallery')
      .then(({ data }) => setItems(data.items || []))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const uploadImages = async (files) => {
    if (!files?.length) return;
    const form = new FormData();
    [...files].forEach((f) => form.append('images[]', f));
    setUploading(true);
    try {
      await api.post('/admin/gallery', form);
      notify(`${files.length} photo(s) uploaded`, 'success');
      load();
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setUploading(false);
      if (imagesInput.current) imagesInput.current.value = '';
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;
    const form = new FormData();
    form.append('video', videoFile);
    if (posterFile) form.append('poster', posterFile);
    if (videoTitle) form.append('title', videoTitle);
    setUploading(true);
    try {
      await api.post('/admin/gallery', form);
      notify('Video uploaded', 'success');
      setVideoDialog(false);
      setVideoFile(null);
      setPosterFile(null);
      setVideoTitle('');
      load();
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setUploading(false);
    }
  };

  const patch = async (item, data, msg) => {
    try {
      await api.put(`/admin/gallery/${item.id}`, data);
      notify(msg, 'success');
      load();
    } catch (e) {
      notify(apiError(e), 'error');
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this media item permanently?')) return;
    try {
      await api.delete(`/admin/gallery/${item.id}`);
      notify('Deleted', 'success');
      load();
    } catch (e) {
      notify(apiError(e), 'error');
    }
  };

  const filtered = (items || []).filter((i) => filter === 'all' || i.type === filter);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Media Gallery
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Photos & videos shown on the public Gallery page and the homepage showcase.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.2}>
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateRoundedIcon />}
            onClick={() => imagesInput.current?.click()}
            disabled={uploading}
          >
            Upload Photos
          </Button>
          <Button
            variant="outlined"
            startIcon={<VideoCallRoundedIcon />}
            onClick={() => setVideoDialog(true)}
            disabled={uploading}
          >
            Upload Video
          </Button>
          <input
            hidden
            ref={imagesInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            onChange={(e) => uploadImages(e.target.files)}
          />
        </Stack>
      </Stack>

      {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      <ToggleButtonGroup
        exclusive
        size="small"
        value={filter}
        onChange={(_, v) => v && setFilter(v)}
        sx={{ mb: 2.5 }}
      >
        <ToggleButton value="all">All ({items?.length ?? '…'})</ToggleButton>
        <ToggleButton value="image">Photos ({(items || []).filter((i) => i.type === 'image').length})</ToggleButton>
        <ToggleButton value="video">Videos ({(items || []).filter((i) => i.type === 'video').length})</ToggleButton>
      </ToggleButtonGroup>

      {items === null ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
              <Skeleton variant="rounded" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No media yet"
          subtitle="Upload photos or a video to populate the public gallery."
        />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  opacity: item.is_active ? 1 : 0.45,
                  '&:hover .media-actions': { opacity: 1 },
                }}
              >
                <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: '#eef4f9' }}>
                  <Box
                    component="img"
                    src={item.thumb_path || (item.type === 'image' ? item.path : undefined)}
                    alt={item.title || ''}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {item.type === 'video' && (
                    <PlayCircleFilledRoundedIcon
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        m: 'auto',
                        fontSize: 44,
                        color: '#fff',
                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.5))',
                      }}
                    />
                  )}
                  {item.is_featured && (
                    <Chip
                      size="small"
                      icon={<StarRoundedIcon sx={{ '&&': { color: '#B45309' } }} />}
                      label="Featured"
                      sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                    />
                  )}
                </Box>

                <Box
                  className="media-actions"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity .2s',
                    background: 'rgba(4,29,51,.55)',
                  }}
                >
                  <Tooltip title={item.is_active ? 'Hide from site' : 'Show on site'}>
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      onClick={() => patch(item, { is_active: !item.is_active }, item.is_active ? 'Hidden' : 'Visible')}
                    >
                      {item.is_active ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.is_featured ? 'Unfeature' : 'Feature (homepage)'}>
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      onClick={() => patch(item, { is_featured: !item.is_featured }, 'Updated')}
                    >
                      {item.is_featured ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit caption">
                    <IconButton
                      size="small"
                      sx={{ color: '#fff' }}
                      onClick={() => {
                        setEditItem(item);
                        setEditTitle(item.title || '');
                      }}
                    >
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" sx={{ color: '#FCA5A5' }} onClick={() => remove(item)}>
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Video upload dialog */}
      <Dialog open={videoDialog} onClose={() => !uploading && setVideoDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Upload a Video</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Button variant="outlined" component="label">
              {videoFile ? videoFile.name : 'Choose video file (MP4/WebM, max 60 MB)'}
              <input
                hidden
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Button variant="outlined" component="label" color="secondary">
              {posterFile ? posterFile.name : 'Optional: poster image (thumbnail)'}
              <input hidden type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
            </Button>
            <TextField
              label="Caption (optional)"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Tip: some shared-hosting plans limit uploads to ~64 MB. Keep videos short and compressed.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setVideoDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={uploadVideo} disabled={!videoFile || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caption edit dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit caption</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Caption"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              patch(editItem, { title: editTitle }, 'Caption saved');
              setEditItem(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
