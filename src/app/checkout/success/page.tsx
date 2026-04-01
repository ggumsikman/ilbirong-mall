'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const tossOrderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const method = searchParams.get('method')

    // 계좌이체 직접 완료 (이미 저장됨)
    if (method === 'transfer') {
      const id = searchParams.get('orderId') || ''
      setOrderId(id)
      setStatus('success')
      clearCart()
      return
    }

    // 토스페이먼츠 결제 확인
    if (!paymentKey || !tossOrderId || !amount) {
      setStatus('error')
      return
    }

    const pendingOrderStr = sessionStorage.getItem('pendingOrder')
    if (!pendingOrderStr) {
      setStatus('error')
      return
    }

    const pendingOrder = JSON.parse(pendingOrderStr)

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId: tossOrderId,
        amount: parseInt(amount),
        orderData: pendingOrder,
      }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setOrderId(result.orderId || tossOrderId)
          setStatus('success')
          clearCart()
          sessionStorage.removeItem('pendingOrder')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-bounce">💛</p>
          <p className="text-gray-500">결제를 확인하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-lg font-bold text-gray-700 mb-2">결제 처리에 실패했어요</p>
          <p className="text-gray-400 text-sm mb-6">잠시 후 다시 시도하거나 카카오톡으로 문의해주세요.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/checkout')} className="px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-xl font-bold text-sm">
              다시 시도
            </button>
            <Link href="/" className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold text-sm">
              홈으로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* 성공 아이콘 */}
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <span className="text-4xl">🎉</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">주문 완료!</h1>
        <p className="text-gray-500 text-sm mb-1">감사합니다 💛</p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-6">주문번호: {orderId.slice(0, 20)}...</p>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">📱</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">카카오톡으로 연락드릴게요</p>
              <p className="text-xs text-gray-400 mt-0.5">시안 확인 및 진행 상황을 안내해드립니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎨</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">시안 작업 2회 무료</p>
              <p className="text-xs text-gray-400 mt-0.5">이후 수정은 회당 3,000원이 추가됩니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">배송 안내</p>
              <p className="text-xs text-gray-400 mt-0.5">시안 확정 후 영업일 2~3일 내 발송됩니다.</p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="block w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">로딩 중...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
