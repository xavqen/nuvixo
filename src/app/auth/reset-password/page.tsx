"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const schema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type Form = z.infer<typeof schema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    if (!token) { toast.error("Invalid or missing reset token."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Password reset! Please log in with your new password.");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-card shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-xl mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">Nuvixo</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold">Set new password</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} {...form.register("password")} className="h-11 rounded-xl pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" {...form.register("confirm")} className="h-11 rounded-xl" placeholder="••••••••" />
            {form.formState.errors.confirm && <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>}
          </div>
          <Button type="submit" disabled={loading || !token} className="w-full h-11 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-xl font-semibold">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">Loading…</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
