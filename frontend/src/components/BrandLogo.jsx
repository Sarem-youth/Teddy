import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

export default function BrandLogo({ light = false, compact = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '14px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #334155, #64748B)',
          boxShadow: '0 6px 14px -6px rgba(15,23,42,.45)',
          color: '#fff',
        }}
      >
        <WaterDropRoundedIcon sx={{ fontSize: 24 }} />
      </Box>
      {!compact && (
        <Box sx={{ lineHeight: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontWeight: 800,
              fontSize: 18,
              color: light ? '#fff' : 'primary.dark',
              letterSpacing: 0.2,
            }}
          >
            TEDDY
          </Typography>
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: 1.8,
              color: light ? 'rgba(255,255,255,.75)' : 'text.secondary',
              textTransform: 'uppercase',
            }}
          >
            General Trading
          </Typography>
        </Box>
      )}
    </Box>
  );
}
