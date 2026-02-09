 "use client";
 import { useEffect } from "react";
 
 export default function ThemeInit() {
   useEffect(() => {
     try {
       const stored = localStorage.getItem("theme");
      const shouldDark = stored ? stored === "dark" : false;
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(shouldDark ? "dark" : "light");
     } catch {}
   }, []);
   return null;
 }
