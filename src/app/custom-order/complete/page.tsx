import Link from 'next/link'

export default function CustomOrderCompletePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">주문 접수 완료!</h1>
        <p className="text-gray-500 text-sm mb-6">감사합니다 💛 빠르게 확인 후 연락드릴게요.</p>
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">📱</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">카카오톡으로 연락드릴게요</p>
              <p className="text-xs text-gray-400 mt-0.5">시안 확인 및 결제 안내를 드립니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎨</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">시안 작업 2회 무료</p>
              <p className="text-xs text-gray-400 mt-0.5">이후 수정은 회당 3,000원이 추가됩니다.</p>
            </div>
          </div>
        </div>
        <Link href="/" className="block w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
