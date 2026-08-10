import { useEffect, useMemo, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';

import api from '../api/client';
import Seo from '../components/Seo.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import EmptyState from '../components/EmptyState.jsx';

const FILTERS = [
  { value: 'all', label: 'Everything', icon: <AppsRoundedIcon /> },
  { value: 'image', label: 'Photos', icon: <CollectionsRoundedIcon /> },
  { value: 'video', label: 'Videos', icon: <VideocamRoundedIcon /> },
];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(-1); // index into filtered list

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(1);

    api
      .get('/gallery', {
        params: {
          page: 1,
          per_page: 24,
          type: filter === 'all' ? undefined : filter,
        },
      })
      .then(({ data }) => {
        setItems(data.items || []);
        setHasMore(Boolean(data.meta?.has_more));
      })
      .catch(() => {
        setItems([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    api
      .get('/gallery', {
        params: {
          page: nextPage,
          per_page: 24,
          type: filter === 'all' ? undefined : filter,
        },
      })
      .then(({ data }) => {
        setItems((prev) => [...prev, ...(data.items || [])]);
        setHasMore(Boolean(data.meta?.has_more));
        setPage(nextPage);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  const filtered = useMemo(
    () => items.filter((i) => filter === 'all' || i.type === filter),
    [items, filter]
  );

  const move = useCallback(
    (dir) => setLightbox((i) => (i + dir + filtered.length) % filtered.length),
    [filtered.length]
  );

  useEffect(() => {
    if (lightbox < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, move]);

  const active = lightbox >= 0 ? filtered[lightbox] : null;

  return (
    <Box sx={{ py: { xs: 5, md: 8 } }}>
      <Seo
        title="Project Gallery"
        description="Real photos and videos from Teddy General Trading — water pumps, filtration systems, pipes and installations across Ethiopia."
      />
      <Container maxWidth="lg">
        <SectionHeading
          overline="Our Showroom & Projects"
          title="See the quality for yourself"
          subtitle="Genuine photos and videos of the equipment we stock and the projects we supply — straight from our warehouse and customers' sites."
        />

        <Stack direction="row" spacing={1.2} justifyContent="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              icon={f.icon}
              label={
                f.value === 'all'
                  ? f.label
                  : `${f.label} (${items.filter((i) => i.type === f.value).length})`
              }
              onClick={() => setFilter(f.value)}
              color={filter === f.value ? 'primary' : 'default'}
              variant={filter === f.value ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, px: 0.5 }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4 }, columnGap: '14px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{ mb: 1.75, height: 120 + ((i * 53) % 140), borderRadius: 3 }}
              />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing here yet" subtitle="Check back soon — new photos are added regularly." />
        ) : (
          <>
            <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4 }, columnGap: '14px' }}>
              {filtered.map((item, idx) => (
                <Box
                  key={item.id}
                  onClick={() => setLightbox(idx)}
                  sx={{
                    breakInside: 'avoid',
                    mb: 1.75,
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(4,42,74,.08)',
                    transition: 'transform .25s ease, box-shadow .25s ease',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 26px rgba(4,42,74,.18)' },
                    '&:hover img': { transform: 'scale(1.04)' },
                  }}
                >
                  <Box
                    component="img"
                    src={item.thumb_path || item.path}
                    alt={item.title || 'Teddy General Trading project photo'}
                    loading="lazy"
                    sx={{ width: '100%', display: 'block', transition: 'transform .4s ease' }}
                  />
                  {item.type === 'video' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(180deg, rgba(3,30,53,.05), rgba(3,30,53,.45))',
                      }}
                    >
                      <PlayCircleFilledRoundedIcon sx={{ fontSize: 58, color: '#fff', opacity: 0.95 }} />
                    </Box>
                  )}
                  {item.title && (
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        px: 1.2,
                        py: 0.6,
                        color: '#fff',
                        fontWeight: 600,
                        background: 'linear-gradient(0deg, rgba(3,30,53,.75), transparent)',
                      }}
                    >
                      {item.title}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
                <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Lightbox */}
      <Dialog
        open={lightbox >= 0}
        onClose={() => setLightbox(-1)}
        maxWidth="lg"
        slotProps={{ paper: { sx: { bgcolor: '#0b1d2e', borderRadius: 3, position: 'relative', overflow: 'hidden' } } }}
      >
        {active && (
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {active.type === 'video' ? (
              <Box
                component="video"
                key={active.id}
                src={active.path}
                poster={active.thumb_path || undefined}
                controls
                autoPlay
                playsInline
                sx={{ maxWidth: '100%', maxHeight: '82vh', display: 'block' }}
              />
            ) : (
              <Box
                component="img"
                key={active.id}
                src={active.path}
                alt={active.title || 'Gallery photo'}
                sx={{ maxWidth: '100%', maxHeight: '82vh', display: 'block' }}
              />
            )}

            <IconButton
              onClick={() => setLightbox(-1)}
              aria-label="Close"
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,.35)', '&:hover': { bgcolor: 'rgba(0,0,0,.55)' } }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {filtered.length > 1 && (
              <>
                <IconButton
                  onClick={() => move(-1)}
                  aria-label="Previous"
                  sx={{ position: 'absolute', left: 8, color: '#fff', bgcolor: 'rgba(0,0,0,.35)', '&:hover': { bgcolor: 'rgba(0,0,0,.55)' } }}
                >
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <IconButton
                  onClick={() => move(1)}
                  aria-label="Next"
                  sx={{ position: 'absolute', right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,.35)', '&:hover': { bgcolor: 'rgba(0,0,0,.55)' } }}
                >
                  <ChevronRightRoundedIcon />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
