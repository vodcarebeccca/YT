import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="relative flex w-full justify-center">
        <Suspense fallback={null}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </main>
  );
}
