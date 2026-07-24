import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

export default function QuantityPicker({ value, onChange, min = 1, max = 999, size = 'medium' }) {
  const btnSize = size === 'small' ? 30 : 38;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        overflow: 'hidden',
      }}
    >
      <IconButton
        size="small"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        sx={{ width: btnSize, height: btnSize, borderRadius: 0 }}
      >
        <RemoveRoundedIcon fontSize="small" />
      </IconButton>
      <Typography sx={{ width: 42, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        sx={{ width: btnSize, height: btnSize, borderRadius: 0 }}
      >
        <AddRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
