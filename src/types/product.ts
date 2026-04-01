export interface ProductOption {
  id: string
  name: string
  priceAdd: number // 기본가 대비 추가금액 (0이면 기본)
}

export interface ProductVariant {
  id: string
  name: string          // 예: "은하수별빛", "캔바 셀프작업형"
  priceAdd: number
}

export interface Product {
  id: string
  categoryId: string
  name: string
  basePrice: number
  imageUrl: string
  isDigital: boolean    // true → 배송비 0원
  requiresCustomText: boolean // true → 기관명/문구 입력란 표시
  description?: string
  sizeOptions?: ProductOption[]   // 현수막 사이즈 옵션
  variantOptions?: ProductVariant[] // 디자인 선택지 (스티커 종류, 배너 작업형 등)
  badge?: string        // 예: '베스트', '신상', '디지털'
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string         // Tailwind bg class
}

export interface CartItem {
  cartItemId: string
  product: Product
  selectedSizeOption?: ProductOption
  selectedVariant?: ProductVariant
  institutionName: string   // 기관명
  textChange: string        // 문구 변경사항
  quantity: number
  unitPrice: number
}
