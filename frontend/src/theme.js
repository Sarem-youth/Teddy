import { createTheme, alpha } from '@mui/material/styles';

export const brand = {
  navy: '#1F2937',
  deep: '#111827',
  primary: '#334155',
  bright: '#64748B',
  cyan: '#475569',
  aqua: '#94A3B8',
  mist: '#F6F8FA',
  gradient: 'linear-gradient(135deg, #111827 0%, #334155 55%, #475569 100%)',
  gradientSoft: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brand.primary, dark: brand.deep, light: brand.bright, contrastText: '#fff' },
    secondary: { main: brand.cyan, dark: '#334155', light: brand.aqua, contrastText: '#fff' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#64748B' },
    success: { main: '#0E9F6E' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    divider: '#E2E8F0',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Sora", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18 },
        containedPrimary: {
          boxShadow: '0 4px 10px -4px rgba(15,23,42,.35)',
          '&:hover': { boxShadow: '0 6px 14px -4px rgba(15,23,42,.4)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15,23,42,.04)',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTextField: { defaultProps: { size: 'medium' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fff',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brand.primary },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: brand.mist,
            color: '#475569',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
});

export const glassSx = {
  backgroundColor: alpha('#ffffff', 0.08),
  border: `1px solid ${alpha('#ffffff', 0.18)}`,
  backdropFilter: 'blur(10px)',
};

export default theme;
