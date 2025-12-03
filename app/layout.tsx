import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGateProvider } from "@/context/AuthGateContext";
import AuthGatePopup from "@/components/AuthGatePopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SketchoFlow - AI-Powered Creative Workspace",
  description: "Generate, sketch, or transform with the power of AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <StyledComponentsRegistry>
          <AuthProvider>
            <AuthGateProvider>
              <ThemeProvider>
                {children}
                <AuthGatePopup />
              </ThemeProvider>
            </AuthGateProvider>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
