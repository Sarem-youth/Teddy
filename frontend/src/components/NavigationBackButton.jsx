import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export default function NavigationBackButton({
  fallbackTo = '/',
  label = 'Back',
  hideOn = [],
  variant = 'text',
  sticky = false,
  stickyTop = 12,
  sx,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (hideOn.includes(location.pathname)) {
    return null;
  }

  const goBack = () => {
    const index = window.history.state?.idx;

    if (typeof index === 'number' && index > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  const button = (
    <Button
      onClick={goBack}
      startIcon={<ArrowBackRoundedIcon />}
      variant={variant}
      sx={[
        { minWidth: 0, px: 1, width: sticky ? { xs: '100%', sm: 'auto' } : 'auto' },
        sx,
      ]}
    >
      {label}
    </Button>
  );

  if (!sticky) {
    return button;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: stickyTop, sm: stickyTop + 4 },
        zIndex: 3,
        display: 'inline-flex',
        width: { xs: '100%', sm: 'auto' },
        alignSelf: 'flex-start',
      }}
    >
      {button}
    </Box>
  );
}