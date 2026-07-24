import Chip from '@mui/material/Chip';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/format';

export function OrderStatusChip({ status, size = 'small' }) {
  const meta = ORDER_STATUS[status] || { label: status, color: 'default' };
  return <Chip size={size} label={meta.label} color={meta.color} variant="outlined" />;
}

export function PaymentStatusChip({ status, size = 'small' }) {
  const meta = PAYMENT_STATUS[status] || { label: status, color: 'default' };
  return <Chip size={size} label={meta.label} color={meta.color} variant="outlined" />;
}
