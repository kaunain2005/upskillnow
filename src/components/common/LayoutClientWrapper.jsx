// src/components/common/LayoutClientWrapper.jsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';
// Assuming Navbar is also in this directory if you want to hide it
// import Navbar from './Navbar'; 

export default function LayoutClientWrapper({ children }) {
    const pathname = usePathname();

    // 🎯 Define the paths where you want the Footer to be HIDDEN.
    // Use path segments. If the pathname *includes* any of these, the component will be hidden.
    const hiddenPaths = [
        "/admin-dashboard", // Hides on all pages inside /admin-dashboard/...
        "/auth",     // Hides specifically on the auth pages
        "/athena",
    ];

    // Check if the current path matches any path segment defined in hiddenPaths
    const shouldHideComponent = hiddenPaths.some(segment =>
        pathname.includes(segment)
    );

    return (
        <>
            {/* 1. Conditionally render the Navbar */}
            {!shouldHideComponent && <Navbar />}

            {/* 2. Render the main page content */}
            {children}

            {/* 3. Conditionally render the Footer */}
            {!shouldHideComponent && <Footer />}
        </>
    );
}