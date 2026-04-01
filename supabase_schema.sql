-- =============================================
-- 일비롱디자인 자사몰 Supabase 스키마
-- =============================================

-- 1. 기존 비규격 주문 테이블 (order 프로젝트에서 마이그레이션 또는 그대로 사용)
-- orders 테이블이 이미 있다면 아래 CREATE 생략

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_type TEXT NOT NULL,
  design_type TEXT NOT NULL,
  width_cm NUMERIC,
  height_cm NUMERIC,
  quantity INTEGER NOT NULL,
  text_top TEXT,
  text_main TEXT,
  text_bottom TEXT,
  text_corrections TEXT DEFAULT '',
  needs_statement BOOLEAN DEFAULT FALSE,
  statement_email TEXT,
  shipping_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_type TEXT,
  business_number TEXT,
  email TEXT,
  card_phone TEXT,
  payment_link TEXT,
  items JSONB,
  other_requests TEXT DEFAULT '',
  image_urls TEXT[] DEFAULT '{}',
  draft_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT '접수' CHECK (status IN ('접수', '작업중', '시안 확인 요청중', '시안 수정 요청', '시안 수정 작업중', '시안 확정', '완료', '취소')),
  revision_count INTEGER DEFAULT 0,
  revision_notes TEXT DEFAULT ''
);

-- 2. 자사몰 주문 테이블 (장바구니 → 결제 완료 주문)
CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT DEFAULT '',
  payment_method TEXT NOT NULL,
  receipt_type TEXT,
  business_number TEXT,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  items_total INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL DEFAULT 0,
  toss_order_id TEXT,
  toss_payment_key TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  status TEXT DEFAULT '접수' CHECK (status IN ('접수', '작업중', '시안 확인 요청중', '시안 수정 요청', '시안 수정 작업중', '시안 확정', '완료', '취소')),
  other_requests TEXT DEFAULT ''
);

-- 인덱스
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS shop_orders_created_at_idx ON shop_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS shop_orders_payment_status_idx ON shop_orders (payment_status);

-- RLS 설정
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- orders RLS 정책
CREATE POLICY IF NOT EXISTS "anon can insert orders" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon can select orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon can update orders" ON orders FOR UPDATE TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon can delete orders" ON orders FOR DELETE TO anon USING (true);

-- shop_orders RLS 정책
CREATE POLICY IF NOT EXISTS "anon can insert shop_orders" ON shop_orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon can select shop_orders" ON shop_orders FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon can update shop_orders" ON shop_orders FOR UPDATE TO anon USING (true);

-- Storage 버킷: Supabase 대시보드 > Storage에서 'order-images' 버킷을 Public으로 생성하세요
