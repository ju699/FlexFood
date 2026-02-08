 "use client";
 import { useEffect } from "react";
 
 export default function ThemeInit() {
   useEffect(() => {
     try {
       const stored = localStorage.getItem("theme");
       const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
       const shouldDark = stored ? stored === "dark" : prefersDark;
       document.documentElement.classList.toggle("dark", shouldDark);
     } catch {}
   }, []);
   return null;
 }
