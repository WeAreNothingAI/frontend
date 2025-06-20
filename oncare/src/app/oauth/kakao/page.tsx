"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface AuthResult {
  status: "pending" | "success" | "error";
  message: string;
}

// searchParams를 사용하기 위해 컴포넌트를 분리하고 Suspense로 감쌉니다.
function KakaoAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AuthResult>({
    status: "pending",
    message: "인증 정보를 확인하는 중입니다...",
  });

  useEffect(() => {
    console.log("=== Kakao Auth Callback Page (/oauth/kakao) ===");

    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      setResult({
        status: "pending",
        message: "로그인 정보를 처리 중입니다...",
      });
      try {
        // 1. 토큰을 localStorage에 저장합니다.

        localStorage.setItem("access_token", accessToken);


        // 2. JWT 토큰의 payload를 디코딩하여 사용자 정보를 추출합니다.
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        console.log("JWT Payload:", payload);

        const { sub, name, email, role } = payload;
        if (!role) {
          throw new Error("JWT에 'role' 정보가 없습니다.");
        }

        // 3. 사용자 정보를 localStorage에 저장합니다.
        const userData = { id: sub, name, email, role };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User info saved:", userData);

        setResult({
          status: "success",
          message: `${name}님, 환영합니다! 대시보드로 이동합니다.`,
        });

        // 4. 역할에 따라 적절한 대시보드로 이동합니다.
        const dashboardPath =
          role === "socialWorker"
            ? "/dashboard/social-worker"
            : "/dashboard/care-worker";

        setTimeout(() => router.push(dashboardPath), 1500);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 오류";
        console.error("인증 처리 실패:", error);
        setResult({
          status: "error",
          message: `오류가 발생했습니다: ${errorMessage}`,
        });
      }
    } else {
      console.error("URL에서 accessToken을 찾을 수 없습니다.");
      setResult({
        status: "error",
        message: "로그인에 필요한 정보가 없습니다.",
      });
    }
  }, [router, searchParams]);

  const getIcon = () => {
    switch (result.status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader2 className="w-16 h-16 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto mb-6 flex justify-center">{getIcon()}</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {result.status === "success" && "로그인 성공"}
          {result.status === "pending" && "로그인 처리 중"}
          {result.status === "error" && "로그인 실패"}
        </h2>
        <p className="text-gray-600">{result.message}</p>
      </div>
    </div>
  );
}

// 메인 컴포넌트: Suspense로 감싸서 렌더링
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <KakaoAuthContent />
    </Suspense>
  );

}

