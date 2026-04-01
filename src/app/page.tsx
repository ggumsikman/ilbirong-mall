'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import { CATEGORIES, getProductsByCategory } from '@/lib/products'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const products = getProductsByCategory(activeCategory)

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      <Header />

      {/* 히어로 배너 */}
      <div className="bg-gradient-to-br from-pink-400 via-pink-300 to-amber-300 text-white px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium opacity-90 mb-1">🌸 유아교육기관 전문 디자인</p>
          <h1 className="text-2xl font-bold leading-tight mb-2">
            선생님들을 위한<br />예쁜 디자인 한 곳에서! ✨
          </h1>
          <p className="text-sm opacity-80">현수막 · 배너 · 환경구성판 · 굿즈 · 디지털도안</p>
          <div className="flex gap-2 mt-4">
            <a
              href="/custom-order"
              className="bg-white/25 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/35 transition"
            >
              📝 비규격 주문하기
            </a>
            <a
              href="/estimate"
              className="bg-white/25 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/35 transition"
            >
              🧮 견적 계산기
            </a>
          </div>
        </div>
      </div>

      {/* 공지 배너 */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 text-sm text-pink-700 flex items-start gap-2">
          <span className="text-base mt-0.5">💛</span>
          <div>
            <span className="font-semibold">시안 작업 2회까지 무료!</span> 이후 회당 3,000원이 추가됩니다.
            비규격 사이즈는 견적계산기 또는 비규격 주문서를 이용해주세요.
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="max-w-2xl mx-auto px-4 mt-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>해당 카테고리에 상품이 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* 하단 업무 도구 카드 */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <h2 className="text-base font-bold text-gray-700 mb-3">⚙️ 업무 도구</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/estimate"
            className="bg-white rounded-2xl p-4 border border-amber-200 hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">🧮</p>
            <p className="font-bold text-gray-800 text-sm">견적 계산기</p>
            <p className="text-xs text-gray-400 mt-0.5">비규격 현수막 단가 계산</p>
          </a>
          <a
            href="/custom-order"
            className="bg-white rounded-2xl p-4 border border-purple-200 hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">📝</p>
            <p className="font-bold text-gray-800 text-sm">비규격 주문서</p>
            <p className="text-xs text-gray-400 mt-0.5">맞춤 제작 주문 접수</p>
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
