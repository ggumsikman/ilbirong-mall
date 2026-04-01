'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function CartPage() {
  const { items, removeItem, updateQty, itemsTotal, shippingFee, grandTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 pb-24">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-20 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-xl font-bold text-gray-700 mb-2">장바구니가 비어있어요</p>
          <p className="text-gray-400 mb-6">마음에 드는 상품을 담아보세요!</p>
          <Link
            href="/"
            className="inline-block bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            쇼핑하러 가기
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-36">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          🛒 장바구니 <span className="text-pink-500 text-lg">({items.length}종)</span>
        </h1>

        {/* 상품 목록 */}
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.cartItemId} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3">
                {/* 썸네일 */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-none bg-gray-100">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{item.product.name}</p>
                  {item.selectedSizeOption && (
                    <p className="text-xs text-gray-500 mt-0.5">사이즈: {item.selectedSizeOption.name}</p>
                  )}
                  {item.selectedVariant && (
                    <p className="text-xs text-gray-500">옵션: {item.selectedVariant.name}</p>
                  )}
                  {item.institutionName && (
                    <p className="text-xs text-teal-600 mt-0.5">기관명: {item.institutionName}</p>
                  )}
                  {item.textChange && item.textChange !== 'x' && (
                    <p className="text-xs text-purple-500 truncate mt-0.5">문구: {item.textChange}</p>
                  )}
                </div>

                {/* 삭제 */}
                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-gray-300 hover:text-red-400 transition text-xl flex-none mt-0.5"
                >
                  ×
                </button>
              </div>

              {/* 수량 + 금액 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold flex items-center justify-center transition"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold text-pink-600">
                  {(item.unitPrice * item.quantity).toLocaleString()}원
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 금액 요약 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-700 mb-3">💰 결제 예상 금액</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>상품 금액</span>
              <span>{itemsTotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>배송비</span>
              <span className={shippingFee === 0 ? 'text-teal-500 font-medium' : ''}>
                {shippingFee === 0 ? '무료' : `+${shippingFee.toLocaleString()}원`}
              </span>
            </div>
            {shippingFee === 0 && items.length > 0 && (
              <p className="text-xs text-teal-500">✓ 디지털 상품만 있어 배송비 무료입니다</p>
            )}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-700">총 결제금액</span>
            <span className="text-xl font-bold text-pink-600">{grandTotal.toLocaleString()}원</span>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4">
          📌 주문 후 시안 확인 메시지를 발송해드립니다. 문의사항은 카카오톡으로 연락주세요.
        </div>
      </div>

      {/* 하단 고정 결제 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-pink-100 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/checkout"
            className="block w-full text-center py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition"
          >
            결제하기 ({grandTotal.toLocaleString()}원)
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
