import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import EastRoundedIcon from '@mui/icons-material/EastRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import PlumbingRoundedIcon from '@mui/icons-material/PlumbingRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PropaneTankRoundedIcon from '@mui/icons-material/PropaneTankRounded';
import GrassRoundedIcon from '@mui/icons-material/GrassRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShowerRoundedIcon from '@mui/icons-material/ShowerRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import SolarPowerRoundedIcon from '@mui/icons-material/SolarPowerRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import api from '../api/client';
import Seo from '../components/Seo';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { useSettings } from '../context/SettingsContext';
import { publicAsset } from '../utils/publicAsset';

const CATEGORY_ICONS = {
  pump: <SettingsSuggestRoundedIcon />,
  filter: <FilterAltRoundedIcon />,
  pipes: <PlumbingRoundedIcon />,
  valve: <TuneRoundedIcon />,
  tank: <PropaneTankRoundedIcon />,
  irrigation: <GrassRoundedIcon />,
  meter: <SpeedRoundedIcon />,
  bathroom: <ShowerRoundedIcon />,
  fire: <LocalFireDepartmentRoundedIcon />,
  flange: <DonutLargeRoundedIcon />,
  solar: <SolarPowerRoundedIcon />,
};

const BENEFITS = [
  {
    icon: <VerifiedRoundedIcon />,
    title: 'Certified Quality',
    text: 'Genuine, standards-compliant equipment from trusted global manufacturers.',
  },
  {
    icon: <LocalShippingRoundedIcon />,
    title: 'Fast Delivery',
    text: 'Quick dispatch across Addis Ababa and reliable delivery to all regions.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Expert Support',
    text: 'Free sizing and technical advice from our water-systems supply and construction specialists.',
  },
  {
    icon: <PaymentsRoundedIcon />,
    title: 'Flexible Payment',
    text: 'Pay comfortably by bank transfer or cash on delivery.',
  },
];

const SERVICE_LINES = [
  {
    icon: <WaterDropRoundedIcon />,
    title: 'Water Material Supply',
    text: 'Certified pumps, pipes, valves, filtration systems and fittings for residential, commercial and industrial projects.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Water Construction Works',
    text: 'Installation and execution support for water lines, pumping stations, filtration units and site-level water infrastructure.',
  },
];

const CERTIFICATE_PROOFS = [
  {
    file: 'photo_2026-08-10_15-02-35.jpg',
    label: 'Business License — Supply & Construction',
  },
  {
    file: 'photo_2026-08-10_15-02-46.jpg',
    label: 'Trade Registration Document',
  },
  {
    file: 'photo_2026-08-10_15-02-53.jpg',
    label: 'Tax / Compliance Certificate',
  },
  {
    file: 'photo_2026-08-10_15-02-59.jpg',
    label: 'Construction Authorization Proof',
  },
  {
    file: 'photo_2026-08-10_15-03-09.jpg',
    label: 'Additional Registration Proof',
  },
];

export default function Home() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState(null);
  const [media, setMedia] = useState({ video: null, photos: [] });

  useEffect(() => {
    api
      .get('/products', { params: { featured: 1, per_page: 8 } })
      .then(({ data }) => setFeatured(data.data || []))
      .catch(() => setFeatured([]));

    api
      .get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]));

    api
      .get('/gallery')
      .then(({ data }) => {
        const items = data.items || [];
        setMedia({
          video: items.find((i) => i.type === 'video') || null,
          photos: items.filter((i) => i.type === 'image').slice(0, 8),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Seo
        title="Water Materials & Equipment Store"
        description="Water material supply and water construction services in Ethiopia. Certified products, licensed operation and expert project support."
      />

      {/* ============ HERO ============ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 48%, #334155 100%)',
          color: '#fff',
        }}
      >
        {/* decorative blobs */}
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(148,163,184,.24), transparent 65%)',
            top: -160,
            right: -120,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(100,116,139,.28), transparent 65%)',
            bottom: -140,
            left: -100,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', py: { xs: 8, md: 13 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="💧 Ethiopia's Water Equipment Specialists"
                sx={{
                  bgcolor: 'rgba(255,255,255,.12)',
                  color: '#BFE3FF',
                  fontWeight: 600,
                  mb: 3,
                  backdropFilter: 'blur(6px)',
                }}
              />
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: 36, sm: 48, md: 58 }, lineHeight: 1.12, letterSpacing: -1 }}
              >
                Everything Water.
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    background: 'linear-gradient(90deg,#CBD5E1,#94A3B8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Delivered Right.
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 3,
                  fontSize: { xs: 16, md: 18 },
                  color: 'rgba(222,238,250,.85)',
                  maxWidth: 560,
                  lineHeight: 1.75,
                }}
              >
                From high-performance pumps and filtration systems to pipes, valves and complete
                irrigation kits — {settings.store_name || 'Teddy General Trading'} provides certified
                water material supply and water construction support for homes, farms and industry.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4.5 }}>
                <Button
                  component={RouterLink}
                  to="/shop"
                  size="large"
                  variant="contained"
                  endIcon={<EastRoundedIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: 16,
                    bgcolor: '#E2E8F0',
                    color: '#0F172A',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#CBD5E1' },
                  }}
                >
                  Shop Products
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact"
                  size="large"
                  variant="outlined"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: 16,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,.4)',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' },
                  }}
                >
                  Request a Quote
                </Button>
              </Stack>

              {/* trust stats */}
              <Grid container spacing={3} sx={{ mt: { xs: 2, md: 4 }, maxWidth: 560 }}>
                {[
                  ['10+', 'Years of Experience'],
                  ['2,500+', 'Projects Supplied'],
                  ['7', 'Product Categories'],
                ].map(([num, label]) => (
                  <Grid item xs={4} key={label}>
                    <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, fontSize: { xs: 22, md: 30 }, color: '#CBD5E1' }}>
                      {num}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: 11.5, md: 13 }, color: 'rgba(222,238,250,.7)' }}>
                      {label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* hero visual */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'relative', height: 430 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,.07)',
                    border: '1px solid rgba(255,255,255,.16)',
                    backdropFilter: 'blur(10px)',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <WaterDropRoundedIcon sx={{ fontSize: 230, color: 'rgba(79,195,247,.28)' }} />
                  <Box
                    component="img"
                    src="/uploads/hero_placeholder.png"
                    alt="Industrial water pump"
                    sx={{
                      position: 'absolute',
                      width: '78%',
                      borderRadius: 5,
                      boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)',
                    }}
                  />
                </Box>
                {/* floating chips */}
                <Chip
                  icon={<VerifiedRoundedIcon sx={{ color: '#BFDBFE !important' }} />}
                  label="Certified Equipment"
                  sx={{
                    position: 'absolute',
                    top: 18,
                    left: -14,
                    bgcolor: '#1F2937',
                    color: '#fff',
                    px: 1,
                    py: 2.4,
                    borderRadius: 3,
                    fontWeight: 700,
                    boxShadow: '0 14px 30px -8px rgba(0,0,0,.45)',
                  }}
                />
                <Chip
                  icon={<LocalShippingRoundedIcon sx={{ color: '#BFDBFE !important' }} />}
                  label="Nationwide Delivery"
                  sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: -10,
                    bgcolor: '#1F2937',
                    color: '#fff',
                    px: 1,
                    py: 2.4,
                    borderRadius: 3,
                    fontWeight: 700,
                    boxShadow: '0 14px 30px -8px rgba(0,0,0,.45)',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* wave bottom */}
        <Box sx={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ width: '100%', height: 64, display: 'block' }}>
            <path
              d="M0,50 C280,95 520,10 760,35 C1000,60 1240,80 1440,40 L1440,90 L0,90 Z"
              fill="#F5F8FB"
            />
          </svg>
        </Box>
      </Box>

      {/* ============ CATEGORIES ============ */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          overline="Browse by Category"
          title="What are you looking for?"
          subtitle="Seven specialized categories supporting complete water infrastructure supply and construction execution."
        />
        <Grid container spacing={2.5}>
          {(categories || Array.from({ length: 7 })).map((cat, idx) => (
            <Grid item xs={6} sm={4} md={3} lg={12 / 7} key={cat?.id ?? idx}>
              {cat ? (
                <Card sx={{ height: '100%' }}>
                  <CardActionArea
                    component={RouterLink}
                    to={`/shop?category=${cat.slug}`}
                    sx={{
                      p: 2.6,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.4,
                      transition: 'all .25s',
                      '&:hover .cat-icon': {
                        background: 'linear-gradient(135deg,#334155,#64748B)',
                        color: '#fff',
                        transform: 'scale(1.08)',
                      },
                    }}
                  >
                    <Box
                      className="cat-icon"
                      sx={{
                        width: 62,
                        height: 62,
                        borderRadius: '22px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(51,65,85,.1)',
                        color: 'primary.main',
                        transition: 'all .25s',
                        '& svg': { fontSize: 30 },
                      }}
                    >
                      {CATEGORY_ICONS[cat.icon] || <WaterDropRoundedIcon />}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.products_count} items
                    </Typography>
                  </CardActionArea>
                </Card>
              ) : (
                <Skeleton variant="rounded" height={170} sx={{ borderRadius: 4 }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ FEATURED PRODUCTS ============ */}
      <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <SectionHeading
            overline="Hand-picked for you"
            title="Featured Products"
            subtitle="Our most trusted and popular water equipment, selected by our technical team."
          />
          <Grid container spacing={3}>
            {(featured || Array.from({ length: 4 })).map((product, idx) => (
              <Grid item xs={12} sm={6} md={3} key={product?.id ?? idx}>
                {product ? (
                  <ProductCard product={product} />
                ) : (
                  <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
                )}
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              component={RouterLink}
              to="/shop"
              variant="contained"
              size="large"
              endIcon={<EastRoundedIcon />}
              sx={{ px: 5, py: 1.4 }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ============ SHOWROOM / MEDIA ============ */}
      {(media.video || media.photos.length > 0) && (
        <Box sx={{ background: 'linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)', py: { xs: 6, md: 9 } }}>
          <Container maxWidth="xl">
            <SectionHeading
              overline="Straight from our showroom"
              title="Real products. Real projects."
              subtitle="A look inside our warehouse and the installations we supply across Ethiopia."
            />
            <Grid container spacing={3} alignItems="stretch">
              {media.video && (
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 5,
                      overflow: 'hidden',
                      boxShadow: '0 24px 54px -18px rgba(5,36,64,.35)',
                      height: '100%',
                      minHeight: { xs: 260, md: 420 },
                      bgcolor: '#111827',
                    }}
                  >
                    <Box
                      component="video"
                      src={media.video.path}
                      poster={media.video.thumb_path || undefined}
                      controls
                      preload="none"
                      playsInline
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <Chip
                      icon={<PlayCircleFilledRoundedIcon sx={{ '&&': { color: '#fff' } }} />}
                      label="See us in action"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        color: '#fff',
                        fontWeight: 700,
                        bgcolor: 'rgba(4,29,51,.65)',
                        backdropFilter: 'blur(6px)',
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} md={media.video ? 5 : 12}>
                <Grid container spacing={1.5}>
                  {media.photos.slice(0, media.video ? 6 : 8).map((photo, i) => (
                    <Grid item xs={4} key={photo.id}>
                      <Box
                        component={RouterLink}
                        to="/gallery"
                        sx={{
                          display: 'block',
                          borderRadius: 3,
                          overflow: 'hidden',
                          position: 'relative',
                          aspectRatio: '1 / 1',
                          boxShadow: '0 4px 14px rgba(5,36,64,.12)',
                          '&:hover img': { transform: 'scale(1.06)' },
                        }}
                      >
                        <Box
                          component="img"
                          src={photo.thumb_path || photo.path}
                          alt={photo.title || 'Teddy showroom photo'}
                          loading="lazy"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s ease' }}
                        />
                        {i === (media.video ? 5 : 7) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: 'rgba(4,29,51,.55)',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 15,
                              textAlign: 'center',
                              px: 1,
                            }}
                          >
                            View full gallery →
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  component={RouterLink}
                  to="/gallery"
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 2.5, fontWeight: 700 }}
                >
                  Browse the Project Gallery
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      {/* ============ WHY US ============ */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          overline="Why Teddy General Trading"
          title="Built on trust, delivered with care"
        />
        <Grid container spacing={3}>
          {BENEFITS.map((benefit) => (
            <Grid item xs={12} sm={6} md={3} key={benefit.title}>
              <Card
                sx={{
                  p: 3.2,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all .25s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 16px 34px -12px rgba(9,45,76,.2)' },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '22px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg,#334155,#475569)',
                    color: '#fff',
                    boxShadow: '0 10px 18px -10px rgba(15,23,42,.55)',
                    '& svg': { fontSize: 30 },
                  }}
                >
                  {benefit.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {benefit.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.7 }}>
                  {benefit.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ LICENSES + SERVICES ============ */}
      <Box sx={{ background: 'linear-gradient(180deg,#FFFFFF 0%, #F8FAFC 100%)', py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <SectionHeading
            overline="Licensed Operations"
            title="Certified for both supply and construction"
            subtitle="We operate in both water-material supply and water-construction works, with documented certification for each line of service."
          />

          <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
            {SERVICE_LINES.map((service) => (
              <Grid item xs={12} md={6} key={service.title}>
                <Card sx={{ p: { xs: 2.5, md: 3.2 }, height: '100%' }}>
                  <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '18px',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        background: 'linear-gradient(135deg,#334155,#475569)',
                        flexShrink: 0,
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.7 }}>
                        {service.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.75 }}>
                        {service.text}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            {CERTIFICATE_PROOFS.map((proof) => {
              const src = publicAsset(`uploads/certificates/${proof.file}`);
              return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={proof.file}>
                <Card sx={{ p: 1.2, height: '100%' }}>
                  <Box
                    component="a"
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'block', textDecoration: 'none' }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={proof.label}
                      sx={{
                        width: '100%',
                        borderRadius: 2.5,
                        objectFit: 'cover',
                        aspectRatio: '4 / 5',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.1 }}>
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} />
                      <Typography sx={{ fontSize: 12.8, fontWeight: 600, color: 'text.secondary', lineHeight: 1.35 }}>
                        {proof.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ============ CTA ============ */}
      <Container maxWidth="xl" sx={{ pb: { xs: 7, md: 10 } }}>
        <Box
          sx={{
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(120deg,#111827,#1F2937 60%,#334155)',
            color: '#fff',
            px: { xs: 3.5, md: 8 },
            py: { xs: 5, md: 7 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(148,163,184,.3), transparent 65%)',
              top: -110,
              right: -60,
            }}
          />
          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative' }}>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 36 } }}>
                Need help choosing the right equipment?
              </Typography>
              <Typography sx={{ mt: 1.6, color: 'rgba(222,238,250,.85)', fontSize: 16.5, maxWidth: 560 }}>
                Tell us about your project — our engineers will size the pumps, pipes and filtration
                you need and prepare a same-day quotation. Free of charge.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Button
                component={RouterLink}
                to="/contact"
                size="large"
                variant="contained"
                sx={{
                  bgcolor: '#fff',
                  color: 'primary.dark',
                  fontWeight: 700,
                  px: 5,
                  py: 1.6,
                  fontSize: 16,
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Talk to an Expert
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
