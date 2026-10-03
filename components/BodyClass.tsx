"use client";

import { useEffect } from "react";

export function BodyClass({ className }: { className: string }) {
  useEffect(() => {
    document.body.className = className;
    return () => {
      document.body.className = "";
      document.body.removeAttribute("class");
    };
  }, [className]);
  return null;
}
