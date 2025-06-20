import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <Image
          src="/Container.png"
          alt="Oncare Logo"
          width={240}
          height={100}
          priority
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Oncare에 오신 것을 환영합니다.
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          요양보호사와 사회복지사를 위한 통합 관리 솔루션입니다.
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            회원가입
          </Link>
          <a
            href="http://oncare-2087995465.ap-northeast-2.elb.amazonaws.com/auth/kakao"
            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
          >
            카카오 로그인
          </a>
        </div>
      </div>
    </main>
  );
}
