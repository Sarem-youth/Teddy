import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';

import api, { apiError } from '../../api/client';
import Seo from '../../components/Seo';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/format';
import { useSnackbar } from '../../context/SnackbarContext';

export default function Messages() {
  const { notify } = useSnackbar();
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setResult(null);
    api
      .get('/admin/messages', { params: { filter: filter === 'unread' ? 'unread' : undefined, page } })
      .then(({ data }) => setResult(data))
      .catch(() => setResult({ data: [], last_page: 1, total: 0 }));
  }, [filter, page]);

  useEffect(load, [load]);

  const markRead = async (message) => {
    try {
      await api.put(`/admin/messages/${message.id}/read`);
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  const remove = async (message) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await api.delete(`/admin/messages/${message.id}`);
      notify('Inquiry deleted');
      load();
    } catch (err) {
      notify(apiError(err), 'error');
    }
  };

  return (
    <Box>
      <Seo title="Customer Inquiries" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Inquiries
          {result && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: 16 }}>
              ({result.total})
            </Typography>
          )}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, v) => {
            if (v) {
              setFilter(v);
              setPage(1);
            }
          }}
        >
          <ToggleButton value="all" sx={{ px: 2.4 }}>
            All
          </ToggleButton>
          <ToggleButton value="unread" sx={{ px: 2.4 }}>
            Unread
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!result ? (
        <Skeleton variant="rounded" height={380} sx={{ borderRadius: 4 }} />
      ) : result.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MarkEmailUnreadRoundedIcon />}
            title="No inquiries"
            subtitle={filter === 'unread' ? 'You have read everything. Nice work!' : 'Messages from the Contact Us form will appear here.'}
          />
        </Card>
      ) : (
        <>
          {result.data.map((message) => (
            <Accordion
              key={message.id}
              disableGutters
              onChange={(_, expanded) => {
                if (expanded && !message.is_read) markRead(message);
              }}
              sx={{
                mb: 1.4,
                borderRadius: '14px !important',
                border: '1px solid',
                borderColor: message.is_read ? 'divider' : 'primary.light',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                bgcolor: message.is_read ? '#fff' : 'rgba(10,92,158,.035)',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6, flex: 1, minWidth: 0, pr: 1 }}>
                  {!message.is_read && <Chip size="small" color="primary" label="NEW" sx={{ height: 20 }} />}
                  <Typography fontWeight={message.is_read ? 500 : 750} noWrap sx={{ flexShrink: 0, maxWidth: 180 }}>
                    {message.name}
                  </Typography>
                  <Typography color="text.secondary" fontSize={14} noWrap sx={{ flex: 1 }}>
                    {message.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {formatDate(message.created_at)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.4 }}>
                  From: <b>{message.name}</b> &lt;{message.email}&gt; · {formatDate(message.created_at, true)}
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.85, mb: 2 }}>
                  {message.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<MarkEmailReadRoundedIcon />}
                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                  >
                    Reply by Email
                  </Button>
                  <Tooltip title="Delete inquiry">
                    <IconButton size="small" color="error" onClick={() => remove(message)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          {result.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={result.last_page} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
