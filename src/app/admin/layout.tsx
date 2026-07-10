import type { Metadata } from "next";
import { ReactNode } from "react";
import { AdminGate } from "@/components/AdminGate";
import "./admin.css";

export const metadata: Metadata = {
  title: "Administracion | Auto Decoracion G&V",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
