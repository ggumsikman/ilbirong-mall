'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'

interface OrderData {
  id: string
  customer_name: string
  product_type: string
  status: string
  draft_images: string[]
  revision_count: number
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<'idle' | 'approving' | 'revising' | 'done'>('idle')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [result, setResult] = useState<'approved' | 'revision_sent' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrder(data.order)
        else setError('주문을 찾을 수 없습니다.')
      })
      .catch(() => setError('오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    setAction('approving')
    const res = await fetch(`/api/orders/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    const data = await res.json()
    if (data.success) setResult('approved')
    else setError('처리에 실패했습니다.')
    setAction('done')
  }

  const handleRevision = async () => {
    if (!revisionNotes.trim()) { setError('수정 요청 내용을 입력해주세요.'); return }
    setAction('revising')
    const res = await fetch(`/api/orders/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revision', revision_notes: revisionNotes }),
    })
    const data = await res.json()
    if (data.success) setResult('revision_sent')
    else setError('처리에 실패했습니다.')
    setAction('done')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">시안을 불러오는 중...</p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (result === 'approved') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">시안 확정 완료!</h1>
          <p className="text-gray-500 text-sm">감사합니다! 확인 후 제작을 진행할게요. 💛</p>
          <p className="text-xs text-gray-400 mt-3">배송 관련 안내는 카카오톡으로 드립니다.</p>
        </div>
      </div>
    )
  }

  if (result === 'revision_sent') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">✉️</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">수정 요청 전달 완료!</h1>
          <p className="text-gray-500 text-sm">요청 내용을 확인하고 수정 시안을 보내드릴게요.</p>
          {order && order.revision_count > 2 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
              3차 이상 수정은 회당 3,000원이 추가됩니다.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-pink-400 to-orange-300 text-white py-5 px-4 text-center">
        <p className="text-sm opacity-80 mb-1">🌸 일비롱디자인</p>
        <h1 className="text-lg font-bold">시안 확인 요청드립니다</h1>
        <p className="text-sm opacity-80 mt-1">{order?.customer_name} 선생님</p>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">아래 시안을 확인해주세요!</p>
          <p>✅ 마음에 드시면 <strong>시안 확정</strong>을 눌러주세요.</p>
          <p className="mt-1">✏️ 수정이 필요하면 <strong>수정 요청</strong> 내용을 적어 보내주세요.</p>
          {order && order.revision_count > 0 && (
            <p className="mt-1 text-xs text-yellow-600">
              현재 {order.revision_count}차 수정 {order.revision_count >= 2 ? '(다음 수정부터 3,000원 추가)' : '(1회 무료 남음)'}
            </p>
          )}
        </div>

        {/* 시안 이미지 */}
        {order?.draft_images && order.draft_images.length > 0 ? (
          <div className="space-y-3">
            {order.draft_images.map((url, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <a href={url} target="_blank" rel="noreferrer">
                  <Image
                    src={url}
                    alt={`시안 ${i + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </a>
                <p className="text-xs text-center text-gray-400 py-2">시안 {i + 1} · 클릭하면 크게 볼 수 있어요</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
            <p className="text-3xl mb-2">🎨</p>
            <p className="text-sm">시안 이미지가 없습니다.</p>
          </div>
        )}

        {/* 수정 요청 입력 */}
        {action !== 'done' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3">✏️ 수정 요청 내용 (수정을 원하실 때만 작성)</p>
            <textarea
              value={revisionNotes}
              onChange={e => { setRevisionNotes(e.target.value); setError('') }}
              placeholder="수정을 원하시는 부분을 자세히 적어주세요.&#10;예) 기관명을 '일비롱유치원'으로 변경해주세요."
              rows={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )}

        {/* 버튼 */}
        {action !== 'done' && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!revisionNotes.trim()) handleApprove()
                else if (confirm('시안을 확정하시겠습니까? (작성하신 수정 내용은 전달되지 않습니다)')) handleApprove()
              }}
              disabled={action === 'approving' || action === 'revising'}
              className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {action === 'approving' ? '처리 중...' : '✅ 시안 확정'}
            </button>
            <button
              onClick={handleRevision}
              disabled={action === 'approving' || action === 'revising' || !revisionNotes.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {action === 'revising' ? '전달 중...' : '✏️ 수정 요청'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
