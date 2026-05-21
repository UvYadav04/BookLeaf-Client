import "./globals.css";
import { ReactNode } from "react";
import StoreProvider from "@/store/provider";
import AuthBootstrap from "@/components/AuthBootstrap";
import TopNav from "@/components/TopNav";

export const metadata = {
  title: "BookLeaf Support Portal",
  description: "Author and admin support workflow",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthBootstrap />
          <TopNav />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
