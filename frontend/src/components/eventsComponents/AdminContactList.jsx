"use client";
import { MessageCircle, Phone, UserRound } from "lucide-react";
import { useQueryAdminsQuery } from "@/features/users/usersApiSlice";
import { authClient } from "@/lib/authClient";
import {
  buildApprovalRequestMessage,
  buildWhatsAppLink,
} from "@/lib/whatsapp";

const AdminContactList = () => {
  const { data, isLoading, isError } = useQueryAdminsQuery();
  const { data: authData } = authClient.useSession();
  const currentUser = authData?.user;
  const message = buildApprovalRequestMessage(
    currentUser?.username,
    currentUser?.email || "a new user",
  );

  const admins = (data?.users || []).filter(
    (admin) => admin && String(admin.phone || "").trim(),
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-theme-gold/30 bg-[#fff7] p-4 text-sm text-slate-600">
        Loading admins...
      </div>
    );
  }

  if (isError || admins.length === 0) {
    return (
      <div className="rounded-xl border border-theme-gold/30 bg-[#fff7] p-4 text-sm text-slate-600">
        No admin contact numbers are available right now. Please try again
        later or contact the parish directly.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900">
        Contact an admin to get approved
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {admins.map((admin) => {
          const link = buildWhatsAppLink(admin.phone, message);
          return (
            <a
              key={admin._id || admin.id}
              href={link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!link}
              className={`flex items-center gap-3 rounded-xl border border-theme-gold/30 bg-[#fff7] p-4 transition ${
                link
                  ? "hover:border-theme-gold/60 hover:shadow-md"
                  : "pointer-events-none opacity-60"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-gold text-white">
                <UserRound className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-900">
                  {admin.name || admin.username || "Admin"}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                  <Phone className="h-3 w-3" />
                  {admin.phone}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <MessageCircle className="h-3 w-3" />
                  Request approval on WhatsApp
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AdminContactList;
