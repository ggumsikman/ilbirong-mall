'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { calcCustomBannerPrice, BANNER_FINISHING, BANNER_FORMULA } from '@/lib/pricing'
import { PRODUCTS } from '@/lib/products'
import { useCart } from '@/context/CartContext'

// 견적 계산기용 카테고리 (기존 ilbirong data.js 기반)
const EST_CATEGORIES = [
  {
    id: 'cat1',
    name: '현수막 (포토존/가로형)',
    requiresShipping: true,
    hasCustom: true,
    options: [
      { id: 'c1_1',  name: '[가로형] 300×70cm',    price: 30000 },
      { id: 'c1_2',  name: '[가로형] 400×70cm',    price: 37000 },
      { id: 'c1_3',  name: '[가로형] 500×90cm',    price: 45000 },
      { id: 'c1_4',  name: '[가로형] 600×90cm',    price: 55000 },
      { id: 'c1_5',  name: '[가로형] 700×90cm',    price: 65000 },
      { id: 'c1_6',  name: '[가로형] 800×90cm',    price: 75000 },
      { id: 'c1_7',  name: '[가로형] 1000×90cm',   price: 95000 },
      { id: 'c1_8',  name: '[가로형] 1000×100cm',  price: 102000 },
      { id: 'c1_9',  name: '[포토존] 180×150cm',   price: 32000 },
      { id: 'c1_10', name: '[포토존] 200×180cm',   price: 38000 },
      { id: 'c1_11', name: '[포토존] 240×180cm',   price: 45000 },
      { id: 'c1_12', name: '[포토존] 300×180cm',   price: 55000 },
      { id: 'c1_13', name: '[대형포토존] 300×200cm', price: 80000 },
      { id: 'c1_14', name: '[대형포토존] 300×230cm', price: 85000 },
    ],
  },
  {
    id: 'cat2',
    name: '패트 배너',
    requiresShipping: true,
    hasCustom: false,
    options: [
      { id: 'c2_1', name: '운동회/체육대회 UV 패트배너',              price: 28000 },
      { id: 'c2_2', name: '졸업/수료 미니 UV 패트배너 (캔바 셀프)',   price: 12000 },
      { id: 'c2_3', name: '졸업/수료 미니 UV 패트배너 (일비롱 작업)', price: 15000 },
    ],
  },
  {
    id: 'cat3',
    name: '환경구성판 및 굿즈',
    requiresShipping: true,
    hasCustom: false,
    options: [
      { id: 'c3_1', name: '관찰/자석놀이 포맥스판',  price: 35000 },
      { id: 'c3_2', name: '투약함 안내판',           price: 41000 },
      { id: 'c3_3', name: '미세먼지 안내판',         price: 39000 },
      { id: 'c3_4', name: '차량용 자석 스티커',      price: 28000 },
      { id: 'c3_5', name: '탄소중립 환경보호어깨띠', price: 3500 },
      { id: 'c3_6', name: '가족이름스티커 홍팀 10장', price: 5500 },
    ],
  },
  {
    id: 'cat4',
    name: '디지털 도안',
    requiresShipping: false,
    hasCustom: false,
    options: [
      { id: 'c4_1', name: '나를 소개해요 도안세트',    price: 3500 },
      { id: 'c4_2', name: '병아리 학급현황판 도안',    price: 1800 },
      { id: 'c4_3', name: '화분이름표 도안',          price: 1800 },
      { id: 'c4_4', name: '발표회 도안세트 캔바 템플릿', price: 3500 },
    ],
  },
]

interface CartEstItem {
  id: string
  categoryName: string
  optionName: string
  price: number
  quantity: number
  requiresShipping: boolean
}

export default function EstimatePage() {
  const [selCatId, setSelCatId] = useState('')
  const [selOptId, setSelOptId] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [selFinishing, setSelFinishing] = useState(BANNER_FINISHING[0])
  const [qty, setQty] = useState(1)
  const [estCart, setEstCart] = useState<CartEstItem[]>([])
  const [toast, setToast] = useState('')
  const { addItem: addToShopCart } = useCart()

  const selCat = EST_CATEGORIES.find(c => c.id === selCatId)
  const selOpt = selCat?.options.find(o => o.id === selOptId)

  // 비규격 가격 계산
  const breakdown = isCustom
    ? calcCustomBannerPrice(
        parseFloat(customW) || 0,
        parseFloat(customH) || 0,
        BANNER_FORMULA,
        selFinishing.price,
      )
    : null

  const currentPrice = isCustom
    ? (breakdown?.total ?? 0)
    : (selOpt?.price ?? 0)

  const canAdd = selCatId !== ''
    && (isCustom ? (breakdown !== null && breakdown.total > 0) : selOptId !== '')

  function addToEstCart() {
    if (!canAdd || !selCat) return
    const optionName = isCustom
      ? `비규격(${customW}×${customH}cm)${selFinishing.price > 0 ? ' / ' + selFinishing.label : ''}`
      : (selOpt?.name ?? '')

    setEstCart(prev => [
      ...prev,
      {
        id: `${Date.now()}`,
        categoryName: selCat.name,
        optionName,
        price: currentPrice,
        quantity: qty,
        requiresShipping: selCat.requiresShipping,
      },
    ])
    // 초기화
    setSelCatId(''); setSelOptId(''); setIsCustom(false)
    setCustomW(''); setCustomH(''); setQty(1)
    setSelFinishing(BANNER_FINISHING[0])
  }

  function removeEstItem(id: string) {
    setEstCart(prev => prev.filter(i => i.id !== id))
  }

  const estTotal = estCart.reduce((s, i) => s + i.price * i.quantity, 0)
  const estShipping = estCart.some(i => i.requiresShipping) && estCart.length > 0 ? 3000 : 0
  const estGrand = estTotal + estShipping

  function copyEstimate() {
    if (estCart.length === 0) { showToast('장바구니가 비어있어요.'); return }
    let txt = '[일비롱디자인 견적 문의]\n\n'
    estCart.forEach(i => {
      txt += `- ${i.categoryName} : ${i.optionName} × ${i.quantity}개 = ${(i.price * i.quantity).toLocaleString()}원\n`
    })
    txt += `\n상품 합계: ${estTotal.toLocaleString()}원\n`
    txt += `배송비: ${estShipping.toLocaleString()}원\n`
    txt += `----------------------------\n`
    txt += `총 예상 금액: ${estGrand.toLocaleString()}원\n\n`
    txt += `(이 내용을 카톡으로 전달해 주세요! 확인 후 안내드릴게요 💛)`
    navigator.clipboard.writeText(txt)
      .then(() => showToast('✅ 카톡 공유용 견적서가 복사됐어요!'))
      .catch(() => showToast('복사에 실패했어요.'))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-28">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1">🧮 견적 계산기</h1>
        <p className="text-sm text-gray-400 mb-5">규격 상품 단가 확인 및 비규격 현수막 견적 계산</p>

        {/* 카테고리 선택 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <div className="mb-3">
            <label className="block text-sm font-bold text-gray-700 mb-2">분류</label>
            <select
              value={selCatId}
              onChange={e => { setSelCatId(e.target.value); setSelOptId(''); setIsCustom(false) }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white"
            >
              <option value="">카테고리를 선택해주세요</option>
              {EST_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {selCatId && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">상품 및 크기</label>
              <select
                value={selOptId}
                onChange={e => {
                  const v = e.target.value
                  setSelOptId(v)
                  setIsCustom(v === '__custom__')
                }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white"
              >
                <option value="">상세 상품을 선택해주세요</option>
                {selCat?.options.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.price.toLocaleString()}원)</option>
                ))}
                {selCat?.hasCustom && (
                  <option value="__custom__">비규격(직접입력)</option>
                )}
              </select>
            </div>
          )}

          {/* 비규격 입력 */}
          {isCustom && (
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-700 mb-2">사이즈 직접 입력 (가로 × 세로)</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-1.5">
                  <input
                    type="number"
                    value={customW}
                    onChange={e => setCustomW(e.target.value)}
                    placeholder="가로"
                    min="1"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <span className="text-sm text-gray-400">cm</span>
                </div>
                <span className="text-gray-400 font-bold">×</span>
                <div className="flex-1 flex items-center gap-1.5">
                  <input
                    type="number"
                    value={customH}
                    onChange={e => setCustomH(e.target.value)}
                    placeholder="세로"
                    min="1"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <span className="text-sm text-gray-400">cm</span>
                </div>
              </div>

              {/* 후가공 선택 */}
              <div className="mt-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">후가공 선택</label>
                <select
                  value={selFinishing.id}
                  onChange={e => {
                    const f = BANNER_FINISHING.find(f => f.id === e.target.value)
                    if (f) setSelFinishing(f)
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white"
                >
                  {BANNER_FINISHING.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label}{f.price > 0 ? ` (+${f.price.toLocaleString()}원)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 가격 분해 표시 */}
              {breakdown && breakdown.total > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                  <div className="flex justify-between text-gray-500 mb-1">
                    <span>공급 원가</span>
                    <span>{breakdown.rawCost.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-500 mb-1">
                    <span>마진 (55%)</span>
                    <span>+{breakdown.margin.toLocaleString()}원</span>
                  </div>
                  {breakdown.finishingPrice > 0 && (
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>후가공 ({selFinishing.label})</span>
                      <span>+{breakdown.finishingPrice.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-bold">
                    <span>예상 단가 (1장)</span>
                    <span className="text-pink-600 text-base">{breakdown.total.toLocaleString()}원</span>
                  </div>
                </div>
              )}
              {isCustom && (!customW || !customH) && (
                <p className="mt-2 text-xs text-gray-400 text-center">사이즈를 입력하면 예상 단가가 나와요</p>
              )}
            </div>
          )}

          {/* 수량 + 추가 버튼 */}
          {(selOptId || (isCustom && breakdown && breakdown.total > 0)) && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold text-xl flex items-center justify-center">−</button>
                <span className="w-8 text-center font-bold text-gray-800 text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold text-xl flex items-center justify-center">+</button>
              </div>
              <button
                onClick={addToEstCart}
                disabled={!canAdd}
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
              >
                장바구니 담기
              </button>
            </div>
          )}
        </div>

        {/* 장바구니 */}
        <div className="bg-white rounded-2xl shadow-sm mb-3">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-700">🛒 나의 견적 장바구니</h2>
            {estCart.length > 0 && (
              <button onClick={() => setEstCart([])} className="text-xs text-gray-400 hover:text-red-400">전체삭제</button>
            )}
          </div>
          {estCart.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">원하시는 상품을 담아주세요.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {estCart.map(item => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{item.categoryName}</p>
                      <p className="text-sm font-semibold text-gray-700 leading-snug">{item.optionName}</p>
                    </div>
                    <button onClick={() => removeEstItem(item.id)} className="text-gray-300 hover:text-red-400 text-xl flex-none">×</button>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.quantity}개</span>
                    <span className="font-bold text-pink-600 text-sm">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 합계 */}
        {estCart.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>상품 합계</span><span>{estTotal.toLocaleString()}원</span></div>
              <div className="flex justify-between text-gray-500"><span>배송비</span><span>{estShipping === 0 ? '무료' : `+${estShipping.toLocaleString()}원`}</span></div>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="font-bold text-gray-700">총 예상 금액</span>
              <span className="text-xl font-bold text-pink-600">{estGrand.toLocaleString()}원</span>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {estCart.length > 0 && (
          <button
            onClick={copyEstimate}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition"
          >
            📋 견적 내용 복사하기 (카톡 전달용)
          </button>
        )}
        <p className="text-center text-xs text-gray-400 mt-2">복사 후 카카오톡으로 전달해주세요!</p>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-sm px-5 py-3 rounded-2xl shadow-lg z-50 toast-enter whitespace-nowrap">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
