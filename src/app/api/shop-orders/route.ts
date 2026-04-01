import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendShopOrderNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('shop_orders')
      .insert([{
        customer_name: body.customer_name,
        phone: body.phone,
        shipping_address: body.shipping_address || '',
        payment_method: body.payment_method,
        receipt_type: body.receipt_type || null,
        business_number: body.business_number || null,
        email: body.email || null,
        items: body.items || [],
        items_total: body.items_total || 0,
        shipping_fee: body.shipping_fee || 0,
        grand_total: body.grand_total || 0,
        toss_order_id: body.toss_order_id || null,
        toss_payment_key: body.toss_payment_key || null,
        payment_status: body.payment_status || 'pending',
        status: '접수',
        other_requests: body.other_requests || '',
      }])
      .select()
      .single()

    if (error) throw error

    sendShopOrderNotification(data).catch(console.error)

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error('Shop order creation error:', error)
    return NextResponse.json({ success: false, error: '주문 접수에 실패했습니다.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('shop_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, orders: data })
  } catch (error) {
    console.error('Shop orders fetch error:', error)
    return NextResponse.json({ success: false, error: '주문 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}
