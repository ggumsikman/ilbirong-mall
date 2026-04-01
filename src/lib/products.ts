import { Category, Product } from '@/types/product'

export const CATEGORIES: Category[] = [
  { id: 'all',     name: '전체',           emoji: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { id: 'banner',  name: '행사용 현수막',   emoji: '🎪', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'foamex',  name: '포맥스 환경구성판', emoji: '📋', color: 'bg-teal-100 text-teal-700' },
  { id: 'pet',     name: '패트 배너',       emoji: '🎀', color: 'bg-purple-100 text-purple-700' },
  { id: 'goods',   name: '굿즈 & 스티커',  emoji: '⭐', color: 'bg-orange-100 text-orange-700' },
  { id: 'digital', name: '디지털 도안',     emoji: '💾', color: 'bg-blue-100 text-blue-700' },
]

export const PRODUCTS: Product[] = [
  // ===== 행사용 현수막 =====
  {
    id: 'banner-forest',
    categoryId: 'banner',
    name: '숲체험 가로형/포토존형 현수막',
    basePrice: 30000,
    imageUrl: 'https://via.placeholder.com/400x400/d4edda/28a745?text=숲체험+현수막',
    isDigital: false,
    requiresCustomText: true,
    badge: '베스트',
    description: '숲체험·자연탐구 행사에 딱 맞는 따뜻한 초록빛 디자인 현수막입니다. 가로형과 포토존형 중 선택하세요.',
    sizeOptions: [
      { id: 'size-300x70',    name: '가로형 300×70cm',   priceAdd: 0 },
      { id: 'size-400x70',    name: '가로형 400×70cm',   priceAdd: 7000 },
      { id: 'size-500x90',    name: '가로형 500×90cm',   priceAdd: 15000 },
      { id: 'size-photo',     name: '포토존 180×150cm',  priceAdd: 2000 },
    ],
  },
  {
    id: 'banner-sports',
    categoryId: 'banner',
    name: '운동회·체육대회 포토존 현수막',
    basePrice: 32000,
    imageUrl: 'https://via.placeholder.com/400x400/ffeeba/fd7e14?text=운동회+현수막',
    isDigital: false,
    requiresCustomText: true,
    badge: '베스트',
    description: '신나는 운동회와 체육대회를 더욱 특별하게! 생동감 넘치는 디자인으로 소중한 추억을 남겨보세요.',
    sizeOptions: [
      { id: 'size-300x70',    name: '가로형 300×70cm',   priceAdd: 0 },
      { id: 'size-400x70',    name: '가로형 400×70cm',   priceAdd: 7000 },
      { id: 'size-500x90',    name: '가로형 500×90cm',   priceAdd: 15000 },
      { id: 'size-photo',     name: '포토존 180×150cm',  priceAdd: 2000 },
    ],
  },
  {
    id: 'banner-entrance',
    categoryId: 'banner',
    name: '입학·등원 100일 기념 현수막',
    basePrice: 30000,
    imageUrl: 'https://via.placeholder.com/400x400/f8d7da/dc3545?text=입학+현수막',
    isDigital: false,
    requiresCustomText: true,
    description: '우리 아이의 소중한 첫걸음, 입학과 등원 100일을 예쁘게 기념해보세요.',
    sizeOptions: [
      { id: 'size-300x70',    name: '가로형 300×70cm',   priceAdd: 0 },
      { id: 'size-400x70',    name: '가로형 400×70cm',   priceAdd: 7000 },
      { id: 'size-500x90',    name: '가로형 500×90cm',   priceAdd: 15000 },
      { id: 'size-photo',     name: '포토존 180×150cm',  priceAdd: 2000 },
    ],
  },

  // ===== 포맥스 환경구성판 =====
  {
    id: 'foamex-medicine',
    categoryId: 'foamex',
    name: '투약함 약가져왔어요 포맥스 환경구성판',
    basePrice: 41000,
    imageUrl: 'https://via.placeholder.com/400x400/cce5ff/004085?text=투약함+포맥스',
    isDigital: false,
    requiresCustomText: true,
    description: '원내 투약 관리에 필수! 귀엽고 눈에 잘 띄는 투약함 안내판으로 효율적인 원 운영을 도와드립니다.',
  },
  {
    id: 'foamex-observe',
    categoryId: 'foamex',
    name: '관찰해보아요·자석놀이해요 포맥스 환경구성판',
    basePrice: 35000,
    imageUrl: 'https://via.placeholder.com/400x400/d4edda/155724?text=관찰+자석놀이',
    isDigital: false,
    requiresCustomText: true,
    description: '교실 환경을 풍부하게 만들어주는 관찰 및 자석놀이 코너 구성판입니다.',
  },
  {
    id: 'foamex-dust',
    categoryId: 'foamex',
    name: '미세먼지 안내판·현황판',
    basePrice: 39000,
    imageUrl: 'https://via.placeholder.com/400x400/e2e3e5/383d41?text=미세먼지+안내판',
    isDigital: false,
    requiresCustomText: true,
    description: '아이들의 건강한 하루를 위한 미세먼지 현황 안내판입니다. 색상으로 쉽게 확인 가능해요.',
  },

  // ===== 패트 배너 =====
  {
    id: 'pet-sports',
    categoryId: 'pet',
    name: '운동회·체육대회 UV 패트배너',
    basePrice: 28000,
    imageUrl: 'https://via.placeholder.com/400x400/fff3cd/856404?text=운동회+패트배너',
    isDigital: false,
    requiresCustomText: true,
    description: '선명한 UV 인쇄로 색상이 또렷한 운동회 패트배너입니다.',
  },
  {
    id: 'pet-graduation',
    categoryId: 'pet',
    name: '졸업·수료 선물 미니 UV 패트 배너',
    basePrice: 12000,
    imageUrl: 'https://via.placeholder.com/400x400/f8d7da/721c24?text=졸업+미니배너',
    isDigital: false,
    requiresCustomText: true,
    description: '졸업·수료 시즌에 선물하기 딱 좋은 미니 패트배너입니다. 캔바 셀프작업도 가능해요!',
    variantOptions: [
      { id: 'self',    name: '캔바 셀프작업형',  priceAdd: 0 },
      { id: 'ilbirong', name: '일비롱 작업형',   priceAdd: 3000 },
    ],
  },

  // ===== 굿즈 & 스티커 =====
  {
    id: 'sticker-car',
    categoryId: 'goods',
    name: '어린이집·유치원·학원 차량용 자석 스티커',
    basePrice: 28000,
    imageUrl: 'https://via.placeholder.com/400x400/fce4ec/c2185b?text=차량용+스티커',
    isDigital: false,
    requiresCustomText: true,
    badge: '인기',
    description: '원 차량에 달면 사랑스러움이 200%! 강한 자석으로 떨어지지 않아요. 원하는 디자인을 선택해주세요.',
    variantOptions: [
      { id: 'galaxy',  name: '은하수별빛',     priceAdd: 0 },
      { id: 'heart',   name: '하트풍선드림',   priceAdd: 0 },
      { id: 'chick',   name: '새싹병아리',     priceAdd: 0 },
    ],
  },
  {
    id: 'sash-green',
    categoryId: 'goods',
    name: '탄소중립 환경보호 어깨띠',
    basePrice: 3500,
    imageUrl: 'https://via.placeholder.com/400x400/e8f5e9/2e7d32?text=환경보호+어깨띠',
    isDigital: false,
    requiresCustomText: false,
    description: '환경의날, 지구의날 행사에 딱! 아이들과 함께하는 환경보호 캠페인 어깨띠입니다.',
  },
  {
    id: 'sticker-name',
    categoryId: 'goods',
    name: '운동회·참여수업 가족이름스티커 홍팀 10장',
    basePrice: 5500,
    imageUrl: 'https://via.placeholder.com/400x400/ffe0b2/e65100?text=이름스티커',
    isDigital: false,
    requiresCustomText: true,
    description: '운동회 때 가족을 쉽게 구분할 수 있는 이름 스티커 세트입니다. 홍팀·청팀 등 다양하게 활용 가능해요.',
  },

  // ===== 디지털 도안 =====
  {
    id: 'digital-introduce',
    categoryId: 'digital',
    name: '나를 소개해요 도안세트',
    basePrice: 3500,
    imageUrl: 'https://via.placeholder.com/400x400/e3f2fd/0d47a1?text=자기소개+도안',
    isDigital: true,
    requiresCustomText: false,
    badge: '디지털',
    description: '새 학기 시작! 아이들이 자신을 소개하는 귀여운 도안 세트입니다. 구매 후 바로 다운로드 가능해요.',
  },
  {
    id: 'digital-chick',
    categoryId: 'digital',
    name: '병아리 학급현황판 도안',
    basePrice: 1800,
    imageUrl: 'https://via.placeholder.com/400x400/fffde7/f57f17?text=병아리+현황판',
    isDigital: true,
    requiresCustomText: false,
    badge: '디지털',
    description: '노란 병아리가 귀여운 학급 현황판 도안입니다. 프린트해서 바로 사용하세요!',
  },
  {
    id: 'digital-flowerpot',
    categoryId: 'digital',
    name: '화분이름표 도안',
    basePrice: 1800,
    imageUrl: 'https://via.placeholder.com/400x400/e8f5e9/1b5e20?text=화분이름표',
    isDigital: true,
    requiresCustomText: false,
    badge: '디지털',
    description: '식물 키우기 활동에 딱! 귀여운 화분이름표 도안입니다.',
  },
  {
    id: 'digital-concert',
    categoryId: 'digital',
    name: '발표회 도안세트 캔바 템플릿',
    basePrice: 3500,
    imageUrl: 'https://via.placeholder.com/400x400/fce4ec/880e4f?text=발표회+도안',
    isDigital: true,
    requiresCustomText: false,
    badge: '디지털',
    description: '발표회·재롱잔치를 더욱 특별하게! 캔바에서 바로 편집 가능한 템플릿 세트입니다.',
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === 'all') return PRODUCTS
  return PRODUCTS.filter(p => p.categoryId === categoryId)
}
