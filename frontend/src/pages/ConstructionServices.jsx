import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Link as RouterLink } from 'react-router-dom';

import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';

import Seo from '../components/Seo';
import SectionHeading from '../components/SectionHeading';
import { publicAsset } from '../utils/publicAsset';

const SERVICE_AREAS = [
  {
    icon: <WaterDropRoundedIcon />,
    title: 'Pipeline & Distribution Works',
    text: 'Execution support for water-line layouts, distribution routes and installation planning for site needs.',
  },
  {
    icon: <EngineeringRoundedIcon />,
    title: 'Pumping & Filtration Installations',
    text: 'Practical setup guidance for pumping stations, filtration assemblies and related water handling equipment.',
  },
  {
    icon: <ChecklistRoundedIcon />,
    title: 'Supply + Construction Coordination',
    text: 'Single-vendor coordination where certified materials and construction execution are planned together.',
  },
];

const CERTIFICATE_PROOFS = [
  {
    file: 'photo_2026-08-10_15-02-35.jpg',
    label: 'Supply & Construction License',
  },
  {
    file: 'photo_2026-08-10_15-02-46.jpg',
    label: 'Trade Registration Proof',
  },
  {
    file: 'photo_2026-08-10_15-02-53.jpg',
    label: 'Compliance Certificate',
  },
  {
    file: 'photo_2026-08-10_15-02-59.jpg',
    label: 'Construction Authorization Proof',
  },
  {
    file: 'photo_2026-08-10_15-03-09.jpg',
    label: 'Additional Certificate Record',
  },
];

export default function ConstructionServices() {
  return (
    <Box>
      <Seo
        title="Water Construction Services"
        description="Teddy General Trading provides licensed water construction services with supporting certificates and integrated supply coordination."
      />

      <Box sx={{ background: 'linear-gradient(120deg,#111827,#334155)', color: '#fff', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="xl">
          <Chip
            icon={<ConstructionRoundedIcon sx={{ color: '#CBD5E1 !important' }} />}
            label="Licensed Construction Services"
            sx={{ bgcolor: 'rgba(255,255,255,.14)', color: '#D6ECFF', mb: 2.2, fontWeight: 700 }}
          />
          <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 44 }, maxWidth: 780 }}>
            Water construction capability, backed by documented certification.
          </Typography>
          <Typography sx={{ mt: 2, color: 'rgba(222,238,250,.85)', maxWidth: 700, fontSize: 17, lineHeight: 1.8 }}>
            Teddy General Trading delivers both water-material supply and water-construction execution support.
            We coordinate these lines together to keep projects practical, compliant and easier to manage.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          overline="Service Scope"
          title="What we provide in construction"
          subtitle="Built to complement our core water-material supply operations."
        />

        <Grid container spacing={3} sx={{ mb: { xs: 5, md: 8 } }}>
          {SERVICE_AREAS.map((area) => (
            <Grid item xs={12} md={4} key={area.title}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg,#334155,#64748B)',
                    color: '#fff',
                    mb: 1.8,
                  }}
                >
                  {area.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {area.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.75 }}>
                  {area.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <SectionHeading
          overline="Documented Proof"
          title="Certificates for supply and construction"
          subtitle="Click any proof document to open full size."
        />

        <Grid container spacing={2}>
          {CERTIFICATE_PROOFS.map((proof) => {
            const src = publicAsset(`uploads/certificates/${proof.file}`);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={proof.file}>
                <Card sx={{ p: 1.2, height: '100%' }}>
                  <Box component="a" href={src} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', textDecoration: 'none' }}>
                    <Box
                      component="img"
                      src={src}
                      alt={proof.label}
                      sx={{
                        width: '100%',
                        borderRadius: 2.5,
                        objectFit: 'cover',
                        aspectRatio: '4 / 5',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.1 }}>
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} />
                      <Typography sx={{ fontSize: 12.8, fontWeight: 600, color: 'text.secondary', lineHeight: 1.35 }}>
                        {proof.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            borderRadius: 6,
            background: 'linear-gradient(120deg,#111827,#1F2937 65%,#334155)',
            color: '#fff',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Planning a water construction project?
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'rgba(222,238,250,.85)', maxWidth: 580, mx: 'auto' }}>
            Share scope, location and expected timeline. Our team will align supply and construction requirements in one response.
          </Typography>
          <Box sx={{ mt: 3.5, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/contact" variant="contained" size="large" sx={{ bgcolor: '#E2E8F0', color: '#0F172A', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#CBD5E1' } }}>
              Request Construction Quote
            </Button>
            <Button component={RouterLink} to="/shop" variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', px: 4, '&:hover': { borderColor: '#fff' } }}>
              Browse Materials
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
