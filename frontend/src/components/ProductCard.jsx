import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

import { formatETB } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../context/SnackbarContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { notify } = useSnackbar();

  const outOfStock = product.stock_quantity <= 0;
  const onSale =
    product.price_visible &&
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product, 1);
      notify(`"${product.title}" added to cart`);
    } catch {
      notify('Could not add to cart', 'error');
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 28px -14px rgba(15,23,42,.28)',
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/product/${product.slug || product.id}`}
        state={{ product }}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative', pt: '72%', bgcolor: '#F1F5F9', overflow: 'hidden' }}>
          {product.primary_image ? (
            <Box
              component="img"
              src={product.primary_image}
              alt={product.images?.[0]?.alt_text || product.title}
              loading="lazy"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg,#33415522,#64748B33)',
              }}
            >
              <WaterDropRoundedIcon sx={{ fontSize: 64, color: 'primary.light', opacity: 0.6 }} />
            </Box>
          )}

          <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.8 }}>
            {onSale && <Chip size="small" color="error" label={`-${discount}%`} />}
            {product.is_featured && (
              <Chip size="small" label="Featured" sx={{ bgcolor: '#475569', color: '#fff' }} />
            )}
          </Box>
          {outOfStock && (
            <Chip
              size="small"
              label="Out of stock"
              sx={{ position: 'absolute', top: 10, right: 10, bgcolor: '#12283C', color: '#fff' }}
            />
          )}
        </Box>

        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {product.category && (
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
              {product.category.name}
            </Typography>
          )}
          <Typography
            sx={{
              fontWeight: 650,
              fontSize: 15.5,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 42,
            }}
          >
            {product.title}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              {product.price_visible ? (
                <>
                  <Typography sx={{ fontWeight: 800, color: 'primary.dark', fontSize: 17 }}>
                    {formatETB(product.price, { decimals: 0 })}
                  </Typography>
                  {onSale && (
                    <Typography
                      variant="caption"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      {formatETB(product.compare_at_price, { decimals: 0 })}
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 800, color: 'primary.dark', fontSize: 15.5 }}>
                    Price revealed at checkout
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.price_band || 'Quoted'} tier
                  </Typography>
                </>
              )}
            </Box>
            <Tooltip title={outOfStock ? 'Out of stock' : 'Add to cart'}>
              <span>
                <IconButton
                  color="primary"
                  disabled={outOfStock}
                  onClick={handleAdd}
                  aria-label={`Add ${product.title} to cart`}
                  sx={{
                    bgcolor: 'rgba(51,65,85,.1)',
                    '&:hover': { bgcolor: 'primary.main', color: '#fff' },
                  }}
                >
                  <AddShoppingCartRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
