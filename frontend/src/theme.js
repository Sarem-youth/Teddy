import { createTheme, alpha } from '@mui/material/styles';

export const brand = {
  navy: '#062A45',
  deep: '#063B66',
  primary: '#0A5C9E',
  bright: '#1B8FE0',
  cyan: '#0891B2',
  aqua: '#22D3EE',
  mist: '#F2F7FB',
  gradient: 'linear-gradient(135deg, #052440 0%, #0A5C9E 55%, #0E7FB8 100%)',
  gradientSoft: 'linear-gradient(135deg, #0A5C9E 0%, #0891B2 100%)',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brand.primary, dark: brand.deep, light: brand.bright, contrastText: '#fff' },
    secondary: { main: brand.cyan, dark: '#066A82', light: brand.aqua, contrastText: '#fff' },
    background: { default: '#F5F8FB', paper: '#FFFFFF' },
    text: { primary: '#12283C', secondary: '#54708A' },
    success: { main: '#0E9F6E' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    divider: '#E3ECF3',
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
          boxShadow: '0 8px 20px -6px rgba(10,92,158,.45)',
          '&:hover': { boxShadow: '0 10px 24px -6px rgba(10,92,158,.55)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E7EFF6',
          boxShadow: '0 2px 12px rgba(9,45,76,.05)',
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
            color: '#3A5A76',
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
