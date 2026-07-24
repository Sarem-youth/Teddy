import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

export default function EmptyState({ icon, title, subtitle, actionLabel, actionTo, onAction }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, md: 10 },
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '28px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: '#fff',
          opacity: 0.9,
          '& svg': { fontSize: 42 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5">{title}</Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          {subtitle}
        </Typography>
      )}
      {actionLabel && (
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 1.5 }}
          component={actionTo ? RouterLink : 'button'}
          to={actionTo}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
