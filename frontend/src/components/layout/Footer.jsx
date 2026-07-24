import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

import BrandLogo from '../BrandLogo';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <Box component="footer" sx={{ mt: 'auto', bgcolor: '#062A45', color: '#B9CEDF' }}>
      {/* wave divider */}
      <Box sx={{ lineHeight: 0, bgcolor: 'background.default' }}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ width: '100%', height: 54, display: 'block' }}>
          <path
            d="M0,32 C240,72 480,0 720,24 C960,48 1200,64 1440,28 L1440,70 L0,70 Z"
            fill="#062A45"
          />
        </svg>
      </Box>

      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <BrandLogo light />
            <Typography sx={{ mt: 2.5, fontSize: 14.5, lineHeight: 1.8, maxWidth: 340 }}>
              {settings.store_tagline ||
                'Your trusted partner for water pumps, filtration systems, pipes, valves and specialized water materials across Ethiopia.'}
            </Typography>
            <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
              {settings.facebook_url && (
                <IconButton
                  size="small"
                  component="a"
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  sx={{ bgcolor: 'rgba(255,255,255,.08)', color: '#fff', '&:hover': { bgcolor: '#1B8FE0' } }}
                >
                  <FacebookRoundedIcon fontSize="small" />
                </IconButton>
              )}
              {settings.telegram_url && (
                <IconButton
                  size="small"
                  component="a"
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Telegram"
                  sx={{ bgcolor: 'rgba(255,255,255,.08)', color: '#fff', '&:hover': { bgcolor: '#229ED9' } }}
                >
                  <TelegramIcon fontSize="small" />
                </IconButton>
              )}
              {settings.whatsapp_number && (
                <IconButton
                  size="small"
                  component="a"
                  href={`https://wa.me/${String(settings.whatsapp_number).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener"
                  aria-label="WhatsApp"
                  sx={{ bgcolor: 'rgba(255,255,255,.08)', color: '#fff', '&:hover': { bgcolor: '#25D366' } }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2, fontFamily: '"Sora",sans-serif' }}>
              Shop
            </Typography>
            {[
              { label: 'All Products', to: '/shop' },
              { label: 'Valves & Controls', to: '/shop?category=valves-controls' },
              { label: 'Bathroom & Sanitary', to: '/shop?category=bathroom-sanitary' },
              { label: 'Pipes & Fittings', to: '/shop?category=pipes-fittings' },
              { label: 'Water Meters', to: '/shop?category=water-meters' },
            ].map((l) => (
              <Link
                key={l.label}
                component={RouterLink}
                to={l.to}
                sx={{ display: 'block', color: '#B9CEDF', fontSize: 14, mb: 1.2, '&:hover': { color: '#fff' } }}
              >
                {l.label}
              </Link>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2, fontFamily: '"Sora",sans-serif' }}>
              Company
            </Typography>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Project Gallery', to: '/gallery' },
              { label: 'Contact', to: '/contact' },
              { label: 'My Account', to: '/account' },
              { label: 'My Orders', to: '/account/orders' },
              { label: 'Cart', to: '/cart' },
            ].map((l) => (
              <Link
                key={l.label}
                component={RouterLink}
                to={l.to}
                sx={{ display: 'block', color: '#B9CEDF', fontSize: 14, mb: 1.2, '&:hover': { color: '#fff' } }}
              >
                {l.label}
              </Link>
            ))}
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2, fontFamily: '"Sora",sans-serif' }}>
              Get in Touch
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.6, alignItems: 'flex-start' }}>
              <PlaceRoundedIcon sx={{ fontSize: 20, mt: 0.3, color: '#22D3EE' }} />
              <Typography sx={{ fontSize: 14, lineHeight: 1.7 }}>
                {settings.store_address || 'Addis Ababa, Ethiopia'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.6, alignItems: 'center' }}>
              <CallRoundedIcon sx={{ fontSize: 20, color: '#22D3EE' }} />
              <Link href={`tel:${settings.store_phone || ''}`} sx={{ fontSize: 14, color: '#B9CEDF' }}>
                {settings.store_phone || '+251 — — —'}
              </Link>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <EmailRoundedIcon sx={{ fontSize: 20, color: '#22D3EE' }} />
              <Link href={`mailto:${settings.store_email || ''}`} sx={{ fontSize: 14, color: '#B9CEDF' }}>
                {settings.store_email || 'info@teddytrading.com'}
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3.5, borderColor: 'rgba(255,255,255,.1)' }} />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13 }}>
            © {new Date().getFullYear()} {settings.store_name || 'Teddy General Trading'}. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(185,206,223,.6)' }}>
            Secure payments · Bank Transfer &amp; Cash on Delivery
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
