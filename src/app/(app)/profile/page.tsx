import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { profile } = await requireMember();
  return (
    <div>
      <PageHeader title="My profile" description="Update your name and photo. Your email and role are managed by admins." />
      <ProfileForm
        profile={{
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          role: profile.role,
          account_status: profile.account_status,
          created_at: profile.created_at,
          last_login_at: profile.last_login_at,
        }}
      />
    </div>
  );
}
