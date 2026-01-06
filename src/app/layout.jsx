// src/app/layout.jsx
// NOTE: Retaining "use client" here because of AuthProvider and Providers
// If those providers are also client components, this layout must be client-side.
"use client";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "./providers";
// ❌ REMOVE: Remove the direct import of Footer from here
// import Footer from "@/components/common/Footer"; 

// 🎯 NEW: Import the wrapper component
import LayoutClientWrapper from "@/components/common/LayoutClientWrapper";
import AuthGuard from "@/components/AuthGuard";


// We still cannot export metadata from a client component. 
// If you need metadata, you must move it to a dedicated server layout file.

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <Providers>
                        {/* 🎯 Wrap the children (page content) in the client wrapper */}
                        <AuthGuard>
                            <LayoutClientWrapper>
                                {children}
                            </LayoutClientWrapper>
                        </AuthGuard>
                        {/* ❌ REMOVE: The Footer is now rendered conditionally inside LayoutClientWrapper */}
                    </Providers>
                </AuthProvider>
            </body>
        </html >
    );
}