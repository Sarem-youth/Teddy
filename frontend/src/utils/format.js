export function formatETB(value, { decimals = 2 } = {}) {
  const num = Number(value ?? 0);
  return (
    'ETB ' +
    num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  const d = new Date(value);
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-US', opts);
}

export const ORDER_STATUS = {
  pending_verification: { label: 'Pending Verification', color: 'warning' },
  processing: { label: 'Processing', color: 'info' },
  shipped: { label: 'Shipped', color: 'secondary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export const PAYMENT_METHOD = {
  cash_on_delivery: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
};

export const PAYMENT_STATUS = {
  pending: { label: 'Payment Pending', color: 'warning' },
  confirmed: { label: 'Payment Confirmed', color: 'success' },
};
