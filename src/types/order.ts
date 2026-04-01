import { CartItem } from './product'

// 커스텀 주문 (비규격/자유주문) — 기존 order 프로젝트와 동일한 스키마
export interface OrderItem {
  product_type: string
  design_type: string
  design_name?: string
  design_sub_name?: string
  width_cm: number | null
  height_cm: number | null
  quantity: number
  finishing: string[]
}

export type OrderStatus =
  | '접수'
  | '작업중'
  | '시안 확인 요청중'
  | '시안 수정 요청'
  | '시안 수정 작업중'
  | '시안 확정'
  | '완료'
  | '취소'

export interface Order {
  id: string
  created_at: string
  customer_name: string
  phone: string
  product_type: string
  design_type: string
  width_cm: number | null
  height_cm: number | null
  quantity: number
  text_top: string | null
  text_main: string | null
  text_bottom: string | null
  text_corrections: string
  needs_statement: boolean
  statement_email: string | null
  shipping_address: string
  payment_method: string
  receipt_type: string | null
  business_number: string | null
  email: string | null
  card_phone: string | null
  payment_link: string | null
  items: OrderItem[] | null
  other_requests: string
  image_urls: string[]
  status: OrderStatus
  draft_images: string[]
  revision_count: number
  revision_notes: string
}

// 자사몰 주문 — 장바구니에서 결제된 주문
export interface ShopOrder {
  id: string
  created_at: string
  customer_name: string
  phone: string
  shipping_address: string
  payment_method: string
  receipt_type: string | null
  business_number: string | null
  email: string | null
  items: CartItem[]
  items_total: number
  shipping_fee: number
  grand_total: number
  toss_order_id: string | null
  toss_payment_key: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled'
  status: OrderStatus
  other_requests: string
}
