import { formatETB, formatDate, ORDER_STATUS, PAYMENT_METHOD } from './format';

/**
 * Opens a print-ready invoice window for an order (admin feature).
 * Pure client-side — uses the browser's print dialog (print or save as PDF).
 */
export default function printInvoice(order, settings = {}) {
  const storeName = settings.store_name || 'Teddy General Trading';
  const rows = (order.items || [])
    .map(
      (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(item.product_title)}</td>
          <td class="num">${formatETB(item.unit_price)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatETB(item.line_total)}</td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${escapeHtml(order.order_number)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #10283c; margin: 0; padding: 36px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0a5c9e; padding-bottom: 18px; }
  .brand { font-size: 24px; font-weight: 800; color: #052440; }
  .brand small { display: block; font-size: 12px; color: #0a5c9e; font-weight: 600; letter-spacing: 1.5px; }
  .meta { text-align: right; font-size: 13px; line-height: 1.7; }
  .badge { display: inline-block; padding: 3px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #e0f2fe; color: #075985; }
  h2 { font-size: 15px; letter-spacing: 1px; text-transform: uppercase; color: #0a5c9e; margin: 26px 0 8px; }
  .cols { display: flex; gap: 40px; }
  .cols div { font-size: 13.5px; line-height: 1.8; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .8px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 8px 10px; }
  td { padding: 10px; font-size: 13.5px; border-bottom: 1px solid #eef2f6; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-left: auto; margin-top: 14px; width: 300px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 5px 10px; }
  .totals .grand { border-top: 2px solid #0a5c9e; font-weight: 800; font-size: 16px; padding-top: 9px; color: #052440; }
  .foot { margin-top: 44px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; }
  @media print { body { padding: 12px 24px; } }
</style>
</head>
<body>
  <div class="head">
    <div class="brand">💧 ${escapeHtml(storeName)}<small>WATER MATERIALS & EQUIPMENT</small></div>
    <div class="meta">
      <strong style="font-size:17px">INVOICE</strong><br>
      ${escapeHtml(order.order_number)}<br>
      ${formatDate(order.created_at, true)}<br>
      <span class="badge">${escapeHtml(ORDER_STATUS[order.status] || order.status)}</span>
    </div>
  </div>

  <div class="cols">
    <div>
      <h2>Billed To</h2>
      ${escapeHtml(order.shipping_name)}<br>
      ${escapeHtml(order.shipping_phone)}<br>
      ${order.shipping_email ? escapeHtml(order.shipping_email) + '<br>' : ''}
      ${escapeHtml(order.shipping_address)}<br>
      ${escapeHtml(order.shipping_city)}${order.shipping_region ? ', ' + escapeHtml(order.shipping_region) : ''}
    </div>
    <div>
      <h2>Payment</h2>
      Method: ${escapeHtml(PAYMENT_METHOD[order.payment_method] || order.payment_method)}<br>
      Status: ${order.payment_status === 'confirmed' ? 'Paid ✔' : 'Pending verification'}<br>
      ${settings.store_phone ? 'Store: ' + escapeHtml(settings.store_phone) : ''}
    </div>
  </div>

  <h2>Order Items</h2>
  <table>
    <thead><tr><th>#</th><th>Item</th><th class="num">Unit Price</th><th class="num">Qty</th><th class="num">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${formatETB(order.subtotal)}</span></div>
    <div><span>Tax</span><span>${formatETB(order.tax)}</span></div>
    <div><span>Shipping</span><span>${Number(order.shipping_fee) === 0 ? 'FREE' : formatETB(order.shipping_fee)}</span></div>
    <div class="grand"><span>Grand Total</span><span>${formatETB(order.total)}</span></div>
  </div>

  <div class="foot">
    Thank you for your business! · ${escapeHtml(storeName)}
    ${settings.store_address ? ' · ' + escapeHtml(settings.store_address) : ''}
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
