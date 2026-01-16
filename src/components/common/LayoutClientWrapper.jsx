"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";

import Footer from "./Footer";
import Navbar from "./Navbar";

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // ⏱ Track last back press time
  const lastBackPress = useRef(0);

  // 🎯 Paths where Navbar & Footer are hidden
  const hiddenPaths = [
    "/admin-dashboard",
    "/auth",
    "/athena",
    "/scan",
  ];

  const shouldHideComponent = hiddenPaths.some(segment =>
    pathname.includes(segment)
  );

  // 📱 ANDROID BACK BUTTON HANDLER WITH TOAST
  useEffect(() => {
    if (!window?.Capacitor) return;

    const listener = App.addListener("backButton", async ({ canGoBack }) => {

      // 🟢 Normal back navigation
      if (canGoBack && pathname !== "/") {
        router.back();
        return;
      }

      // 🔴 Home page → double back to exit
      const now = Date.now();

      if (now - lastBackPress.current < 2000) {
        App.exitApp();
      } else {
        lastBackPress.current = now;
        await Toast.show({
          text: "Press back again to exit",
          duration: "short",
          position: "bottom",
        });
      }
    });

    return () => {
      listener.remove();
    };
  }, [pathname, router]);

  return (
    <>
      {!shouldHideComponent && <Navbar />}

      {children}

      {!shouldHideComponent && <Footer />}
    </>
  );
}
