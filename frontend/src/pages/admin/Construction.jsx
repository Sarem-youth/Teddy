import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Link as RouterLink } from 'react-router-dom';

import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import Seo from '../../components/Seo';
import { publicAsset } from '../../utils/publicAsset';

const CERTIFICATE_PROOFS = [
  { file: 'photo_2026-08-10_15-02-35.jpg', label: 'Supply & Construction License' },
  { file: 'photo_2026-08-10_15-02-46.jpg', label: 'Trade Registration Proof' },
  { file: 'photo_2026-08-10_15-02-53.jpg', label: 'Compliance Certificate' },
  { file: 'photo_2026-08-10_15-02-59.jpg', label: 'Construction Authorization Proof' },
  { file: 'photo_2026-08-10_15-03-09.jpg', label: 'Additional Certificate Record' },
];

export default function AdminConstruction() {
  return (
    <Box>
      <Seo title="Construction Operations" />

      <Card
        sx={{
          p: { xs: 2.5, md: 3.2 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(120deg,#111827,#1F2937 65%,#334155)',
          color: '#fff',
        }}
      >
        <Chip
          icon={<ConstructionRoundedIcon sx={{ color: '#CBD5E1 !important' }} />}
          label="Admin Construction Workspace"
          sx={{ bgcolor: 'rgba(255,255,255,.14)', color: '#E2E8F0', mb: 1.6, fontWeight: 700 }}
        />
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 } }}>
          Construction Operations
        </Typography>
        <Typography sx={{ mt: 1.2, color: 'rgba(226,232,240,.86)', maxWidth: 860 }}>
          This admin page is separate from the public construction page. Use it to manage construction
          workflow steps, proof documents, and related storefront/admin actions.
        </Typography>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
              <AssignmentRoundedIcon color="primary" />
              <Typography variant="h6">Lead Intake</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.7, mb: 1.8 }}>
              Review incoming construction-related inquiries and keep follow-up centralized.
            </Typography>
            <Button component={RouterLink} to="/admin/messages" variant="outlined" fullWidth>
              Open Inquiries
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
              <Inventory2RoundedIcon color="primary" />
              <Typography variant="h6">Supply Alignment</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.7, mb: 1.8 }}>
              Validate product availability and ensure materials match each construction scope.
            </Typography>
            <Button component={RouterLink} to="/admin/products" variant="outlined" fullWidth>
              Manage Products
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
              <FactCheckRoundedIcon color="primary" />
              <Typography variant="h6">Storefront Content</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.7, mb: 1.8 }}>
              Keep construction copy, certificates and gallery assets current across public pages.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button component={RouterLink} to="/admin/settings" variant="outlined" fullWidth>
                Update Settings
              </Button>
              <Button component={RouterLink} to="/admin/media" variant="outlined" fullWidth startIcon={<CollectionsRoundedIcon />}>
                Manage Media
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: { xs: 2, md: 2.6 } }}>
        <Typography variant="h6" sx={{ mb: 1.4 }}>
          Construction Certificate Proofs
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2.2, fontSize: 14.5 }}>
          These are the files currently displayed for public trust proof.
        </Typography>

        <Grid container spacing={2}>
          {CERTIFICATE_PROOFS.map((proof) => {
            const src = publicAsset(`uploads/certificates/${proof.file}`);
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={proof.file}>
                <Card sx={{ p: 1.1, height: '100%' }}>
                  <Box component="a" href={src} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', textDecoration: 'none' }}>
                    <Box
                      component="img"
                      src={src}
                      alt={proof.label}
                      sx={{
                        width: '100%',
                        borderRadius: 2,
                        objectFit: 'cover',
                        aspectRatio: '4 / 5',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 1 }}>
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', lineHeight: 1.35 }}>
                        {proof.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </Box>
  );
}
