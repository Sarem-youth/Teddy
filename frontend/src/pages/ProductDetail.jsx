import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';

import api from '../api/client';
import Seo from '../components/Seo';
import LoadingScreen from '../components/LoadingScreen';
import ProductCard from '../components/ProductCard';
import QuantityPicker from '../components/QuantityPicker';
import EmptyState from '../components/EmptyState';
import { formatETB } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../context/SnackbarContext';

export default function ProductDetail() {
  const { identifier } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { notify } = useSnackbar();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const raw = String(identifier || '').trim();
    const routeProduct = location.state?.product;
    const routeMatches =
      routeProduct &&
      (String(routeProduct.id) === raw || String(routeProduct.slug || '').toLowerCase() === raw.toLowerCase());

    setProduct(null);
    setNotFound(false);
    setQuantity(1);
    setActiveImage(0);
    setTab(0);

    if (routeMatches) {
      setProduct(routeProduct);
    }

    api
      .get(`/products/${encodeURIComponent(raw)}`)
      .then(({ data }) => {
        setProduct(data.product);
        setRelated(data.related || []);
      })
      .catch(() => {
        if (!routeMatches) {
          setNotFound(true);
        }
      });
  }, [identifier, location.state]);

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          icon={<WaterDropRoundedIcon />}
          title="Product not found"
          subtitle="This product may have been removed or the link is incorrect."
          actionLabel="Back to Shop"
          actionTo="/shop"
        />
      </Container>
    );
  }

  if (!product) return <LoadingScreen label="Loading product…" />;

  const images = product.images?.length
    ? product.images
    : [{ id: 0, path: product.primary_image || null, alt_text: product.title }];
  const outOfStock = product.stock_quantity <= 0;
  const lowStock = !outOfStock && product.stock_quantity <= 5;
  const onSale =
    product.price_visible &&
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  const handleAdd = async () => {
    try {
      await addItem(product, quantity);
      notify(`Added ${quantity} × "${product.title}" to cart`);
    } catch {
      notify('Could not add to cart', 'error');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addItem(product, quantity);
      navigate('/cart');
    } catch {
      notify('Could not add to cart', 'error');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Seo
        title={product.meta_title || product.title}
        description={product.meta_description || product.short_description}
      />

      <Breadcrumbs sx={{ mb: 3, fontSize: 14 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/shop" color="inherit">
          Shop
        </Link>
        {product.category && (
          <Link component={RouterLink} to={`/shop?category=${product.category.slug}`} color="inherit">
            {product.category.name}
          </Link>
        )}
        <Typography color="text.primary" fontSize={14} fontWeight={600} noWrap sx={{ maxWidth: 260 }}>
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 3, md: 6 }}>
        {/* gallery */}
        <Grid item xs={12} md={6}>
          <Card sx={{ overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ pt: '75%', position: 'relative', bgcolor: '#EDF4FA' }}>
              {images[activeImage]?.path ? (
                <Box
                  component="img"
                  src={images[activeImage].path}
                  alt={images[activeImage].alt_text || product.title}
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <WaterDropRoundedIcon sx={{ fontSize: 110, color: 'primary.light', opacity: 0.5 }} />
                </Box>
              )}
              {onSale && (
                <Chip
                  color="error"
                  label={`Save ${formatETB(product.compare_at_price - product.price, { decimals: 0 })}`}
                  sx={{ position: 'absolute', top: 14, left: 14, fontWeight: 700 }}
                />
              )}
            </Box>
          </Card>
          {images.length > 1 && (
            <Stack direction="row" spacing={1.4} sx={{ mt: 1.6, flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <Box
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  sx={{
                    width: 74,
                    height: 74,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2.5px solid',
                    borderColor: idx === activeImage ? 'primary.main' : 'transparent',
                    opacity: idx === activeImage ? 1 : 0.7,
                    transition: 'all .2s',
                  }}
                >
                  <Box
                    component="img"
                    src={img.path}
                    alt={img.alt_text || `${product.title} ${idx + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* info */}
        <Grid item xs={12} md={6}>
          {product.category && (
            <Chip
              size="small"
              label={product.category.name}
              component={RouterLink}
              to={`/shop?category=${product.category.slug}`}
              clickable
              sx={{ mb: 1.6, bgcolor: 'rgba(8,145,178,.1)', color: 'secondary.dark' }}
            />
          )}
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 }, lineHeight: 1.25 }}>
            {product.title}
          </Typography>

          {product.sku && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              SKU: <b>{product.sku}</b>
            </Typography>
          )}

          {product.price_visible ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.6, mt: 2.4 }}>
                <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: 'primary.dark' }}>
                  {formatETB(product.price)}
                </Typography>
                {onSale && (
                  <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: 19 }}>
                    {formatETB(product.compare_at_price)}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                VAT computed at checkout
              </Typography>
            </>
          ) : (
            <Card sx={{ mt: 2.4, p: 2.2, bgcolor: '#F4F9FD', border: '1px dashed #BBD5EA' }}>
              <Typography sx={{ fontFamily: '"Sora",sans-serif', fontWeight: 700, color: 'primary.dark' }}>
                Exact price is revealed during checkout intent
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
                Select quantity, add your delivery city, and continue to review for a 20-minute live price lock.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.6 }}>
                Pricing tier: {product.price_band || 'Quoted'}
              </Typography>
            </Card>
          )}

          {product.short_description && (
            <Typography sx={{ mt: 2.4, color: 'text.secondary', lineHeight: 1.8 }}>
              {product.short_description}
            </Typography>
          )}

          <Box sx={{ mt: 2.6, display: 'flex', alignItems: 'center', gap: 1 }}>
            {outOfStock ? (
              <Chip icon={<CancelRoundedIcon />} label="Out of Stock" color="error" variant="outlined" />
            ) : (
              <Chip
                icon={<CheckCircleRoundedIcon />}
                label={lowStock ? `Only ${product.stock_quantity} left!` : 'In Stock'}
                color={lowStock ? 'warning' : 'success'}
                variant="outlined"
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              max={Math.max(product.stock_quantity, 1)}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartRoundedIcon />}
              disabled={outOfStock}
              onClick={handleAdd}
              sx={{ py: 1.5, px: 4, flex: { sm: 1 } }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FlashOnRoundedIcon />}
              disabled={outOfStock}
              onClick={handleBuyNow}
              sx={{ py: 1.5, px: 4 }}
            >
              Buy Now
            </Button>
          </Stack>

          <Card sx={{ mt: 3.5, p: 2.4, bgcolor: '#F4F9FD', border: '1px dashed #BBD5EA' }}>
            <Stack spacing={1.4}>
              <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'center' }}>
                <LocalShippingRoundedIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  Fast delivery in Addis Ababa — regional shipping available
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'center' }}>
                <VerifiedRoundedIcon color="primary" fontSize="small" />
                <Typography variant="body2">Genuine product with manufacturer warranty</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* details tabs */}
      <Card sx={{ mt: { xs: 5, md: 7 } }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label="Technical Details" sx={{ fontWeight: 700 }} />
          <Tab label="Delivery & Payment" sx={{ fontWeight: 700 }} />
        </Tabs>
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {tab === 0 &&
            (product.details ? (
              <Typography
                component="div"
                sx={{ whiteSpace: 'pre-line', lineHeight: 2, color: 'text.secondary', fontSize: 15.5 }}
              >
                {product.details}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                Detailed specifications will be added soon. Contact us for full technical data.
              </Typography>
            ))}
          {tab === 1 && (
            <Stack spacing={2}>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
                <b>Delivery:</b> Orders are dispatched within 1–2 business days. Delivery within
                Addis Ababa typically arrives in 24–48 hours; regional deliveries take 2–5 business
                days depending on your location.
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
                <b>Payment:</b> Pay conveniently via bank transfer (CBE / Telebirr) or cash on
                delivery. After placing your order, our team verifies payment and confirms your
                delivery schedule by phone.
              </Typography>
            </Stack>
          )}
        </Box>
      </Card>

      {/* related */}
      {related.length > 0 && (
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h4" sx={{ mb: 3.5, fontSize: { xs: 22, md: 28 } }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {related.map((p) => (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
