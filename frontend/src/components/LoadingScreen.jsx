import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

export default function LoadingScreen({ label = 'Loading…' }) {
  return (
    <Box
      sx={{
        minHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress size={56} thickness={3} />
        <WaterDropRoundedIcon
          color="primary"
          sx={{ position: 'absolute', inset: 0, m: 'auto', fontSize: 26 }}
        />
      </Box>
      <Typography color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
    </Box>
  );
}
