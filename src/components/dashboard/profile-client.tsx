"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name:  z.string().min(2).max(100),
  phone: z.string().optional(),
  bio:   z.string().max(500).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileClientProps {
  user: {
    id: string; name: string | null; email: string; image: string | null;
    phone: string | null; bio: string | null; createdAt: Date;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:  user.name ?? "",
      phone: user.phone ?? "",
      bio:   user.bio ?? "",
    },
  });

  async function onSubmit(data: ProfileForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await update({ name: data.name });
        toast.success("Profile updated!");
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold mb-8">Profile</h1>

      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-brand-400 to-violet-500 text-white text-2xl font-bold">
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user.name ?? "Student"}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {formatDate(user.createdAt, { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} className="rounded-lg" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} placeholder="+91 98765 43210" className="rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email} disabled className="rounded-lg bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Tell us a little about yourself..."
              className="rounded-lg resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{form.watch("bio")?.length ?? 0}/500</p>
          </div>

          <Button type="submit" disabled={loading} className="bg-gradient-to-r from-brand-600 to-violet-600 text-white">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
