'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem, Product, ProductOption, ProductVariant } from '@/types/product'

interface CartContextValue {
  items: CartItem[]
  addItem: (params: AddItemParams) => void
  removeItem: (cartItemId: string) => void
  updateQty: (cartItemId: string, qty: number) => void
  clearCart: () => void
  itemsTotal: number
  shippingFee: number
  grandTotal: number
  totalCount: number
}

interface AddItemParams {
  product: Product
  selectedSizeOption?: ProductOption
  selectedVariant?: ProductVariant
  institutionName: string
  textChange: string
  quantity: number
}

const CartContext = createContext<CartContextValue | null>(null)

function calcUnitPrice(product: Product, sizeOpt?: ProductOption, variant?: ProductVariant): number {
  return product.basePrice + (sizeOpt?.priceAdd ?? 0) + (variant?.priceAdd ?? 0)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // localStorage → state 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ilbirong_cart')
      if (stored) setItems(JSON.parse(stored))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // state → localStorage 동기화
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('ilbirong_cart', JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback(({
    product,
    selectedSizeOption,
    selectedVariant,
    institutionName,
    textChange,
    quantity,
  }: AddItemParams) => {
    const unitPrice = calcUnitPrice(product, selectedSizeOption, selectedVariant)
    const newItem: CartItem = {
      cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      product,
      selectedSizeOption,
      selectedVariant,
      institutionName,
      textChange,
      quantity,
      unitPrice,
    }
    setItems(prev => [...prev, newItem])
  }, [])

  const removeItem = useCallback((cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId))
  }, [])

  const updateQty = useCallback((cartItemId: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemsTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const hasPhysical = items.some(i => !i.product.isDigital)
  const shippingFee = items.length > 0 && hasPhysical ? 3000 : 0
  const grandTotal = itemsTotal + shippingFee
  const totalCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      itemsTotal,
      shippingFee,
      grandTotal,
      totalCount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
