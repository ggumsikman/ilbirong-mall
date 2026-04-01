'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function FailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMsg = searchParams.get('message')

  const messages: Record<string, string> = {
    'PAY_PROCESS_CANCELED': '결제가 취소되었어요.',
    'PAY_PROCESS_ABORTED': '결제가 중단되었어요.',
    'REJECT_CARD_COMPANY': '카드사에서 결제가 거절되었어요.',
  }

  const displayMsg = errorCode ? (messages[errorCode] ?? errorMsg ?? '결제에 실패했어요.') : '결제에 실패했어요.'

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <p className="text-6xl mb-4">😅</p>
        <h1 className="text-xl font-bold text-gray-700 mb-2">결제 실패</h1>
        <p className="text-gray-500 text-sm mb-6">{displayMsg}</p>
        {errorCode && (
          <p className="text-xs text-gray-400 mb-6">오류코드: {errorCode}</p>
        )}
        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="flex-1 py-3.5 border-2 border-pink-500 text-pink-500 rounded-xl font-bold text-sm hover:bg-pink-50 transition"
          >
            다시 결제하기
          </Link>
          <Link
            href="/"
            className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-bold text-sm hover:opacity-90 transition"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">로딩 중...</p>
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}
