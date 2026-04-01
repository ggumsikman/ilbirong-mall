import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 고객이 시안 검토 후 확정 or 수정 요청을 보내는 엔드포인트
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, revision_notes } = body

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: '시안 확정' })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ success: true, order: data })
    }

    if (action === 'revision') {
      // 수정 횟수 먼저 조회
      const { data: current, error: fetchErr } = await supabase
        .from('orders').select('revision_count').eq('id', id).single()
      if (fetchErr) throw fetchErr

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: '시안 수정 요청',
          revision_notes: revision_notes || '',
          revision_count: (current.revision_count || 0) + 1,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ success: true, order: data })
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 action입니다.' }, { status: 400 })
  } catch (error) {
    console.error('Respond error:', error)
    return NextResponse.json({ success: false, error: '처리에 실패했습니다.' }, { status: 500 })
  }
}
