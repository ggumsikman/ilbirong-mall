'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Order, OrderStatus, ShopOrder } from '@/types/order'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '1234'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ilbirong.vercel.app'

const ALL_STATUSES: OrderStatus[] = ['접수', '작업중', '시안 확인 요청중', '시안 수정 요청', '시안 수정 작업중', '시안 확정', '완료', '취소']

const STATUS_COLORS: Record<OrderStatus, string> = {
  '접수': 'bg-blue-100 text-blue-700',
  '작업중': 'bg-purple-100 text-purple-700',
  '시안 확인 요청중': 'bg-yellow-100 text-yellow-700',
  '시안 수정 요청': 'bg-orange-100 text-orange-700',
  '시안 수정 작업중': 'bg-pink-100 text-pink-700',
  '시안 확정': 'bg-teal-100 text-teal-700',
  '완료': 'bg-green-100 text-green-700',
  '취소': 'bg-gray-100 text-gray-500',
}

type TabType = '몰 주문' | '비규격 주문'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<TabType>('몰 주문')

  // 비규격 주문 (custom)
  const [customOrders, setCustomOrders] = useState<Order[]>([])
  const [customFilter, setCustomFilter] = useState<OrderStatus | '전체'>('전체')
  const [selectedCustom, setSelectedCustom] = useState<Order | null>(null)

  // 몰 주문 (shop)
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([])
  const [selectedShop, setSelectedShop] = useState<ShopOrder | null>(null)

  const [loading, setLoading] = useState(false)
  const [draftUploading, setDraftUploading] = useState(false)
  const [newDraftUrls, setNewDraftUrls] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCustomOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const result = await res.json()
      if (result.success) setCustomOrders(result.orders)
    } finally { setLoading(false) }
  }, [])

  const fetchShopOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shop-orders')
      const result = await res.json()
      if (result.success) setShopOrders(result.orders)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    fetchCustomOrders()
    fetchShopOrders()
  }, [isLoggedIn, fetchCustomOrders, fetchShopOrders])

  useEffect(() => { setNewDraftUrls([]) }, [selectedCustom?.id])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setIsLoggedIn(true)
    else setLoginError('비밀번호가 틀렸습니다.')
  }

  const updateCustomOrder = async (id: string, patch: Partial<Order>) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const result = await res.json()
    if (result.success) {
      setCustomOrders(prev => prev.map(o => o.id === id ? { ...o, ...result.order } : o))
      if (selectedCustom?.id === id) setSelectedCustom(result.order)
    }
  }

  const deleteCustomOrder = async (id: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (result.success) { setCustomOrders(prev => prev.filter(o => o.id !== id)); setSelectedCustom(null) }
  }

  const updateShopOrder = async (id: string, patch: Partial<ShopOrder>) => {
    const res = await fetch(`/api/shop-orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const result = await res.json()
    if (result.success) {
      setShopOrders(prev => prev.map(o => o.id === id ? { ...o, ...result.order } : o))
      if (selectedShop?.id === id) setSelectedShop(result.order)
    }
  }

  const uploadDraftFiles = async (files: FileList) => {
    setDraftUploading(true)
    const urls: string[] = []
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData(); fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const result = await res.json()
        if (result.success) urls.push(result.url)
      }
      setNewDraftUrls(prev => [...prev, ...urls])
    } finally { setDraftUploading(false) }
  }

  const sendDraft = async () => {
    if (!selectedCustom) return
    const allDrafts = [...(selectedCustom.draft_images || []), ...newDraftUrls]
    await updateCustomOrder(selectedCustom.id, { draft_images: allDrafts, status: '시안 확인 요청중' })
    setNewDraftUrls([])
  }

  const copyReviewLink = (id: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/review/${id}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ─────── 로그인 화면 ───────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl shadow">🔒</div>
            <h1 className="text-lg font-bold text-gray-800">관리자 페이지</h1>
            <p className="text-sm text-gray-400 mt-1">일비롱디자인</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password" value={password}
              onChange={e => { setPassword(e.target.value); setLoginError('') }}
              placeholder="비밀번호"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400"
            />
            {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-sm">
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredCustom = customFilter === '전체' ? customOrders : customOrders.filter(o => o.status === customFilter)

  // ─────── 메인 관리자 UI ───────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-800">🌸 일비롱디자인 관리자</h1>
            <p className="text-xs text-gray-400">주문 관리 페이지</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchCustomOrders(); fetchShopOrders() }} className="text-sm text-pink-500 font-medium">새로고침</button>
            <a href="/" className="text-sm text-gray-400">홈</a>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-5">
          {(['몰 주문', '비규격 주문'] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition ${tab === t ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t} {t === '몰 주문' ? `(${shopOrders.length})` : `(${customOrders.length})`}
            </button>
          ))}
        </div>

        {/* ─── 몰 주문 탭 ─── */}
        {tab === '몰 주문' && (
          <>
            {loading ? (
              <p className="text-center py-16 text-gray-400">불러오는 중...</p>
            ) : shopOrders.length === 0 ? (
              <p className="text-center py-16 text-gray-400">주문이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {shopOrders.map(order => (
                  <div key={order.id} onClick={() => setSelectedShop(order)}
                    className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {order.payment_status === 'paid' ? '💳 결제완료' : '⏳ 결제대기'}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-semibold text-gray-800">{order.customer_name} <span className="font-normal text-gray-500 text-sm">({order.phone})</span></p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {Array.isArray(order.items) ? `${order.items.length}종 상품` : ''} · 총 <span className="font-bold text-pink-600">{order.grand_total?.toLocaleString()}원</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── 비규격 주문 탭 ─── */}
        {tab === '비규격 주문' && (
          <>
            {/* 상태 필터 */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {(['전체', ...ALL_STATUSES] as const).map(s => (
                <button key={s} onClick={() => setCustomFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex-none ${customFilter === s ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {s} ({s === '전체' ? customOrders.length : customOrders.filter(o => o.status === s).length})
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center py-16 text-gray-400">불러오는 중...</p>
            ) : filteredCustom.length === 0 ? (
              <p className="text-center py-16 text-gray-400">주문이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {filteredCustom.map(order => (
                  <div key={order.id} onClick={() => setSelectedCustom(order)}
                    className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                          {order.revision_count > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.revision_count > 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                              {order.revision_count > 2 ? `💰 ${order.revision_count}차 수정` : `${order.revision_count}차 수정`}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-semibold text-gray-800">{order.customer_name} <span className="font-normal text-gray-500 text-sm">({order.phone})</span></p>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{order.product_type} · {order.width_cm}×{order.height_cm}cm · {order.quantity}개</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── 비규격 주문 상세 모달 ─── */}
      {selectedCustom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedCustom(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="font-bold text-gray-800">{selectedCustom.customer_name} 님 주문</h2>
                <p className="text-xs text-gray-400">{new Date(selectedCustom.created_at).toLocaleString('ko-KR')}</p>
              </div>
              <button onClick={() => setSelectedCustom(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[selectedCustom.status]}`}>{selectedCustom.status}</span>

              {selectedCustom.status === '시안 수정 요청' && selectedCustom.revision_notes && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">✏️ 고객 수정 요청 내용</p>
                  <p className="text-sm text-orange-800">{selectedCustom.revision_notes}</p>
                </div>
              )}

              <DR label="연락처" value={selectedCustom.phone} />
              <DR label="제품 종류" value={selectedCustom.product_type} />
              <DR label="디자인 방식" value={selectedCustom.design_type} />
              <DR label="사이즈" value={`${selectedCustom.width_cm}×${selectedCustom.height_cm}cm`} />
              <DR label="수량" value={`${selectedCustom.quantity}개`} />
              {selectedCustom.text_corrections && <DR label="문구 수정" value={selectedCustom.text_corrections} />}
              <DR label="배송주소" value={selectedCustom.shipping_address} />
              <DR label="결제방법" value={selectedCustom.payment_method} />
              <DR label="기타 요청" value={selectedCustom.other_requests || '-'} />

              {/* 시안 이미지 */}
              {selectedCustom.draft_images?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">현재 시안</p>
                  <div className="space-y-2">
                    {selectedCustom.draft_images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`시안${i + 1}`} className="w-full rounded-xl border" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 상태 변경 액션 */}
              <div className="pt-2 space-y-3">
                {selectedCustom.status === '접수' && (
                  <button onClick={() => updateCustomOrder(selectedCustom.id, { status: '작업중' })}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
                    작업 시작
                  </button>
                )}

                {(selectedCustom.status === '작업중' || selectedCustom.status === '시안 수정 작업중') && (
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">시안 이미지 업로드</p>
                    {newDraftUrls.length > 0 && newDraftUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="w-full rounded-xl border" />
                    ))}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => e.target.files && uploadDraftFiles(e.target.files)} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={draftUploading}
                      className="w-full py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
                      {draftUploading ? '업로드 중...' : '+ 이미지 선택'}
                    </button>
                    {newDraftUrls.length > 0 && (
                      <button onClick={sendDraft}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
                        📤 시안 확인 요청 보내기
                      </button>
                    )}
                  </div>
                )}

                {selectedCustom.status === '시안 확인 요청중' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-yellow-800">⏳ 고객 응답 대기중</p>
                    <p className="text-xs text-yellow-700">아래 링크를 고객에게 카톡으로 전달해주세요.</p>
                    <div className="flex gap-2">
                      <input readOnly value={`${BASE_URL}/review/${selectedCustom.id}`}
                        className="flex-1 text-xs bg-white border border-yellow-300 rounded-lg px-3 py-2 text-gray-600" />
                      <button onClick={() => copyReviewLink(selectedCustom.id)}
                        className="px-3 py-2 bg-yellow-400 text-white rounded-lg text-xs font-medium hover:bg-yellow-500 transition whitespace-nowrap">
                        {copied ? '복사됨 ✓' : '복사'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedCustom.status === '시안 수정 요청' && (
                  <button onClick={() => updateCustomOrder(selectedCustom.id, { status: '시안 수정 작업중' })}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
                    ✏️ 수정 작업 시작
                  </button>
                )}

                {selectedCustom.status === '시안 확정' && (
                  <button onClick={() => updateCustomOrder(selectedCustom.id, { status: '완료' })}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition">
                    ✅ 생산 완료 처리
                  </button>
                )}

                {/* 상태 직접 변경 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">상태 직접 변경</p>
                  <select
                    value={selectedCustom.status}
                    onChange={e => updateCustomOrder(selectedCustom.id, { status: e.target.value as OrderStatus })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => deleteCustomOrder(selectedCustom.id)}
                    className="flex-1 px-4 py-3 border border-red-300 text-red-500 rounded-xl text-sm hover:bg-red-50 transition">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 몰 주문 상세 모달 ─── */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedShop(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="font-bold text-gray-800">{selectedShop.customer_name} 님 주문</h2>
                <p className="text-xs text-gray-400">{new Date(selectedShop.created_at).toLocaleString('ko-KR')}</p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[selectedShop.status]}`}>{selectedShop.status}</span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${selectedShop.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selectedShop.payment_status === 'paid' ? '💳 결제완료' : '⏳ 결제대기'}
                </span>
              </div>

              <DR label="연락처" value={selectedShop.phone} />
              <DR label="배송주소" value={selectedShop.shipping_address || '-'} />
              <DR label="결제방법" value={selectedShop.payment_method} />
              {selectedShop.email && <DR label="이메일" value={selectedShop.email} />}

              {/* 주문 상품 */}
              {Array.isArray(selectedShop.items) && selectedShop.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">주문 상품</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {selectedShop.items.map((item: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                      <p className="font-medium text-gray-800">{item.product?.name || item.productName}</p>
                      {item.selectedSizeOption && <p className="text-xs text-gray-500">사이즈: {item.selectedSizeOption.name}</p>}
                      {item.selectedVariant && <p className="text-xs text-gray-500">옵션: {item.selectedVariant.name}</p>}
                      {item.institutionName && <p className="text-xs text-teal-600">기관명: {item.institutionName}</p>}
                      {item.textChange && <p className="text-xs text-purple-500">문구: {item.textChange}</p>}
                      <p className="text-xs text-gray-500 mt-1">{item.quantity}개 · {(item.unitPrice * item.quantity).toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-pink-50 rounded-xl p-3 text-sm">
                <div className="flex justify-between text-gray-500"><span>상품 합계</span><span>{selectedShop.items_total?.toLocaleString()}원</span></div>
                <div className="flex justify-between text-gray-500 mt-1"><span>배송비</span><span>{selectedShop.shipping_fee?.toLocaleString()}원</span></div>
                <div className="flex justify-between font-bold text-pink-600 mt-2 pt-2 border-t border-pink-200"><span>총 결제금액</span><span>{selectedShop.grand_total?.toLocaleString()}원</span></div>
              </div>

              {selectedShop.other_requests && <DR label="기타 요청" value={selectedShop.other_requests} />}

              {/* 상태 변경 */}
              <div>
                <p className="text-xs text-gray-500 mb-2">주문 상태 변경</p>
                <select
                  value={selectedShop.status}
                  onChange={e => updateShopOrder(selectedShop.id, { status: e.target.value as OrderStatus })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DR({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  )
}
