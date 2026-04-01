'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const { totalCount } = useCart()

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-pink-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <div>
            <p className="text-base font-bold text-pink-600 leading-none">일비롱디자인</p>
            <p className="text-[10px] text-amber-500 leading-none font-medium">유아교육기관 전문 디자인</p>
          </div>
        </Link>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <Link
            href="/estimate"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition"
            title="견적 계산기"
          >
            <span>🧮</span>
            <span className="hidden sm:inline">견적계산기</span>
          </Link>
          <Link
            href="/custom-order"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition"
            title="비규격 주문"
          >
            <span>📝</span>
            <span className="hidden sm:inline">비규격주문</span>
          </Link>
          <Link
            href="/cart"
            className="relative p-2 rounded-xl text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition"
            title="장바구니"
          >
            <span className="text-xl">🛒</span>
            {totalCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 badge-pop">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
