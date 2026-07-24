import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';

import Seo from '../components/Seo';
import SectionHeading from '../components/SectionHeading';
import { useSettings } from '../context/SettingsContext';

const VALUES = [
  {
    icon: <VerifiedRoundedIcon />,
    title: 'Quality First',
    text: 'Every product we stock is sourced from certified manufacturers and inspected before it reaches your site.',
  },
  {
    icon: <HandshakeRoundedIcon />,
    title: 'Honest Partnership',
    text: 'Transparent ETB pricing, honest stock levels and dependable delivery promises — no surprises.',
  },
  {
    icon: <EngineeringRoundedIcon />,
    title: 'Technical Expertise',
    text: 'Our engineers help you size pumps, design piping runs and select filtration that actually fits your need.',
  },
  {
    icon: <RocketLaunchRoundedIcon />,
    title: 'Growing With Ethiopia',
    text: 'From households to mega irrigation projects, we grow alongside the nation\'s water infrastructure.',
  },
];

export default function About() {
  const { settings } = useSettings();

  return (
    <Box>
      <Seo
        title="About Us"
        description="Teddy General Trading — over a decade supplying Ethiopia with certified water pumps, filtration, pipes, valves and irrigation systems."
      />

      <Box sx={{ background: 'linear-gradient(120deg,#052440,#0A5C9E)', color: '#fff', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 44 }, maxWidth: 720 }}>
            Powering Ethiopia's water infrastructure, one project at a time.
          </Typography>
          <Typography sx={{ mt: 2, color: 'rgba(222,238,250,.85)', maxWidth: 640, fontSize: 17, lineHeight: 1.8 }}>
            {settings.about_text ||
              'Teddy General Trading supplies premium water pumps, filtration systems, pipes, valves and specialized fittings for homes, farms and industry across Ethiopia.'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={3} sx={{ mb: { xs: 5, md: 8 } }}>
          {[
            ['10+', 'Years in Business'],
            ['2,500+', 'Completed Supply Projects'],
            ['500+', 'Products in Catalog'],
            ['13', 'Regions Served'],
          ].map(([num, label]) => (
            <Grid item xs={6} md={3} key={label}>
              <Card sx={{ p: 3.4, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, fontSize: { xs: 30, md: 40 }, color: 'primary.main' }}>
                  {num}
                </Typography>
                <Typography color="text.secondary" fontWeight={600} sx={{ fontSize: 14.5 }}>
                  {label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <SectionHeading overline="Our Values" title="What we stand for" />
        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid item xs={12} sm={6} md={3} key={v.title}>
              <Card sx={{ p: 3.2, height: '100%' }}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    mb: 2,
                    borderRadius: '20px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg,#0A5C9E,#0891B2)',
                    color: '#fff',
                  }}
                >
                  {v.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {v.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.75 }}>
                  {v.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 5, md: 8 },
            borderRadius: 6,
            background: 'linear-gradient(120deg,#052440,#0A5C9E 65%,#0891B2)',
            color: '#fff',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Ready to start your project?
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'rgba(222,238,250,.85)', maxWidth: 520, mx: 'auto' }}>
            Browse our full catalog or talk to our team for a customized quotation.
          </Typography>
          <Box sx={{ mt: 3.5, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/shop" variant="contained" size="large" sx={{ bgcolor: '#22D3EE', color: '#062A45', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#4FDFF5' } }}>
              Browse Catalog
            </Button>
            <Button component={RouterLink} to="/contact" variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', px: 4, '&:hover': { borderColor: '#fff' } }}>
              Contact Sales
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
