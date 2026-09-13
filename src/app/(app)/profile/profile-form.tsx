"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fmtDate, fromNow } from "@/lib/format";

type P = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  account_status: string;
  created_at: string;
  last_login_at: string | null;
};

export function ProfileForm({ profile }: { profile: P }) {
  const router = useRouter();
  const supabase = useRef(createClient());
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.full_name ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function saveName() {
    setSaving(true);
    const { error } = await supabase.current.from("profiles").update({ full_name: name.trim() || null }).eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated.");
      router.refresh();
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image.");
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3 MB.");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.current.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.current.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      const { error } = await supabase.current.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      if (error) throw error;
      setAvatar(url);
      toast.success("Photo updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar name={name} email={profile.email} src={avatar} size={80} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change photo"
            className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-foreground">{profile.full_name ?? profile.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone={profile.role === "admin" ? "primary" : "neutral"}>
              {profile.role === "admin" ? "Administrator" : "Flat member"}
            </Badge>
            <Badge tone="success" dot>{profile.account_status}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">Display name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input max-w-sm" placeholder="Your name" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Email" value={profile.email} />
          <Info label="Joined" value={fmtDate(profile.created_at)} />
          <Info label="Last login" value={profile.last_login_at ? fromNow(profile.last_login_at) : "—"} />
        </div>

        <div className="pt-2">
          <Button onClick={saveName} disabled={saving || name.trim() === (profile.full_name ?? "")}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
