import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendShopOrderNotification } from '@/lib/email'

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount, orderData } = await req.json()

    // 1. 토스페이먼츠 결제 승인 요청
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const tossData = await tossRes.json()

    if (!tossRes.ok) {
      console.error('Toss confirm failed:', tossData)
      return NextResponse.json({ success: false, error: tossData.message || '결제 승인 실패' }, { status: 400 })
    }

    // 2. 주문 저장
    const { data, error } = await supabase
      .from('shop_orders')
      .insert([{
        customer_name: orderData.customer_name,
        phone: orderData.phone,
        shipping_address: orderData.shipping_address || '',
        payment_method: orderData.payment_method || 'card',
        email: orderData.email || null,
        items: orderData.items || [],
        items_total: orderData.items_total || 0,
        shipping_fee: orderData.shipping_fee || 0,
        grand_total: orderData.grand_total || 0,
        toss_order_id: orderId,
        toss_payment_key: paymentKey,
        payment_status: 'paid',
        status: '접수',
        other_requests: orderData.other_requests || '',
      }])
      .select()
      .single()

    if (error) throw error

    sendShopOrderNotification(data).catch(console.error)

    return NextResponse.json({ success: true, orderId: data.id })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json({ success: false, error: '결제 처리에 실패했습니다.' }, { status: 500 })
  }
}
