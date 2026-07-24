import Container from '@mui/material/Container';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import Seo from '../components/Seo';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Seo title="Page Not Found" />
      <EmptyState
        icon={<SearchOffRoundedIcon />}
        title="404 — Page not found"
        subtitle="The page you're looking for doesn't exist or may have moved."
        actionLabel="Back to Home"
        actionTo="/"
      />
    </Container>
  );
}
