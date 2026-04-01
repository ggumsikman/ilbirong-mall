'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'

declare global {
  interface Window {
    // Toss Payments SDK는 dynamic import 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TossPayments?: any
  }
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemsTotal, shippingFee, grandTotal, clearCart } = useCart()

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    shipping_address: '',
    payment_method: 'card',
    receipt_type: '',
    business_number: '',
    email: '',
    other_requests: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentWidgetReady, setPaymentWidgetReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentWidgetRef = useRef<any>(null)

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (form.payment_method !== 'card') return
    if (typeof window === 'undefined') return

    let mounted = true

    async function initToss() {
      try {
        const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk')
        const customerKey = `customer-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const widget = await loadPaymentWidget(TOSS_CLIENT_KEY, customerKey)

        if (!mounted) return
        paymentWidgetRef.current = widget

        await widget.renderPaymentMethods(
          '#payment-method',
          { value: grandTotal },
          { variantKey: 'DEFAULT' }
        )
        await widget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' })

        setPaymentWidgetReady(true)
      } catch (err) {
        console.error('Toss 위젯 초기화 실패:', err)
      }
    }

    initToss()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.payment_method])

  // 금액 변경 시 위젯 업데이트
  useEffect(() => {
    if (!paymentWidgetRef.current || !paymentWidgetReady) return
    paymentWidgetRef.current.updateAmount(grandTotal)
  }, [grandTotal, paymentWidgetReady])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-500 mb-4">장바구니가 비어있어요.</p>
          <Link href="/" className="text-pink-500 font-medium">홈으로 가기</Link>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.customer_name.trim()) errs.customer_name = '이름/기관명을 입력해주세요.'
    if (!form.phone.trim()) errs.phone = '연락처를 입력해주세요.'
    if (!form.shipping_address.trim() && items.some(i => !i.product.isDigital))
      errs.shipping_address = '배송주소를 입력해주세요.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePayment = async () => {
    if (!validate()) return
    setIsLoading(true)

    try {
      if (form.payment_method === 'card' && paymentWidgetRef.current) {
        // 토스 결제 요청
        const tossOrderId = `ilbirong-${Date.now()}`

        // 주문 정보 임시 저장 (success 페이지에서 사용)
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          ...form,
          items,
          items_total: itemsTotal,
          shipping_fee: shippingFee,
          grand_total: grandTotal,
          toss_order_id: tossOrderId,
        }))

        await paymentWidgetRef.current.requestPayment({
          orderId: tossOrderId,
          orderName: items.length === 1
            ? items[0].product.name
            : `${items[0].product.name} 외 ${items.length - 1}건`,
          customerName: form.customer_name,
          customerEmail: form.email || undefined,
          customerMobilePhone: form.phone.replace(/-/g, ''),
          successUrl: `${window.location.origin}/checkout/success`,
          failUrl: `${window.location.origin}/checkout/fail`,
        })
      } else {
        // 계좌이체 → 바로 주문 저장
        const res = await fetch('/api/shop-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            items,
            items_total: itemsTotal,
            shipping_fee: shippingFee,
            grand_total: grandTotal,
            payment_status: 'pending',
          }),
        })
        const result = await res.json()
        if (result.success) {
          clearCart()
          router.push(`/checkout/success?orderId=${result.order.id}&method=transfer`)
        } else {
          alert('주문 접수에 실패했습니다. 다시 시도해주세요.')
        }
      }
    } catch (err) {
      console.error('결제 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-8">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <h1 className="text-xl font-bold text-gray-800 mb-5">💳 결제하기</h1>

        <div className="space-y-4">
          {/* 주문 요약 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3 text-sm">📦 주문 상품</h2>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-700 font-medium truncate block">{item.product.name}</span>
                    {item.selectedSizeOption && (
                      <span className="text-xs text-gray-400">{item.selectedSizeOption.name}</span>
                    )}
                  </div>
                  <span className="text-gray-600 ml-2 font-medium whitespace-nowrap">
                    {item.quantity}개 · {(item.unitPrice * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>상품 합계</span>
                <span>{itemsTotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>배송비</span>
                <span>{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 mt-1">
                <span>총 결제금액</span>
                <span className="text-pink-600">{grandTotal.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 주문자 정보 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4 text-sm">👤 주문자 정보</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이름 / 기관명 <span className="text-pink-500">*</span>
                </label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="예) 홍길동 / 일비롱유치원"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition ${errors.customer_name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  연락처 <span className="text-pink-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  inputMode="tel"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {items.some(i => !i.product.isDigital) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    배송주소 <span className="text-pink-500">*</span>
                  </label>
                  <input
                    name="shipping_address"
                    value={form.shipping_address}
                    onChange={handleChange}
                    placeholder="도로명 주소를 입력해주세요"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition ${errors.shipping_address ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.shipping_address && <p className="text-red-500 text-xs mt-1">{errors.shipping_address}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 (선택)</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="example@email.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">기타 요청사항 (선택)</label>
                <textarea
                  name="other_requests"
                  value={form.other_requests}
                  onChange={handleChange}
                  placeholder="추가 요청사항을 자유롭게 적어주세요."
                  rows={2}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* 결제 방법 선택 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4 text-sm">💳 결제 방법</h2>
            <div className="flex gap-3">
              {[
                { value: 'card', label: '카드/간편결제', emoji: '💳' },
                { value: 'transfer', label: '계좌이체', emoji: '🏦' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center gap-2 border-2 rounded-xl p-3 cursor-pointer transition ${
                    form.payment_method === opt.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span>{opt.emoji}</span>
                  <span className={`text-sm font-medium ${form.payment_method === opt.value ? 'text-pink-700' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {form.payment_method === 'transfer' && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                <p className="font-semibold mb-1">💙 계좌이체 안내</p>
                <p>주문 완료 후 카카오톡으로 입금 계좌를 안내해드립니다.</p>
                <p className="mt-1 text-xs text-blue-500">입금 확인 후 제작이 시작됩니다.</p>
              </div>
            )}
          </div>

          {/* 토스페이먼츠 위젯 */}
          {form.payment_method === 'card' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <h2 className="font-bold text-gray-700 text-sm mb-1">💳 결제 정보 입력</h2>
                <p className="text-xs text-gray-400">테스트 모드 — 실제 결제가 발생하지 않습니다</p>
              </div>
              <div id="payment-method" className="px-2" />
              <div id="agreement" className="px-2 pb-2" />
              {!paymentWidgetReady && (
                <div className="text-center py-8 text-gray-400">
                  <p className="animate-pulse text-sm">결제 위젯 로딩 중...</p>
                </div>
              )}
            </div>
          )}

          {/* 결제 버튼 */}
          <button
            onClick={handlePayment}
            disabled={isLoading || (form.payment_method === 'card' && !paymentWidgetReady)}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition disabled:opacity-60 text-base"
          >
            {isLoading
              ? '처리 중...'
              : form.payment_method === 'card'
                ? `${grandTotal.toLocaleString()}원 결제하기`
                : `${grandTotal.toLocaleString()}원 주문 접수하기`
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            주문 전 <Link href="/" className="text-pink-400 underline">이용약관</Link>을 확인해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
