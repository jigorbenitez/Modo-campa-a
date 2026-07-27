"use client";

import { useEffect } from "react";

export function useTheme() {
  useEffect(() => {
    const stored = localStorage.getItem("modo-campana-theme");
    const preferred = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored ?? preferred;
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("modo-campana-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return { toggleTheme };
}
