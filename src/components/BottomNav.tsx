'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { totalCount } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pink-100 safe-area-pb">
      <div className="max-w-2xl mx-auto grid grid-cols-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
            pathname === '/' ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <span className="text-xl leading-none">🏠</span>
          <span className="font-medium">홈</span>
        </Link>
        <Link
          href="/cart"
          className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
            pathname.startsWith('/cart') ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <span className="relative inline-block text-xl leading-none">
            🛒
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </span>
          <span className="font-medium">장바구니</span>
        </Link>
      </div>
    </nav>
  )
}
