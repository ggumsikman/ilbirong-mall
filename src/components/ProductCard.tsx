import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product'
import { CATEGORIES } from '@/lib/products'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const category = CATEGORIES.find(c => c.id === product.categoryId)

  return (
    <Link href={`/products/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-pink-50">
      {/* 이미지 */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* 배지 */}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {product.badge}
          </span>
        )}
        {product.isDigital && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            즉시다운
          </span>
        )}
      </div>

      {/* 텍스트 */}
      <div className="p-3">
        {category && (
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5 ${category.color}`}>
            {category.emoji} {category.name}
          </span>
        )}
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-pink-600">
              {product.basePrice.toLocaleString()}원
            </p>
            {product.sizeOptions && (
              <p className="text-[10px] text-gray-400">사이즈 선택 가능</p>
            )}
          </div>
          <span className="text-xs bg-pink-50 text-pink-500 font-medium px-2.5 py-1 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition">
            담기
          </span>
        </div>
      </div>
    </Link>
  )
}
