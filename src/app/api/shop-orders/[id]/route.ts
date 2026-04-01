import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('shop_orders').select('*').eq('id', id).single()
    if (error) throw error
    return NextResponse.json({ success: true, order: data })
  } catch {
    return NextResponse.json({ success: false, error: '주문을 찾을 수 없습니다.' }, { status: 404 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData: Record<string, unknown> = {}
    const allowed = ['status', 'payment_status', 'toss_payment_key']
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }

    const { data, error } = await supabase.from('shop_orders').update(updateData).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, order: data })
  } catch {
    return NextResponse.json({ success: false, error: '업데이트에 실패했습니다.' }, { status: 500 })
  }
}
