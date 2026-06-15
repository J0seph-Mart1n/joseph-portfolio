"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Terminal.module.css";

// Terminal icon for the title bar
const TermIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

// Arch Linux ASCII art for neofetch
const ARCH_ASCII = `                  -\`
                 .o+\`
                \`ooo/
               \`+oooo:
              \`+oooooo:
              -+oooooo+:
            \`/:-:++oooo+:
           \`/++++/+++++++:
          \`/++++++++++++++:
         \`/+++ooooooooooooo/\`
        ./ooosssso++osssssso+\`
       .oossssso-\`\`\`\`/ossssss+\`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  \`/ossssso+/:-        -:/+osssso+-
 \`+sso+:-\`                 \`.-/+oso:
\`++:.                           \`-/+/
.\`                                 \`/`;

interface TerminalLine {
  type: "prompt" | "output" | "neofetch" | "blank";
  user?: string;
  host?: string;
  path?: string;
  command?: string;
  content?: React.ReactNode;
  delay?: number;
}

export default function Terminal() {
  const [isActive, setIsActive] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const terminalLines: TerminalLine[] = [
    {
      type: "prompt",
      user: "joseph",
      host: "arch",
      path: "~",
      command: "neofetch",
      delay: 0,
    },
    {
      type: "neofetch",
      delay: 200,
    },
    {
      type: "prompt",
      user: "joseph",
      host: "arch",
      path: "~",
      command: "cat about.txt",
      delay: 400,
    },
    {
      type: "output",
      content: (
        <>
          <span className={styles.outputHighlight}>
            Hey! I&apos;m Joseph 👋
          </span>
          <br />
          <span className={styles.output}>
            A passionate developer who loves building
          </span>
          <br />
          <span className={styles.output}>
            beautiful, performant software. I run Arch btw.
          </span>
        </>
      ),
      delay: 600,
    },
    {
      type: "blank",
      delay: 700,
    },
    {
      type: "prompt",
      user: "joseph",
      host: "arch",
      path: "~",
      command: "ls ./skills/",
      delay: 800,
    },
    {
      type: "output",
      content: (
        <>
          <span className={styles.outputAccent}>TypeScript </span>
          <span className={styles.outputGreen}>React </span>
          <span className={styles.outputMauve}>Next.js </span>
          <span className={styles.outputHighlight}>Node.js </span>
          <span className={styles.outputRed}>Rust </span>
          <span className={styles.outputAccent}>Python</span>
          <br />
          <span className={styles.outputGreen}>Linux </span>
          <span className={styles.outputMauve}>Docker </span>
          <span className={styles.outputHighlight}>Git </span>
          <span className={styles.outputRed}>PostgreSQL </span>
          <span className={styles.outputAccent}>Firebase</span>
        </>
      ),
      delay: 1000,
    },
    {
      type: "blank",
      delay: 1100,
    },
    {
      type: "prompt",
      user: "joseph",
      host: "arch",
      path: "~",
      command: "cat contact.json",
      delay: 1200,
    },
    {
      type: "output",
      content: (
        <>
          <span className={styles.outputDim}>{"{"}</span>
          <br />
          <span className={styles.outputDim}> &quot;</span>
          <span className={styles.outputAccent}>github</span>
          <span className={styles.outputDim}>&quot;: &quot;</span>
          <span className={styles.link}>github.com/joseph</span>
          <span className={styles.outputDim}>&quot;,</span>
          <br />
          <span className={styles.outputDim}> &quot;</span>
          <span className={styles.outputAccent}>email</span>
          <span className={styles.outputDim}>&quot;: &quot;</span>
          <span className={styles.link}>hello@joseph.dev</span>
          <span className={styles.outputDim}>&quot;,</span>
          <br />
          <span className={styles.outputDim}> &quot;</span>
          <span className={styles.outputAccent}>linkedin</span>
          <span className={styles.outputDim}>&quot;: &quot;</span>
          <span className={styles.link}>linkedin.com/in/joseph</span>
          <span className={styles.outputDim}>&quot;</span>
          <br />
          <span className={styles.outputDim}>{"}"}</span>
        </>
      ),
      delay: 1400,
    },
    {
      type: "blank",
      delay: 1500,
    },
    {
      type: "prompt",
      user: "joseph",
      host: "arch",
      path: "~",
      command: "",
      delay: 1600,
    },
  ];

  // Animate lines appearing one by one
  useEffect(() => {
    if (visibleLines >= terminalLines.length) return;

    const nextLine = terminalLines[visibleLines];
    const delay = nextLine?.delay ?? visibleLines * 150;
    const prevDelay =
      visibleLines > 0 ? (terminalLines[visibleLines - 1]?.delay ?? 0) : 0;
    const relativeDelay = delay - prevDelay;

    const timer = setTimeout(() => {
      setVisibleLines((prev) => prev + 1);
    }, relativeDelay);

    return () => clearTimeout(timer);
  }, [visibleLines, terminalLines.length]);

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const renderNeofetch = () => {
    const infoLines = [
      {
        label: "",
        value: (
          <>
            <span className={styles.outputAccent}>joseph</span>
            <span className={styles.outputDim}>@</span>
            <span className={styles.outputMauve}>arch</span>
          </>
        ),
      },
      { label: "", value: <span className={styles.separator}>──────────────</span> },
      { label: "OS", value: "Arch Linux x86_64" },
      { label: "Host", value: "Portfolio v2.0" },
      { label: "Kernel", value: "6.14.5-arch1-1" },
      { label: "Shell", value: "zsh 5.9" },
      { label: "WM", value: "Hyprland" },
      { label: "Terminal", value: "kitty" },
      { label: "Theme", value: "Catppuccin Mocha" },
      { label: "Editor", value: "Neovim" },
      { label: "Role", value: "Full-Stack Developer" },
      { label: "Location", value: "India 🇮🇳" },
    ];

    return (
      <div className={styles.neofetchContainer}>
        <span className={styles.ascii}>{ARCH_ASCII}</span>
        <div className={styles.neofetchInfo}>
          {infoLines.map((line, i) => (
            <div key={i}>
              {line.label ? (
                <>
                  <span className={styles.infoLabel}>{line.label}</span>
                  <span className={styles.outputDim}>: </span>
                  <span className={styles.infoValue}>{line.value}</span>
                </>
              ) : (
                line.value
              )}
            </div>
          ))}
          {/* Color blocks like real neofetch */}
          <div className={styles.colorBlocks}>
            {[
              "#45475a",
              "#f38ba8",
              "#a6e3a1",
              "#f9e2af",
              "#89b4fa",
              "#cba6f7",
              "#89dceb",
              "#bac2de",
            ].map((color, i) => (
              <div
                key={i}
                className={styles.colorBlock}
                style={{ background: color }}
              />
            ))}
          </div>
          <div className={styles.colorBlocks}>
            {[
              "#585b70",
              "#f38ba8",
              "#a6e3a1",
              "#f9e2af",
              "#89b4fa",
              "#cba6f7",
              "#94e2d5",
              "#a6adc8",
            ].map((color, i) => (
              <div
                key={i}
                className={styles.colorBlock}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLine = (line: TerminalLine, index: number) => {
    const style = {
      animationDelay: `${(line.delay ?? index * 150) / 1000}s`,
    };

    switch (line.type) {
      case "prompt":
        return (
          <div key={index} className={styles.line} style={style}>
            <span className={styles.prompt}>
              <span className={styles.outputAccent}>{line.user}</span>
              <span className={styles.outputDim}>@</span>
              <span className={styles.outputMauve}>{line.host}</span>
              <span className={styles.outputDim}> </span>
              <span className={styles.outputAccent}>{line.path}</span>
            </span>
            <span className={styles.promptSymbol}> ❯ </span>
            <span className={styles.command}>{line.command}</span>
            {/* Show cursor on the last prompt if it has no command */}
            {index === terminalLines.length - 1 &&
              visibleLines >= terminalLines.length &&
              !line.command && <span className={styles.cursor} />}
          </div>
        );

      case "output":
        return (
          <div key={index} className={styles.line} style={style}>
            <div className={styles.output}>{line.content}</div>
          </div>
        );

      case "neofetch":
        return (
          <div key={index} className={styles.line} style={style}>
            {renderNeofetch()}
          </div>
        );

      case "blank":
        return <div key={index} className={styles.line} style={style}>&nbsp;</div>;

      default:
        return null;
    }
  };

  const tabs = ["terminal", "projects", "blog"];

  return (
    <div
      className={`${styles.windowTile} ${isActive ? styles.active : ""}`}
      onClick={() => setIsActive(true)}
      onMouseDown={() => setIsActive(true)}
    >
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarLeft}>
          <div className={styles.windowControls}>
            <div className={`${styles.windowDot} ${styles.dotClose}`} />
            <div className={`${styles.windowDot} ${styles.dotMinimize}`} />
            <div className={`${styles.windowDot} ${styles.dotMaximize}`} />
          </div>
          <div className={styles.titleText}>
            <span className={styles.titleIcon}>
              <TermIcon />
            </span>
            <span>joseph@arch: ~</span>
          </div>
        </div>
        <div className={styles.titleBarRight}>
          {tabs.map((tab, i) => (
            <div
              key={tab}
              className={`${styles.tabPill} ${i === activeTab ? styles.activeTab : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(i);
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Body */}
      <div className={styles.terminalBody} ref={bodyRef}>
        {terminalLines.slice(0, visibleLines).map((line, i) => renderLine(line, i))}
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} />
            <span>NORMAL</span>
          </div>
          <span>zsh</span>
        </div>
        <div className={styles.statusRight}>
          <span>utf-8</span>
          <span>ln {visibleLines}, col 1</span>
        </div>
      </div>
    </div>
  );
}
