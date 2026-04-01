import nodemailer from 'nodemailer'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ilbirong.vercel.app'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendShopOrderNotification(order: any) {
  const itemsHtml = order.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          ${item.product.name}
          ${item.selectedSizeOption ? ` (${item.selectedSizeOption.name})` : ''}
          ${item.selectedVariant ? ` · ${item.selectedVariant.name}` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}개</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${(item.unitPrice * item.quantity).toLocaleString()}원</td>
      </tr>
    `).join('')

  await transporter.sendMail({
    from: `"일비롱디자인 주문알림" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[일비롱몰] 새 주문 - ${order.customer_name} 고객님 / ${order.grand_total.toLocaleString()}원`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#f472b6,#fb923c);padding:20px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:18px;">🛍️ 새 주문이 들어왔어요!</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px;">
          <p><strong>고객명:</strong> ${order.customer_name} (${order.phone})</p>
          <p><strong>배송주소:</strong> ${order.shipping_address}</p>
          <p><strong>결제방법:</strong> ${order.payment_method}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;font-size:13px;">상품</th>
                <th style="padding:8px 12px;text-align:center;font-size:13px;">수량</th>
                <th style="padding:8px 12px;text-align:right;font-size:13px;">금액</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-top:12px;padding-top:12px;border-top:2px solid #e5e7eb;">
            <p style="margin:4px 0;font-size:14px;">상품합계: ${order.items_total.toLocaleString()}원</p>
            <p style="margin:4px 0;font-size:14px;">배송비: ${order.shipping_fee.toLocaleString()}원</p>
            <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#ec4899;">총 결제금액: ${order.grand_total.toLocaleString()}원</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af;">
            관리자 페이지: <a href="${BASE_URL}/admin">${BASE_URL}/admin</a>
          </p>
        </div>
      </div>
    `,
  })
}

// 기존 커스텀 주문 알림도 유지
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderNotification(order: any) {
  await transporter.sendMail({
    from: `"일비롱디자인 주문시스템" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[일비롱디자인] 새 비규격 주문 - ${order.customer_name} 고객님`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#ec4899,#a855f7);padding:20px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:18px;">비규격 주문이 접수되었습니다!</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px;">
          <p><strong>고객명:</strong> ${order.customer_name} (${order.phone})</p>
          <p><strong>제품:</strong> ${order.product_type}</p>
          <p><strong>사이즈:</strong> ${order.width_cm}×${order.height_cm}cm</p>
          <p><strong>배송주소:</strong> ${order.shipping_address}</p>
          <p><strong>결제방법:</strong> ${order.payment_method}</p>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af;">
            관리자 페이지: <a href="${BASE_URL}/admin">${BASE_URL}/admin</a>
          </p>
        </div>
      </div>
    `,
  })
}
