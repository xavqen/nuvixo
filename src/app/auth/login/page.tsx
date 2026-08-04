"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Eye, EyeOff, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard/notes";
  const verified    = searchParams.get("verified") === "true";

  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (verified) toast.success("Email verified! You can now log in.", { id: "verified" });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email before logging in.");
      } else {
        toast.error("Invalid email or password.");
      }
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleGoogle() {
    setGLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-border bg-card shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-xl mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">Nuvixo</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access your notes</p>
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-3 mb-6 h-11"
          onClick={handleGoogle}
          disabled={gLoading}
        >
          {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-card px-3 text-xs text-muted-foreground">or</span>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" className="h-11 rounded-xl" />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                {...form.register("password")}
                placeholder="••••••••"
                className="h-11 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90 rounded-xl font-semibold"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">Create one free</Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">Loading…</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
