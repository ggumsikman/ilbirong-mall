// 일비롱디자인 비규격 현수막 공급사 원가 계산 로직
// primead.kr 실측 데이터 기반 (ilbirong 프로젝트에서 포팅)

interface HeightRate { h: number; rate: number }
interface Formula {
  heightRates: HeightRate[]
  areaCoeff: number
  widthCoeff: number
  baseFee: number
  widthStep: number
  minWidth: number
}

export const BANNER_FORMULA: Formula = {
  areaCoeff: 0.72,
  widthCoeff: -4,
  baseFee: 2000,
  widthStep: 50,
  minWidth: 100,
  heightRates: [
    { h: 30,  rate: 33  },
    { h: 40,  rate: 34  },
    { h: 50,  rate: 35  },
    { h: 60,  rate: 38  },
    { h: 70,  rate: 40  },
    { h: 80,  rate: 42  },
    { h: 90,  rate: 44  },
    { h: 100, rate: 68  },
    { h: 110, rate: 70  },
    { h: 120, rate: 73  },
    { h: 130, rate: 76  },
    { h: 140, rate: 78  },
    { h: 150, rate: 90  },
    { h: 160, rate: 92  },
    { h: 170, rate: 94  },
    { h: 180, rate: 94  },
    { h: 190, rate: 136 },
    { h: 200, rate: 140 },
  ],
}

export const BANNER_FINISHING = [
  { id: 'none',          label: '후가공 없음',                 price: 0 },
  { id: 'heat_cut',      label: '열재단',                     price: 0 },
  { id: 'eyelet_4',      label: '아일렛타공 (사방 4개)',        price: 2000 },
  { id: 'eyelet_8',      label: '아일렛타공 (8개)',             price: 4000 },
  { id: 'eyelet4_cube4', label: '아일렛 4개 + 큐방 4개',       price: 4000 },
  { id: 'eyelet8_cube8', label: '아일렛 8개 + 큐방 8개',       price: 8000 },
  { id: 'rope_loop',     label: '끈고리가공 (로프 포함)',        price: 4000 },
  { id: 'rope_3m',       label: '로프 3m',                    price: 1000 },
]

const MARGIN_RATE = 55   // %
const MIN_PRICE   = 5000  // 원

function interpolateRate(S: number, formula: Formula): number {
  const sorted = [...formula.heightRates].sort((a, b) => a.h - b.h)
  if (S < sorted[0].h)  return sorted[0].rate
  if (S > sorted[sorted.length - 1].h)
    return formula.areaCoeff * S + formula.widthCoeff

  for (let i = 0; i < sorted.length - 1; i++) {
    if (S >= sorted[i].h && S <= sorted[i + 1].h) {
      const t = (S - sorted[i].h) / (sorted[i + 1].h - sorted[i].h)
      return sorted[i].rate + t * (sorted[i + 1].rate - sorted[i].rate)
    }
  }
  return formula.areaCoeff * S + formula.widthCoeff
}

export interface PriceBreakdown {
  rawCost: number
  margin: number
  finishingPrice: number
  total: number
}

export function calcCustomBannerPrice(
  width: number,
  height: number,
  formula: Formula = BANNER_FORMULA,
  finishingPrice = 0,
): PriceBreakdown | null {
  if (width <= 0 || height <= 0) return null

  const S = Math.min(width, height)
  const L = Math.max(width, height)

  const effectiveLong = Math.max(Math.ceil(L / formula.widthStep) * formula.widthStep, formula.minWidth)
  const rate = interpolateRate(S, formula)
  let rawCost = rate * effectiveLong + formula.baseFee

  // 소형 재단비: 짧은 변이 테이블 최솟값 미만이면 1,400원 가산
  const minTableH = Math.min(...formula.heightRates.map(r => r.h))
  if (S < minTableH) rawCost += 1400

  rawCost = Math.max(rawCost, 0)

  let finalPrice = rawCost * (1 + MARGIN_RATE / 100)
  finalPrice = Math.max(finalPrice, MIN_PRICE)
  finalPrice = Math.round(finalPrice / 100) * 100  // 100원 단위 반올림

  return {
    rawCost: Math.round(rawCost),
    margin: Math.max(finalPrice - Math.round(rawCost / 100) * 100, 0),
    finishingPrice,
    total: finalPrice + finishingPrice,
  }
}
