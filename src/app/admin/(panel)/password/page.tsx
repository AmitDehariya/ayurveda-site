import { AdminPageHeader } from "@/components/admin/admin-shell";
import { PasswordForm } from "./password-form";

export default function PasswordPage() {
  return (
    <>
      <AdminPageHeader title="Change password" description="After changing it you will be asked to sign in again with the new password." />
      <div className="max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <PasswordForm />
      </div>
    </>
  );
}
