import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '일비롱디자인 | 유아교육기관 전문 디자인 자사몰',
  description: '유치원·어린이집 전문 디자인 업체 일비롱디자인. 현수막·배너·포맥스판·굿즈·디지털도안을 한 곳에서 주문하세요!',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={notoSansKR.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
