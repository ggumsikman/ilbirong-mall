'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const PRODUCT_TYPES = ['현수막', '포맥스 A4', '포맥스 A3', '포맥스 (직접입력)', '패트배너', '실사출력', '기타']
const DESIGN_TYPES  = ['기본 디자인 선택', '맞춤 디자인 요청', '직접 파일 제공']
const PAYMENT_METHODS  = ['계좌이체', '카드결제']
const FINISHING_OPTIONS = ['열재단', '아일렛타공', '각목마감']

interface ItemForm {
  product_type: string
  product_type_custom: string
  design_type: string
  design_name: string
  design_sub_name: string
  width_cm: string
  height_cm: string
  quantity: string
  finishing: string[]
}

const defaultItem = (): ItemForm => ({
  product_type: '', product_type_custom: '',
  design_type: '', design_name: '', design_sub_name: '',
  width_cm: '', height_cm: '', quantity: '1', finishing: [],
})

export default function CustomOrderPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    customer_name: '', phone: '',
    text_top: '', text_main: '', text_bottom: '', text_corrections: '',
    needs_statement: false, statement_email: '',
    shipping_address: '', payment_method: '', receipt_type: '',
    business_number: '', email: '', card_phone: '', other_requests: '',
  })
  const [items, setItems]   = useState<ItemForm[]>([defaultItem()])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const toggleFinishing = (index: number, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const finishing = item.finishing.includes(value)
        ? item.finishing.filter(f => f !== value)
        : [...item.finishing, value]
      return { ...item, finishing }
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) { alert('이미지는 최대 5장까지 업로드 가능합니다.'); return }
    setImages(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.customer_name.trim()) errs.customer_name = '이름/기관명을 입력해주세요.'
    if (!form.phone.trim()) errs.phone = '연락처를 입력해주세요.'
    items.forEach((item, i) => {
      if (!item.product_type) errs[`item_${i}_product_type`] = '제품 종류를 선택해주세요.'
      if (item.product_type === '포맥스 (직접입력)' && !item.product_type_custom.trim())
        errs[`item_${i}_product_type_custom`] = '제품 종류를 입력해주세요.'
      if (!item.design_type) errs[`item_${i}_design_type`] = '디자인 방식을 선택해주세요.'
      if (!item.width_cm)  errs[`item_${i}_width_cm`]  = '가로 사이즈를 입력해주세요.'
      if (!item.height_cm) errs[`item_${i}_height_cm`] = '세로 사이즈를 입력해주세요.'
      if (!item.quantity || parseInt(item.quantity) < 1) errs[`item_${i}_quantity`] = '수량을 입력해주세요.'
    })
    if (!form.shipping_address.trim()) errs.shipping_address = '배송주소를 입력해주세요.'
    if (!form.payment_method) errs.payment_method = '결제방법을 선택해주세요.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)

    try {
      const imageUrls: string[] = []
      for (const image of images) {
        const fd = new FormData(); fd.append('file', image)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const result = await res.json()
        if (result.success) imageUrls.push(result.url)
      }

      const firstItem = items[0]
      const productType = firstItem.product_type === '포맥스 (직접입력)'
        ? firstItem.product_type_custom : firstItem.product_type

      const orderItems = items.map(item => ({
        product_type: item.product_type === '포맥스 (직접입력)' ? item.product_type_custom : item.product_type,
        design_type: item.design_type, design_name: item.design_name, design_sub_name: item.design_sub_name,
        width_cm: parseFloat(item.width_cm) || null, height_cm: parseFloat(item.height_cm) || null,
        quantity: parseInt(item.quantity), finishing: item.finishing,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, product_type: productType, design_type: firstItem.design_type,
          width_cm: firstItem.width_cm, height_cm: firstItem.height_cm, quantity: firstItem.quantity,
          items: orderItems, image_urls: imageUrls,
        }),
      })
      const result = await res.json()
      if (result.success) router.push('/custom-order/complete')
      else alert('주문 접수에 실패했습니다. 다시 시도해주세요.')
    } catch { alert('오류가 발생했습니다. 다시 시도해주세요.') }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      <Header />

      <div className="max-w-xl mx-auto px-4 pt-4 pb-8">
        <h1 className="text-xl font-bold text-gray-800 mb-1">📝 비규격 주문서</h1>
        <p className="text-sm text-gray-400 mb-4">규격 외 맞춤 제작 주문 접수</p>

        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-sm text-pink-700 mb-5">
          안녕하세요! 아래 양식을 작성해주시면 빠르게 확인 후 연락드릴게요.
          <span className="font-semibold"> 시안 작업 2회까지 무료</span>이며, 이후 회당 3,000원이 추가됩니다.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 고객 정보 */}
          <Section title="고객 정보">
            <Field label="이름 / 기관명" required error={errors.customer_name}>
              <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="홍길동 / 일비롱유치원" className={ic(errors.customer_name)} />
            </Field>
            <Field label="시안 확인 가능한 연락처" required error={errors.phone}>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" inputMode="tel" className={ic(errors.phone)} />
            </Field>
          </Section>

          {/* 주문 항목 */}
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 text-sm">
                  주문 항목 {items.length > 1 ? index + 1 : ''}
                </h2>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== index))} className="text-red-400 text-sm hover:text-red-600">삭제</button>
                )}
              </div>
              <div className="space-y-3">
                <Field label="제품 종류" required error={errors[`item_${index}_product_type`]}>
                  <select value={item.product_type} onChange={e => updateItem(index, 'product_type', e.target.value)} className={ic(errors[`item_${index}_product_type`])}>
                    <option value="">선택해주세요</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                {item.product_type === '포맥스 (직접입력)' && (
                  <Field label="제품 종류 직접 입력" required error={errors[`item_${index}_product_type_custom`]}>
                    <input value={item.product_type_custom} onChange={e => updateItem(index, 'product_type_custom', e.target.value)} placeholder="예) 포맥스 B4" className={ic(errors[`item_${index}_product_type_custom`])} />
                  </Field>
                )}
                <Field label="디자인 방식" required error={errors[`item_${index}_design_type`]}>
                  <select value={item.design_type} onChange={e => updateItem(index, 'design_type', e.target.value)} className={ic(errors[`item_${index}_design_type`])}>
                    <option value="">선택해주세요</option>
                    {DESIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                {item.design_type === '기본 디자인 선택' && (
                  <>
                    <Field label="디자인 이름">
                      <input value={item.design_name} onChange={e => updateItem(index, 'design_name', e.target.value)} placeholder="예) 식목일 생태체험" className={ic()} />
                      <p className="text-xs text-gray-400 mt-1">스토어 상세페이지의 디자인 이름을 적어주세요.</p>
                    </Field>
                    <Field label="세부 디자인 (색상/버전)">
                      <input value={item.design_sub_name} onChange={e => updateItem(index, 'design_sub_name', e.target.value)} placeholder="예) 초록나무, 핑크버전" className={ic()} />
                    </Field>
                  </>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">사이즈 (cm) <span className="text-pink-500">*</span></p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="가로" required error={errors[`item_${index}_width_cm`]}>
                      <input value={item.width_cm} onChange={e => updateItem(index, 'width_cm', e.target.value)} type="number" placeholder="예) 600" inputMode="decimal" className={ic(errors[`item_${index}_width_cm`])} />
                    </Field>
                    <Field label="세로" required error={errors[`item_${index}_height_cm`]}>
                      <input value={item.height_cm} onChange={e => updateItem(index, 'height_cm', e.target.value)} type="number" placeholder="예) 90" inputMode="decimal" className={ic(errors[`item_${index}_height_cm`])} />
                    </Field>
                  </div>
                </div>
                <Field label="수량" required error={errors[`item_${index}_quantity`]}>
                  <input value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} type="number" min="1" inputMode="numeric" className={ic(errors[`item_${index}_quantity`])} />
                </Field>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">후가공 (선택)</p>
                  <div className="flex gap-2 flex-wrap">
                    {FINISHING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleFinishing(index, opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm border-2 transition ${item.finishing.includes(opt) ? 'bg-pink-500 border-pink-500 text-white font-semibold' : 'border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={() => setItems(prev => [...prev, defaultItem()])}
            className="w-full py-3 border-2 border-dashed border-pink-300 rounded-2xl text-pink-500 text-sm font-medium hover:bg-pink-50 transition">
            + 주문 항목 추가
          </button>

          {/* 문구 내용 */}
          <Section title="문구 내용 (선택)">
            <p className="text-xs text-gray-400 -mt-1">기본 디자인의 문구를 변경하거나, 새로 입력할 내용을 적어주세요.</p>
            <Field label="상단 문구">
              <input name="text_top" value={form.text_top} onChange={handleChange} placeholder="예) ❤지구를 지켜요❤" className={ic()} />
            </Field>
            <Field label="메인 문구">
              <input name="text_main" value={form.text_main} onChange={handleChange} placeholder="예) 지구를 구하는 초록 이야기" className={ic()} />
            </Field>
            <Field label="기관명">
              <input name="text_bottom" value={form.text_bottom} onChange={handleChange} placeholder="예) 일비롱어린이집" className={ic()} />
            </Field>
            <Field label="기타 문구 수정사항">
              <textarea name="text_corrections" value={form.text_corrections} onChange={handleChange} placeholder="위 항목 외 추가 변경사항을 자유롭게 적어주세요." rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none" />
            </Field>
          </Section>

          {/* 배송 및 결제 */}
          <Section title="배송 및 결제">
            <Field label="배송주소" required error={errors.shipping_address}>
              <input name="shipping_address" value={form.shipping_address} onChange={handleChange} placeholder="도로명 주소를 입력해주세요" className={ic(errors.shipping_address)} />
            </Field>
            <Field label="결제방법" required error={errors.payment_method}>
              <div className="flex gap-3">
                {PAYMENT_METHODS.map(m => (
                  <label key={m} className={`flex-1 border-2 rounded-xl py-3 text-center text-sm cursor-pointer transition ${form.payment_method === m ? 'bg-pink-500 border-pink-500 text-white font-semibold' : 'border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                    <input type="radio" name="payment_method" value={m} checked={form.payment_method === m} onChange={handleChange} className="hidden" />{m}
                  </label>
                ))}
              </div>
              {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>}
            </Field>

            {form.payment_method === '계좌이체' && (
              <>
                <Field label="세금계산서 / 현금영수증" error={errors.receipt_type}>
                  <div className="flex gap-3">
                    {['현금영수증', '세금계산서'].map(r => (
                      <label key={r} className={`flex-1 border-2 rounded-xl py-3 text-center text-sm cursor-pointer transition ${form.receipt_type === r ? 'bg-purple-500 border-purple-500 text-white font-semibold' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                        <input type="radio" name="receipt_type" value={r} checked={form.receipt_type === r} onChange={handleChange} className="hidden" />{r}
                      </label>
                    ))}
                  </div>
                </Field>
                {form.receipt_type === '세금계산서' && (
                  <Field label="사업자등록번호" error={errors.business_number}>
                    <input name="business_number" value={form.business_number} onChange={handleChange} placeholder="000-00-00000" className={ic(errors.business_number)} />
                  </Field>
                )}
                <Field label="이메일 주소">
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="example@email.com" className={ic()} />
                </Field>
              </>
            )}

            {form.payment_method === '카드결제' && (
              <>
                <Field label="결제 링크 받을 휴대폰번호">
                  <input name="card_phone" value={form.card_phone} onChange={handleChange} placeholder="010-0000-0000" inputMode="tel" className={ic()} />
                </Field>
                <Field label="이메일 주소">
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="example@email.com" className={ic()} />
                </Field>
              </>
            )}

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.needs_statement} onChange={e => setForm(prev => ({ ...prev, needs_statement: e.target.checked }))} className="w-4 h-4 accent-pink-500" />
                <span className="text-sm text-gray-700">거래명세서 / 견적서 이메일 발송 요청</span>
              </label>
              {form.needs_statement && (
                <input name="statement_email" value={form.statement_email} onChange={handleChange} type="email" placeholder="받으실 이메일 주소" className={`mt-2 ${ic()}`} />
              )}
            </div>
          </Section>

          {/* 기타 + 이미지 */}
          <Section title="기타 요청사항 (선택)">
            <textarea name="other_requests" value={form.other_requests} onChange={handleChange} placeholder="추가로 전달하고 싶은 내용을 자유롭게 적어주세요." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none" />
            <div>
              <p className="text-xs text-gray-500 mb-2">참고 이미지 첨부 (선택, 최대 5장)</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-pink-300 rounded-xl py-3 text-pink-500 text-sm hover:bg-pink-50 transition">
                + 이미지 추가
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-4 rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-60 shadow-sm">
            {isSubmitting ? '접수 중...' : '주문 접수하기'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h2 className="font-bold text-gray-800 mb-4 text-sm">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function ic(error?: string) {
  return `w-full border-2 ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 bg-white transition`
}
