'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',             emoji: '🏠', label: '홈' },
  { href: '/estimate',     emoji: '🧮', label: '견적계산기' },
  { href: '/custom-order', emoji: '📝', label: '비규격주문' },
  { href: '/cart',         emoji: '🛒', label: '장바구니' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pink-100 safe-area-pb">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition ${
                active ? 'text-pink-500' : 'text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
