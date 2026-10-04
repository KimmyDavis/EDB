export const buildWhatsAppLink = (phone, message = "") => {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${params}`;
};

export const buildApprovalRequestMessage = (username, fallback = "a new user") =>
  `Hello, my EDB account (${username || fallback}) is awaiting your approval. Could you please review it? Thank you.`;
