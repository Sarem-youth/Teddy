import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

import Seo from '../components/Seo';
import EmptyState from '../components/EmptyState';
import QuantityPicker from '../components/QuantityPicker';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatETB } from '../utils/format';

export default function CartPage() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Seo title="Shopping Cart" />
        <EmptyState
          icon={<ShoppingCartRoundedIcon />}
          title="Your cart is empty"
          subtitle="Browse our catalog of pumps, pipes, filters and more — your next project starts here."
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Seo title="Shopping Cart" />
      <Typography variant="h4" sx={{ mb: 3.5, fontSize: { xs: 26, md: 32 } }}>
        Shopping Cart
        <Typography component="span" color="text.secondary" sx={{ ml: 1.5, fontSize: 17 }}>
          ({totals.count} item{totals.count !== 1 ? 's' : ''})
        </Typography>
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            {items.map((item, idx) => (
              <Box key={item.id}>
                {idx > 0 && <Divider />}
                <Box sx={{ display: 'flex', gap: 2, p: { xs: 2, sm: 2.5 }, alignItems: 'center' }}>
                  <Box
                    component={RouterLink}
                    to={`/product/${item.product?.slug}`}
                    sx={{
                      width: { xs: 72, sm: 96 },
                      height: { xs: 72, sm: 96 },
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: '#EDF4FA',
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {item.product?.primary_image ? (
                      <Box
                        component="img"
                        src={item.product.primary_image}
                        alt={item.product.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <WaterDropRoundedIcon sx={{ color: 'primary.light', fontSize: 34 }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      component={RouterLink}
                      to={`/product/${item.product?.slug}`}
                      sx={{
                        fontWeight: 650,
                        color: 'text.primary',
                        textDecoration: 'none',
                        display: 'block',
                        fontSize: { xs: 14.5, sm: 16 },
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {item.product?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                      {formatETB(item.product?.price)} each
                    </Typography>
                    {item.product?.stock_quantity <= 5 && (
                      <Typography variant="caption" color="warning.main" fontWeight={700}>
                        Only {item.product.stock_quantity} in stock
                      </Typography>
                    )}
                    <Box
                      sx={{
                        mt: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <QuantityPicker
                        size="small"
                        value={item.quantity}
                        max={Math.max(item.product?.stock_quantity ?? 1, 1)}
                        onChange={(q) => updateQuantity(item, q)}
                      />
                      <Typography sx={{ fontWeight: 800, color: 'primary.dark' }}>
                        {formatETB(Number(item.product?.price ?? 0) * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>

                  <Tooltip title="Remove">
                    <IconButton onClick={() => removeItem(item)} aria-label="Remove item">
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Card>
          <Button component={RouterLink} to="/shop" sx={{ mt: 2.5 }} startIcon={<EastRoundedIcon sx={{ transform: 'rotate(180deg)' }} />}>
            Continue Shopping
          </Button>
        </Grid>

        {/* summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 90 }}>
            <Typography variant="h6" sx={{ mb: 2.4 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.4 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={700}>{formatETB(totals.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.4 }}>
              <Typography color="text.secondary">VAT ({totals.taxRate}%)</Typography>
              <Typography fontWeight={700}>{formatETB(totals.tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.4 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography fontWeight={700} color={totals.shipping === 0 ? 'success.main' : 'inherit'}>
                {totals.shipping === 0 ? 'FREE' : formatETB(totals.shipping)}
              </Typography>
            </Box>

            {totals.freeThreshold > 0 && totals.subtotal < totals.freeThreshold && (
              <Alert severity="info" sx={{ my: 1.5, borderRadius: 2.5, fontSize: 13 }}>
                Add {formatETB(totals.freeThreshold - totals.subtotal)} more for free shipping!
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.dark" sx={{ fontFamily: '"Sora",sans-serif' }}>
                {formatETB(totals.total)}
              </Typography>
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              endIcon={<EastRoundedIcon />}
              onClick={() => navigate(user ? '/checkout' : '/login', { state: { from: '/checkout' } })}
              sx={{ py: 1.5, fontSize: 16 }}
            >
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </Button>
            {!user && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.4, textAlign: 'center' }}>
                New here?{' '}
                <Typography component={RouterLink} to="/register" variant="caption" color="primary" fontWeight={700}>
                  Create an account
                </Typography>{' '}
                — it takes 30 seconds.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
