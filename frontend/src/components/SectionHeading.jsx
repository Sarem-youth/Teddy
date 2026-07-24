import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SectionHeading({ overline, title, subtitle, align = 'center', sx }) {
  return (
    <Box sx={{ textAlign: align, mb: { xs: 4, md: 6 }, ...sx }}>
      {overline && (
        <Typography
          variant="overline"
          sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2.5, fontSize: 13 }}
        >
          {overline}
        </Typography>
      )}
      <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: 28, md: 38 } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, maxWidth: 640, mx: align === 'center' ? 'auto' : 0, fontSize: 17 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
