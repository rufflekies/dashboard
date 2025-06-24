import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            {children}
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
