"use client";

import React, { useState, useRef, useEffect } from "react";
import Waybar from "@/components/Waybar/Waybar";
import Terminal from "@/components/Terminal/Terminal";

export default function Home() {
  const [splitRatio, setSplitRatio] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Handle Ctrl key press for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Also clear ctrl state if window loses focus
    const handleBlur = () => setIsCtrlPressed(false);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Handle resize dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      let newRatio = (x / rect.width) * 100;
      
      // Clamp between 15% and 85% to maintain usable window sizes
      if (newRatio < 15) newRatio = 15;
      if (newRatio > 85) newRatio = 85;
      
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setIsResizing(true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#1e1e2e] overflow-hidden font-sans">
      {/* Background Wallpaper Mockup - typical Arch linux stylish wallpaper */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
      />
      
      {/* Waybar */}
      <Waybar />

      {/* Desktop Space — Hyprland tiling layout with gaps */}
      <main 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={`relative z-10 w-full h-[calc(100vh-60px)] mt-[52px] p-[8px] flex gap-[8px] ${(isResizing || isCtrlPressed) ? 'cursor-col-resize select-none' : ''}`}
      >
        {/* First window tile */}
        <div 
          className="min-w-0 transition-all duration-75 ease-out"
          style={{ flex: `${splitRatio} 1 0%` }}
        >
          <Terminal />
        </div>
        {/* Second window tile for 50-50 proportion */}
        <div 
          className="min-w-0 transition-all duration-75 ease-out"
          style={{ flex: `${100 - splitRatio} 1 0%` }}
        >
          <Terminal />
        </div>
      </main>
    </div>
  );
}
