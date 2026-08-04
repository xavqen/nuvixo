"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, BookOpen, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-card shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-xl mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">Nuvixo</span>
          </Link>
          {sent ? (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-blue-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                If an account with that email exists, we&apos;ve sent a password reset link.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold">Forgot password?</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" className="h-11 rounded-xl" />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-xl font-semibold">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}

        <Link href="/auth/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to login
        </Link>
      </div>
    </motion.div>
  );
}
