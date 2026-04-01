'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getProductById, CATEGORIES } from '@/lib/products'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { ProductOption, ProductVariant } from '@/types/product'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addItem } = useCart()
  const product = getProductById(id)

  const [selectedSize, setSelectedSize] = useState<ProductOption | undefined>(
    product?.sizeOptions?.[0]
  )
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variantOptions?.[0]
  )
  const [institutionName, setInstitutionName] = useState('')
  const [textChange, setTextChange] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-gray-500 mb-4">상품을 찾을 수 없어요.</p>
          <button onClick={() => router.back()} className="text-pink-500 font-medium">← 돌아가기</button>
        </div>
      </div>
    )
  }

  const category = CATEGORIES.find(c => c.id === product.categoryId)
  const unitPrice = product.basePrice + (selectedSize?.priceAdd ?? 0) + (selectedVariant?.priceAdd ?? 0)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (product.requiresCustomText && !institutionName.trim()) {
      errs.institutionName = '기관명을 입력해주세요.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddToCart = () => {
    if (!validate()) return
    addItem({
      product,
      selectedSizeOption: selectedSize,
      selectedVariant,
      institutionName,
      textChange,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!validate()) return
    addItem({
      product,
      selectedSizeOption: selectedSize,
      selectedVariant,
      institutionName,
      textChange,
      quantity,
    })
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-32">
      <Header />

      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <div className="px-4 pt-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            ← 목록으로
          </button>
        </div>

        {/* 상품 이미지 */}
        <div className="relative aspect-square bg-gray-100 mt-2 mx-4 rounded-2xl overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {product.badge}
            </span>
          )}
          {product.isDigital && (
            <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              💾 즉시 다운로드
            </span>
          )}
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* 카테고리 + 이름 + 가격 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {category && (
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${category.color}`}>
                {category.emoji} {category.name}
              </span>
            )}
            <h1 className="text-lg font-bold text-gray-800 leading-snug mb-3">{product.name}</h1>

            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-pink-600">{unitPrice.toLocaleString()}원</span>
              {(selectedSize?.priceAdd ?? 0) + (selectedVariant?.priceAdd ?? 0) > 0 && (
                <span className="text-sm text-gray-400 line-through mb-0.5">
                  기본 {product.basePrice.toLocaleString()}원
                </span>
              )}
            </div>

            {!product.isDigital && (
              <p className="text-xs text-gray-400 mt-1">
                📦 배송비 3,000원 (디지털 상품만 구매 시 무료)
              </p>
            )}

            {product.description && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* 사이즈 옵션 */}
          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3">📐 사이즈 선택 <span className="text-pink-500">*</span></p>
              <div className="grid grid-cols-2 gap-2">
                {product.sizeOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSize(opt)}
                    className={`px-3 py-2.5 rounded-xl text-sm border-2 text-left transition ${
                      selectedSize?.id === opt.id
                        ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <span className="block font-medium">{opt.name}</span>
                    {opt.priceAdd > 0 && (
                      <span className="text-xs text-orange-500">+{opt.priceAdd.toLocaleString()}원</span>
                    )}
                    {opt.priceAdd === 0 && (
                      <span className="text-xs text-gray-400">기본 포함</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 디자인/작업 옵션 */}
          {product.variantOptions && product.variantOptions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3">🎨 옵션 선택 <span className="text-pink-500">*</span></p>
              <div className="flex flex-wrap gap-2">
                {product.variantOptions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm border-2 transition ${
                      selectedVariant?.id === v.id
                        ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {v.name}
                    {v.priceAdd > 0 && <span className="ml-1 text-xs text-orange-500">+{v.priceAdd.toLocaleString()}원</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 필수 입력 텍스트 필드 (실물 상품) */}
          {product.requiresCustomText && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3">✏️ 제작 정보 입력</p>

              {/* 기관명 */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  기관명을 적어주세요 <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={e => {
                    setInstitutionName(e.target.value)
                    if (errors.institutionName) setErrors(prev => ({ ...prev, institutionName: '' }))
                  }}
                  placeholder="예) 일비롱유치원, 행복어린이집"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white transition ${
                    errors.institutionName ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.institutionName && (
                  <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>
                )}
              </div>

              {/* 문구 변경사항 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  문구변경사항있으시면적어주세요. 없으면 x, 길면 카톡전달
                </label>
                <textarea
                  value={textChange}
                  onChange={e => setTextChange(e.target.value)}
                  placeholder="예) 상단: 2025년 운동회 / 기관명: 일비롱유치원 / 나머지는 기본 유지&#10;(변경사항 없으면 x 라고 입력해주세요)"
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white transition resize-none"
                />
              </div>
            </div>
          )}

          {/* 수량 선택 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3">🔢 수량</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold text-xl flex items-center justify-center transition"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:text-pink-500 font-bold text-xl flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
              <div className="text-sm text-gray-500">
                합계: <span className="font-bold text-pink-600 text-base">{(unitPrice * quantity).toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-pink-100 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition ${
              added
                ? 'border-green-400 bg-green-50 text-green-600'
                : 'border-pink-500 text-pink-500 hover:bg-pink-50'
            }`}
          >
            {added ? '✓ 담겼어요!' : '🛒 장바구니 담기'}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:opacity-90 transition shadow-sm"
          >
            바로 구매하기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
