"use client";

import React, { useState, useEffect } from 'react';
import styles from './Waybar.module.css';

// SVG Icons
const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const WifiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const VolumeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);

const BatteryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
    <line x1="22" y1="11" x2="22" y2="13"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default function Waybar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dateNum = now.getDate();

      setTime(`${hours}:${minutes}`);
      setDate(`${dayName}, ${monthName} ${dateNum}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.waybarContainer}>
      {/* Left: Workspaces */}
      <div className={styles.moduleGroup}>
        <div className={`${styles.module} ${styles.workspaces}`}>
          {[1, 2, 3, 4, 5].map((ws) => (
            <div 
              key={ws} 
              className={`${styles.workspace} ${ws === 1 ? styles.active : ''}`}
            >
              {ws}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Window Title */}
      <div className={styles.moduleGroup}>
        <div className={`${styles.module} ${styles.window}`}>
          <TerminalIcon />
          <span>~ / portfolio</span>
        </div>
      </div>

      {/* Right: Tray & Stats */}
      <div className={styles.moduleGroup}>
        <div className={`${styles.module} ${styles.network}`}>
          <WifiIcon />
          <span>Wired</span>
        </div>
        <div className={`${styles.module} ${styles.pulseaudio}`}>
          <VolumeIcon />
          <span>65%</span>
        </div>
        <div className={`${styles.module} ${styles.battery}`}>
          <BatteryIcon />
          <span>100%</span>
        </div>
        <div className={`${styles.module} ${styles.clock}`}>
          <ClockIcon />
          <span>{date} {time}</span>
        </div>
      </div>
    </div>
  );
}
