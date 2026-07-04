import { MessageCircle } from "lucide-react";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href={generalWhatsAppUrl()}
      target="_blank"
      rel="noopener"
      aria-label="Escribir por WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
