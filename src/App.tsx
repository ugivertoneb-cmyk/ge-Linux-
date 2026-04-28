/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube from 'react-youtube';
import { 
  Terminal as TerminalIcon, Cpu, HardDrive, Network, Shield, Package, 
  Info, HelpCircle, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Monitor, Activity, Folder, 
  Settings, User, Calendar, Clock, Search, Layout, Maximize2, 
  Minimize2, Power, Play, FileText, Gamepad2, Save, Edit3, 
  Volume2, SkipBack, SkipForward, Pause, Globe, ArrowLeft, ArrowRight, RotateCw, Home,
  Video, File, Heart, Plus, History, AlertTriangle, ExternalLink, ShieldAlert,
  Code, Briefcase, Gamepad, Wrench, LogOut, Terminal, Layers, AppWindow, Palette, Cloud,
  Download, Camera, Pencil, Eraser, Square, Circle, Type, Trash2
} from 'lucide-react';

type CommandResponse = {
  type: 'text' | 'neofetch' | 'error' | 'success' | 'warning';
  content: string | React.ReactNode;
};

type WindowState = {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

const INITIAL_BOOT_LOGS = [
  "[    0.000000] Linux version 6.8.0-ge-linux (gcc version 13.2.0)",
  "[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-ge-linux root=UUID=ge-linux-root ro quiet splash",
  "[    0.000000] KERNEL supported cpus: Intel GenuineIntel, AMD AuthenticAMD",
  "[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'",
  "[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'",
  "[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'",
  "[    0.000000] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256",
  "[    0.000000] x86/fpu: Enabled xstate features 0x7, context size is 832 bytes, using 'compacted' format.",
  "[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
  "[    0.000000] BIOS-e820: [mem 0x000000000009fc00-0x000000000009ffff] reserved",
  "[    0.000000] BIOS-e820: [mem 0x00000000000f0000-0x00000000000fffff] reserved",
  "[    0.000000] BIOS-e820: [mem 0x0000000000100000-0x00000000bfffffff] usable",
  "[    0.124512] smpboot: Allowing 16 CPUs, 0 hotplug CPUs",
  "[    0.256781] ACPI: Core revision 20230628",
  "[    0.512344] pci 0000:00:00.0: [8086:191f] type 00 class 0x060000",
  "[    0.891231] scsi host0: virtio-scsi",
  "[    1.102345] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)",
  "[    1.456789] systemd[1]: Inserted module 'autofs4'",
  "[    1.890123] systemd[1]: Set hostname to <ge-linux-host>",
  "[    2.123456] systemd[1]: Reached target Local File Systems.",
  "[    2.567890] systemd[1]: Reached target Network.",
  "[    3.102345] systemd[1]: Started Ge-Linux Desktop Manager.",
  " ",
  "****************************************************",
  "*  GE-LINUX BETA RELEASE - BUILD 26.4.28          *",
  "*  OFFICIAL DISTRIBUTION - PUBLIC BETA v2.0.0     *",
  "****************************************************",
  " ",
  "Welcome to Ge-Linux v2.0.0 Beta (Kernel 7.2.0-ge-linux)",
  "Type 'help' for a list of available commands.",
  "Type 'startx' to launch the Ge-Desktop environment."
];

const INITIAL_FILE_SYSTEM: Record<string, string> = {
  'README.md': '# Ge-Linux\n\nThe ultimate minimalist distribution for the modern web.',
  'about.txt': 'Ge-Linux is a community-driven distribution focused on performance and simplicity.',
  'version.info': 'Ge-Linux 2.0.0-beta\nBuild: 20260428\nCodename: "Quantum-Next"',
  'secret.key': 'GE-LINUX-PRO-2026-X99-ALPHA',
  'intro.mp4': 'https://vjs.zencdn.net/v/oceans.mp4',
  'demo.mp4': 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
};

interface Theme {
  id: string;
  name: string;
  accent: string;
  bg: string;
  bgGradientStart: string;
  fg: string;
  windowBg: string;
  fontSans: string;
  fontMono: string;
  pattern: 'dots' | 'grid' | 'none';
}

const THEMES: Theme[] = [
  {
    id: 'base',
    name: 'Ge-Linux (Default)',
    accent: '#3fb950',
    bg: '#0c0c0c',
    bgGradientStart: '#1a1a1a',
    fg: '#d4d4d4',
    windowBg: 'rgba(20, 20, 20, 0.85)',
    fontSans: 'Inter',
    fontMono: 'JetBrains Mono',
    pattern: 'dots'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    accent: '#ff007f',
    bg: '#050505',
    bgGradientStart: '#1a0033',
    fg: '#00d2ff',
    windowBg: 'rgba(10, 0, 20, 0.9)',
    fontSans: 'Space Grotesk',
    fontMono: 'JetBrains Mono',
    pattern: 'grid'
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    accent: '#88c0d0',
    bg: '#2e3440',
    bgGradientStart: '#3b4252',
    fg: '#eceff4',
    windowBg: 'rgba(59, 66, 82, 0.9)',
    fontSans: 'Inter',
    fontMono: 'JetBrains Mono',
    pattern: 'dots'
  },
  {
    id: 'retro',
    name: 'Retro Amber',
    accent: '#ffbf00',
    bg: '#1a1a1a',
    bgGradientStart: '#2d2d2d',
    fg: '#ffffff',
    windowBg: 'rgba(40, 40, 40, 0.95)',
    fontSans: 'Outfit',
    fontMono: 'JetBrains Mono',
    pattern: 'none'
  },
  {
    id: 'matrix',
    name: 'Matrix',
    accent: '#00ff41',
    bg: '#000000',
    bgGradientStart: '#001a00',
    fg: '#00ff41',
    windowBg: 'rgba(0, 10, 0, 0.9)',
    fontSans: 'JetBrains Mono',
    fontMono: 'JetBrains Mono',
    pattern: 'grid'
  }
];

const PATTERNS: Record<string, (color: string) => string> = {
  dots: (color: string) => `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${encodeURIComponent(color)}' fill-opacity='0.1'/%3E%3C/svg%3E")`,
  grid: (color: string) => `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h40' stroke='${encodeURIComponent(color)}' stroke-opacity='0.05' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
  none: () => 'none'
};

const SETTINGS_KEY = 'ge-linux-system-settings';

export default function App() {
  const [mode, setMode] = useState<'boot' | 'installer' | 'terminal' | 'desktop' | 'lock' | 'shutdown'>('boot');
  const [isInstalled, setIsInstalled] = useState(() => localStorage.getItem('ge-linux-installed') === 'true');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<CommandResponse[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [isKernelPanic, setIsKernelPanic] = useState(false);
  const [panicDetails, setPanicDetails] = useState('');
  const [panicData, setPanicData] = useState({ code: 'CRITICAL_PROCESS_DIED', hex: '0x000000EF' });
  const [input, setInput] = useState('');
  const [fileSystem, setFileSystem] = useState(INITIAL_FILE_SYSTEM);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [videoSource, setVideoSource] = useState('https://vjs.zencdn.net/v/oceans.mp4');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState('default');
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  
  // Load settings from localStorage
  const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');

  // Settings State
  const [crtEnabled, setCrtEnabled] = useState(savedSettings.crtEnabled ?? true);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(savedSettings.scanlinesEnabled ?? true);
  const [brightness, setBrightness] = useState(savedSettings.brightness ?? 100);
  const [accentColor, setAccentColor] = useState(savedSettings.accentColor ?? '#3fb950');
  const [systemVolume, setSystemVolume] = useState(savedSettings.systemVolume ?? 80);
  const [bootSoundEnabled, setBootSoundEnabled] = useState(savedSettings.bootSoundEnabled ?? true);
  const [currentThemeId, setCurrentThemeId] = useState(savedSettings.currentThemeId ?? 'base');

  // Persist settings to localStorage
  useEffect(() => {
    const settings = {
      crtEnabled,
      scanlinesEnabled,
      brightness,
      accentColor,
      systemVolume,
      bootSoundEnabled,
      currentThemeId
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [crtEnabled, scanlinesEnabled, brightness, accentColor, systemVolume, bootSoundEnabled, currentThemeId]);

  useEffect(() => {
    const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
    
    document.documentElement.style.setProperty('--crt-opacity', crtEnabled ? '1' : '0');
    document.documentElement.style.setProperty('--scanline-opacity', scanlinesEnabled ? '0.1' : '0');
    document.documentElement.style.setProperty('--brightness', (brightness / 100).toString());
    
    // Apply Theme Variables
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--window-border', `${accentColor}4D`); // 30% opacity
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--bg-gradient-start', theme.bgGradientStart);
    document.documentElement.style.setProperty('--fg', theme.fg);
    document.documentElement.style.setProperty('--window-bg', theme.windowBg);
    document.documentElement.style.setProperty('--font-sans-override', theme.fontSans);
    document.documentElement.style.setProperty('--font-mono-override', theme.fontMono);
    document.documentElement.style.setProperty('--bg-pattern', PATTERNS[theme.pattern](accentColor));
  }, [crtEnabled, scanlinesEnabled, brightness, accentColor, currentThemeId]);
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'terminal', title: 'Terminal', icon: <TerminalIcon size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 600, height: 400, x: 50, y: 50 },
    { id: 'files', title: 'File Explorer', icon: <Folder size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 500, height: 350, x: 100, y: 100 },
    { id: 'system', title: 'System Monitor', icon: <Activity size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 400, height: 450, x: 150, y: 150 },
    { id: 'settings', title: 'Settings', icon: <Settings size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 450, height: 400, x: 200, y: 200 },
    { id: 'video', title: 'Video Player', icon: <Play size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 640, height: 480, x: 250, y: 100 },
    { id: 'editor', title: 'Text Editor', icon: <Edit3 size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 700, height: 500, x: 300, y: 50 },
    { id: 'doom', title: 'DOOM', icon: <Gamepad2 size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 800, height: 600, x: 100, y: 20 },
    { id: 'browser', title: 'GE-Lunweb', icon: <Globe size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 900, height: 600, x: 50, y: 50 },
    { id: 'youtube', title: 'YouTube', icon: <Video size={16} className="text-red-500" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 800, height: 500, x: 150, y: 100 },
    { id: 'clock', title: 'Clock', icon: <Clock size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 350, height: 400, x: 400, y: 150 },
    { id: 'welcome', title: 'Welcome', icon: <Info size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 11, width: 550, height: 450, x: 100, y: 50 },
    { id: 'about', title: 'About Ge-Linux', icon: <Info size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 450, height: 500, x: 250, y: 100 },
    { id: 'taskmanager', title: 'Task Manager', icon: <Activity size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 550, height: 450, x: 220, y: 120 },
    { id: 'calculator', title: 'Calculator', icon: <Layout size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 300, height: 450, x: 400, y: 100 },
    { id: 'camera', title: 'Camera', icon: <Video size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 640, height: 520, x: 150, y: 80 },
    { id: 'paint', title: 'Ge-Paint', icon: <Palette size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 800, height: 600, x: 100, y: 50 },
    { id: 'messenger', title: 'Messenger', icon: <Globe size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 350, height: 550, x: 800, y: 50 },
    { id: 'stress', title: 'System Stress', icon: <Layers size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 800, height: 600, x: 100, y: 50 },
    { id: 'snake', title: 'Snake', icon: <Gamepad2 size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 400, height: 450, x: 150, y: 50 },
    { id: 'mines', title: 'Minesweeper', icon: <Gamepad2 size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 350, height: 450, x: 200, y: 100 },
    { id: 'invaders', title: 'Kernel Invaders', icon: <Shield size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, width: 600, height: 500, x: 250, y: 150 },
  ]);
  
  const [maxZIndex, setMaxZIndex] = useState(11);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [time, setTime] = useState(new Date());
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        setCursorType('pointer');
      } else if (target.closest('input') || target.closest('textarea')) {
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    if (mode === 'boot') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < INITIAL_BOOT_LOGS.length) {
          setBootLogs(prev => [...prev, INITIAL_BOOT_LOGS[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (!isInstalled) setMode('installer');
            else setMode('terminal');
          }, 1000);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode === 'desktop' && !hasShownWelcome) {
      toggleWindow('welcome');
      setHasShownWelcome(true);
    }
  }, [mode, hasShownWelcome]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, bootLogs]);

  const triggerPanic = (details: string) => {
    const STOP_CODES = [
      { name: 'SYSTEM_SERVICE_EXCEPTION', hex: '0x0000003B' },
      { name: 'IRQL_NOT_LESS_OR_EQUAL', hex: '0x0000000A' },
      { name: 'PAGE_FAULT_IN_NONPAGED_AREA', hex: '0x00000050' },
      { name: 'CRITICAL_PROCESS_DIED', hex: '0x000000EF' },
      { name: 'KMODE_EXCEPTION_NOT_HANDLED', hex: '0x1000001E' },
      { name: 'KERNEL_SECURITY_CHECK_FAILURE', hex: '0x00000139' },
      { name: 'MEMORY_MANAGEMENT', hex: '0x0000001A' }
    ];
    const randomStop = STOP_CODES[Math.floor(Math.random() * STOP_CODES.length)];
    setPanicData(randomStop);
    setPanicDetails(details);
    setIsKernelPanic(true);
  };
  const toggleWindow = (id: string) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (!win) return prev;

      if (win.isOpen && focusedWindowId === id && !win.isMinimized) {
        // Already focused and open, so close it
        return prev.map(w => w.id === id ? { ...w, isOpen: false } : w);
      } else if (win.isOpen) {
        // Open but not focused or minimized, bring to front
        const newZ = maxZIndex + 1;
        setMaxZIndex(newZ);
        setFocusedWindowId(id);
        return prev.map(w => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w);
      } else {
        // Closed, so open and bring to front
        const newZ = maxZIndex + 1;
        setMaxZIndex(newZ);
        setFocusedWindowId(id);
        return prev.map(w => w.id === id ? { ...w, isOpen: true, zIndex: newZ, isMinimized: false } : w);
      }
    });
  };

  const focusWindow = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w));
    setFocusedWindowId(id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const openFileInEditor = (fileName: string) => {
    if (fileName.endsWith('.mp4') || fileName.endsWith('.mpeg')) {
      setVideoSource(fileSystem[fileName]);
      toggleWindow('video');
      focusWindow('video');
      return;
    }
    setEditingFile(fileName);
    setEditorContent(fileSystem[fileName] || '');
    toggleWindow('editor');
    focusWindow('editor');
  };

  const saveFile = () => {
    if (editingFile) {
      setFileSystem(prev => ({ ...prev, [editingFile]: editorContent }));
      // Show a small notification or just log to terminal
      handleCommand(`echo "Saved ${editingFile}"`);
    }
  };

  const deleteFile = (fileName: string) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      setFileSystem(prev => {
        const newFs = { ...prev };
        delete newFs[fileName];
        return newFs;
      });
      if (selectedFile === fileName) setSelectedFile(null);
      handleCommand(`echo "Deleted ${fileName}"`);
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    if (trimmedCmd !== commandHistory[commandHistory.length - 1]) {
      setCommandHistory(prev => [...prev, trimmedCmd]);
    }
    setHistoryIndex(-1);

    // Handle redirection
    let actualCmd = trimmedCmd;
    let outputFile: string | null = null;
    if (trimmedCmd.includes('>')) {
      const parts = trimmedCmd.split('>');
      actualCmd = parts[0].trim();
      outputFile = parts[1].trim();
    }

    const args = actualCmd.split(' ');
    const baseCmd = args[0].toLowerCase();

    let response: CommandResponse;
    let textOutput: string | null = null;

    switch (baseCmd) {
      case 'startx':
        setMode('desktop');
        return;
      case 'help':
        textOutput = "Available commands: startx, welcome, sudo, ping, traceroute, netstat, doom, edit, play, browser, clock, ls, cat, neofetch, clear, reboot, shutdown, lock, exit, echo, install, whoami, uptime, date, uname, top, mkdir, touch, rm, history, man, who, pwd, df, free, ps, kill, ping6, dig, curl, wget";
        response = {
          type: 'text',
          content: (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 font-mono text-[10px] text-accent/80">
              <div className="text-accent font-bold">startx</div><div>Launch GUI</div>
              <div className="text-accent font-bold">welcome</div><div>Show welcome screen</div>
              <div className="text-accent font-bold">sudo [cmd]</div><div>Run as superuser</div>
              <div className="text-accent font-bold">ping [host]</div><div>Network diagnostic</div>
              <div className="text-accent font-bold">traceroute</div><div>Trace network hops</div>
              <div className="text-accent font-bold">netstat</div><div>Network statistics</div>
              <div className="text-accent font-bold">doom</div><div>Rip and Tear</div>
              <div className="text-accent font-bold">edit [file]</div><div>Open text editor</div>
              <div className="text-accent font-bold">play</div><div>Open video player</div>
              <div className="text-accent font-bold">browser</div><div>Open GE-Lunweb</div>
              <div className="text-accent font-bold">clock</div><div>Open Clock app</div>
              <div className="text-accent font-bold">ls</div><div>List files</div>
              <div className="text-accent font-bold">cat [file]</div><div>Read file</div>
              <div className="text-accent font-bold">neofetch</div><div>System info</div>
              <div className="text-accent font-bold">clear</div><div>Clear history</div>
              <div className="text-accent font-bold">reboot</div><div>Restart system</div>
              <div className="text-accent font-bold">shutdown</div><div>Power off</div>
              <div className="text-accent font-bold">lock</div><div>Lock screen</div>
              <div className="text-accent font-bold">exit</div><div>Logout to TTY</div>
              <div className="text-accent font-bold">whoami</div><div>Current user</div>
              <div className="text-accent font-bold">uptime</div><div>System uptime</div>
              <div className="text-accent font-bold">date</div><div>Current date/time</div>
              <div className="text-accent font-bold">uname</div><div>Kernel info</div>
              <div className="text-accent font-bold">top</div><div>Open Task Manager</div>
              <div className="text-accent font-bold">taskmanager</div><div>Open Task Manager</div>
              <div className="text-accent font-bold">mkdir [dir]</div><div>Create directory</div>
              <div className="text-accent font-bold">touch [file]</div><div>Create empty file</div>
              <div className="text-accent font-bold">rm [file]</div><div>Remove file</div>
              <div className="text-accent font-bold">history</div><div>Command history</div>
              <div className="text-accent font-bold">man [cmd]</div><div>Manual pages</div>
              <div className="text-accent font-bold">who</div><div>List users</div>
              <div className="text-accent font-bold">pwd</div><div>Print working directory</div>
              <div className="text-accent font-bold">df</div><div>Disk space usage</div>
              <div className="text-accent font-bold">free</div><div>Memory usage</div>
              <div className="text-accent font-bold">ps</div><div>Process status</div>
              <div className="text-accent font-bold">kill [pid]</div><div>Terminate process</div>
              <div className="text-accent font-bold">ping6 [host]</div><div>IPv6 diagnostic</div>
              <div className="text-accent font-bold">dig [host]</div><div>DNS lookup</div>
              <div className="text-accent font-bold">curl [url]</div><div>Fetch URL</div>
              <div className="text-accent font-bold">wget [url]</div><div>Download file</div>
            </div>
          )
        };
        break;
      case 'doom':
        toggleWindow('doom');
        return;
      case 'welcome':
        toggleWindow('welcome');
        return;
      case 'sudo':
        if (!args[1]) {
          response = { type: 'error', content: 'usage: sudo <command>' };
        } else {
          const subCmd = args.slice(1).join(' ');
          setHistory(prev => [...prev, 
            { type: 'text', content: <div className="flex items-center gap-2 text-accent/70 font-mono text-xs"><ChevronRight size={12} /> {cmd}</div> },
            { type: 'text', content: <div className="text-white/50 font-mono text-[10px] mt-1">[sudo] password for user: **********</div> }
          ]);
          setTimeout(() => handleCommand(subCmd), 100);
          return;
        }
        break;
      case 'ping':
        const target = args[1] || 'google.com';
        textOutput = `PING ${target} (142.250.190.46) 56(84) bytes of data.\n64 bytes from 142.250.190.46: icmp_seq=1 ttl=117 time=12.4 ms\n64 bytes from 142.250.190.46: icmp_seq=2 ttl=117 time=13.1 ms\n64 bytes from 142.250.190.46: icmp_seq=3 ttl=117 time=11.9 ms\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 11.921/12.482/13.104/0.482 ms`;
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] text-accent/80 mt-2 leading-relaxed">
              <div>PING {target} (142.250.190.46) 56(84) bytes of data.</div>
              <div>64 bytes from 142.250.190.46: icmp_seq=1 ttl=117 time=12.4 ms</div>
              <div>64 bytes from 142.250.190.46: icmp_seq=2 ttl=117 time=13.1 ms</div>
              <div>64 bytes from 142.250.190.46: icmp_seq=3 ttl=117 time=11.9 ms</div>
              <div className="mt-1">--- {target} ping statistics ---</div>
              <div>3 packets transmitted, 3 received, 0% packet loss, time 2003ms</div>
              <div>rtt min/avg/max/mdev = 11.921/12.482/13.104/0.482 ms</div>
            </div>
          )
        };
        break;
      case 'traceroute':
        const trTarget = args[1] || 'google.com';
        textOutput = `traceroute to ${trTarget} (142.250.190.46), 30 hops max, 60 byte packets\n 1  gateway (192.168.1.1)  0.421 ms  0.389 ms  0.352 ms\n 2  10.0.0.1 (10.0.0.1)  1.124 ms  1.098 ms  1.052 ms\n 3  * * *\n 4  72.14.232.121 (72.14.232.121)  5.421 ms  5.389 ms  5.352 ms\n 5  142.250.190.46 (142.250.190.46)  12.421 ms  12.389 ms  12.352 ms`;
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] text-accent/80 mt-2 leading-relaxed">
              <div>traceroute to {trTarget} (142.250.190.46), 30 hops max, 60 byte packets</div>
              <div> 1  gateway (192.168.1.1)  0.421 ms  0.389 ms  0.352 ms</div>
              <div> 2  10.0.0.1 (10.0.0.1)  1.124 ms  1.098 ms  1.052 ms</div>
              <div> 3  * * *</div>
              <div> 4  72.14.232.121 (72.14.232.121)  5.421 ms  5.389 ms  5.352 ms</div>
              <div> 5  142.250.190.46 (142.250.190.46)  12.421 ms  12.389 ms  12.352 ms</div>
            </div>
          )
        };
        break;
      case 'netstat':
        textOutput = "Active Internet connections (w/o servers)\nProto Local Address Foreign Address State\ntcp 192.168.1.15:44321 142.250.190.46:443 ESTABLISHED\ntcp 192.168.1.15:55212 34.120.121.45:80 TIME_WAIT\nudp 0.0.0.0:123 *:*";
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] text-accent/80 mt-2">
              <div className="font-bold border-b border-accent/20 mb-1 pb-1 uppercase tracking-tighter">Active Internet connections (w/o servers)</div>
              <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
                <div className="font-bold text-accent">Proto</div><div className="font-bold text-accent">Local Address</div><div className="font-bold text-accent">Foreign Address</div><div className="font-bold text-accent">State</div>
                <div>tcp</div><div>192.168.1.15:44321</div><div>142.250.190.46:443</div><div>ESTABLISHED</div>
                <div>tcp</div><div>192.168.1.15:55212</div><div>34.120.121.45:80</div><div>TIME_WAIT</div>
                <div>udp</div><div>0.0.0.0:123</div><div>*:*</div><div></div>
              </div>
            </div>
          )
        };
        break;
      case 'edit':
        if (args[1]) {
          openFileInEditor(args[1]);
        } else {
          toggleWindow('editor');
        }
        return;
      case 'play':
        toggleWindow('video');
        return;
      case 'browser':
        toggleWindow('browser');
        return;
      case 'clock':
        toggleWindow('clock');
        return;
      case 'ls':
        textOutput = Object.keys(fileSystem).join('\n');
        response = {
          type: 'text',
          content: (
            <div className="flex flex-wrap gap-4 mt-2 font-mono text-xs">
              {Object.keys(fileSystem).map(f => (
                <span key={f} className="text-accent flex items-center gap-1">
                  <HardDrive size={12} /> {f}
                </span>
              ))}
            </div>
          )
        };
        break;
      case 'cat':
        const fileName = args[1];
        if (fileName && fileSystem[fileName]) {
          textOutput = fileSystem[fileName];
          response = { type: 'text', content: <pre className="mt-2 whitespace-pre-wrap font-mono text-xs opacity-80">{fileSystem[fileName]}</pre> };
        } else {
          response = { type: 'error', content: `cat: ${fileName || 'missing operand'}: No such file or directory` };
        }
        break;
      case 'neofetch':
        textOutput = "OS: Ge-Linux v2.0.0 Beta\nKernel: 7.2.0-ge-linux-beta\nShell: ge-sh 2.0";
        response = {
          type: 'neofetch',
          content: (
            <div className="flex gap-4 mt-4 p-3 border border-accent/20 bg-accent/5 rounded font-mono text-[10px]">
              <div className="text-accent text-2xl font-bold flex flex-col items-center justify-center">
                <Monitor size={48} />
                <span className="mt-1">GE</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-accent font-bold">user@ge-linux</div>
                <div className="h-px bg-accent/30 my-1" />
                <div><span className="text-accent font-bold">OS:</span> Ge-Linux v2.0.0 Beta</div>
                <div><span className="text-accent font-bold">Kernel:</span> 7.2.0-ge-linux-beta</div>
                <div><span className="text-accent font-bold">Uptime:</span> {Math.floor(performance.now() / 1000)}s</div>
                <div><span className="text-accent font-bold">Shell:</span> ge-sh 2.0</div>
                <div className="flex gap-1 mt-1">
                  {[...Array(8)].map((_, i) => <div key={i} className="w-3 h-3" style={{ backgroundColor: ['#000', '#f00', '#0f0', '#ff0', '#00f', '#f0f', '#0ff', '#fff'][i] }} />)}
                </div>
              </div>
            </div>
          )
        };
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'exit':
        setMode('terminal');
        return;
      case 'reboot':
        setMode('boot');
        setBootLogs([]);
        setHistory([]);
        return;
      case 'shutdown':
        setMode('shutdown');
        setBootLogs([]);
        return;
      case 'lock':
        setMode('lock');
        return;
      case 'install':
        setMode('installer');
        return;
      case 'echo':
        textOutput = args.slice(1).join(' ');
        response = { type: 'text', content: textOutput };
        break;
      case 'whoami':
        textOutput = "user";
        response = { type: 'text', content: "user" };
        break;
      case 'uptime':
        const upS = Math.floor(performance.now() / 1000);
        const upM = Math.floor(upS / 60);
        const upH = Math.floor(upM / 60);
        textOutput = `up ${upH} hours, ${upM % 60} minutes, ${upS % 60} seconds`;
        response = { type: 'text', content: textOutput };
        break;
      case 'date':
        textOutput = new Date().toString();
        response = { type: 'text', content: textOutput };
        break;
      case 'uname':
        textOutput = "Linux ge-linux 7.2.0-ge-linux-beta #1 SMP PREEMPT_DYNAMIC Tue Apr 28 2026 x86_64 GNU/Linux";
        response = { type: 'text', content: textOutput };
        break;
      case 'sys-info':
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] text-accent/80 mt-2 grid grid-cols-2 gap-2">
              <div className="font-bold border-b border-accent/20 col-span-2 pb-1 mb-1">SYSTEM ARCHITECTURE FORENSICS</div>
              <div>Processor:</div><div className="text-white">Ge-Quantum G3 @ 5.4 GHz</div>
              <div>Memory:</div><div className="text-white">16GB ECC DDR6 (Virtual Swapped)</div>
              <div>Graphics:</div><div className="text-white">Virtual-Geo V2 (Accelerated)</div>
              <div>Storage:</div><div className="text-white">256GB NVMe-G (Thin Provisioned)</div>
              <div>Network:</div><div className="text-white">10GbE Virtual Fiber</div>
              <div>Kernel:</div><div className="text-white">LST 7.2.0-BETA_REL</div>
            </div>
          )
        };
        break;
      case 'matrix':
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] text-emerald-500 mt-2 animate-pulse">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden whitespace-nowrap">
                  {Array.from({ length: 40 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')}
                </div>
              ))}
              <div className="mt-2 text-white font-bold">[ SYSTEM BYPASS IN PROGRESS... ]</div>
            </div>
          )
        };
        break;
      case 'top':
      case 'htop':
      case 'taskmanager':
        toggleWindow('taskmanager');
        return;
      case 'dmesg':
        const dmesgLogs = [
          '[    0.000000] initial-ramdisk: Ge-Linux Kernel 7.2.0-ge-linux-beta initializing',
          '[    0.000001] ACPI: Core revision 20260428',
          '[    0.124512] Command line: BOOT_IMAGE=/boot/vmlinuz-7.2.0-beta root=UUID=ge-linux-root ro quiet splash',
          '[    0.281241] Memory: 16384MB/16384MB available (24340K kernel code, 3314K rwdata, 5512K rodata, 3392K init, 2241K bss, 1024MB reserved)',
          '[    0.451241] CPU: Intel(R) Core(TM) i9-14900KS (Virtual-X86 Platform V2)',
          '[    0.681241] smp: Bringing up 16 secondary CPUs...',
          '[    0.890124] PCI: Probing PCI hardware (bus 00 [io 0x0000-0xffff])',
          '[    1.241251] NET: Registered protocol family 2 (IPv4) / Initializing TCP/IP stack v2',
          '[    1.567124] rtc_cmos 00:01: current system clock synchronized to Atomic Stratum-0',
          '[    2.124251] EXT4-fs (sda1): recovery complete, mount successful (Journaled)',
          '[    3.890124] systemd[1]: systemd 256.1-x-ge-linux running in system mode',
          '[    4.241124] Ge-Desktop Environment 2.0.0-beta-1 status: VERIFIED',
          '[    5.567124] hid-generic: Registered human interface device (001:002)',
          '[    6.124512] Audio/ALSA: Ge-Pulse sound architecture v2.4 initialized',
          '[    6.451241] Ge-Linux 2.0.0 Beta (Build 20260428-1711) is ready'
        ].join('\n');
        response = { type: 'text', content: <pre className="font-mono text-[10px] text-white/50 leading-relaxed">{dmesgLogs}</pre> };
        break;
      case 'ps':
        const psOutput = [
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:01 systemd',
          '  567 ?        00:02:15 Xorg',
          '  890 ?        00:01:42 ge-desktop',
          ...windows.filter(w => w.isOpen).map((w, i) => ` ${2000 + i} tty7     00:00:00 ${w.id === 'terminal' ? 'ge-sh' : w.id}`)
        ].join('\n');
        response = { type: 'text', content: <pre className="font-mono text-xs">{psOutput}</pre> };
        break;
      case 'kill':
        const pidToKill = parseInt(args[1]);
        if (!pidToKill) {
          response = { type: 'error', content: 'kill: usage: kill [PID]' };
        } else {
          // Check simulated pids
          const winIndex = windows.findIndex(w => w.isOpen && windows.indexOf(w) === (pidToKill - 2000));
          if (winIndex !== -1) {
            closeWindow(windows[winIndex].id);
            response = { type: 'success', content: `Terminated process ${pidToKill}` };
          } else if ([1, 567, 890].includes(pidToKill)) {
            triggerPanic(`Attempted to kill critical system process (PID ${pidToKill}) via terminal kill command.`);
            return;
          } else {
            response = { type: 'error', content: `kill: ${pidToKill}: No such process` };
          }
        }
        break;
      case 'mkdir':
        if (args[1]) {
          setFileSystem(prev => ({ ...prev, [`${args[1]}/`]: '' }));
          response = { type: 'success', content: `Created directory: ${args[1]}` };
        } else {
          response = { type: 'error', content: 'mkdir: missing operand' };
        }
        break;
      case 'touch':
        if (args[1]) {
          setFileSystem(prev => ({ ...prev, [args[1]]: '' }));
          response = { type: 'success', content: `Created file: ${args[1]}` };
        } else {
          response = { type: 'error', content: 'touch: missing operand' };
        }
        break;
      case 'rm':
        if (args[1]) {
          if (fileSystem[args[1]] !== undefined) {
            setFileSystem(prev => {
              const newFs = { ...prev };
              delete newFs[args[1]];
              return newFs;
            });
            response = { type: 'success', content: `Removed: ${args[1]}` };
          } else {
            response = { type: 'error', content: `rm: cannot remove '${args[1]}': No such file or directory` };
          }
        } else {
          response = { type: 'error', content: 'rm: missing operand' };
        }
        break;
      case 'history':
        response = {
          type: 'text',
          content: (
            <div className="font-mono text-[10px] opacity-80">
              {commandHistory.map((c, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-accent/50 w-8 text-right">{i + 1}</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )
        };
        break;
      case 'man':
        const manCmd = args[1];
        if (manCmd) {
          textOutput = `MANUAL PAGE FOR ${manCmd.toUpperCase()}\n\nNAME\n       ${manCmd} - simulated command\n\nSYNOPSIS\n       ${manCmd} [options] [arguments]\n\nDESCRIPTION\n       This is a simulated manual page for the ${manCmd} command in Ge-Linux.`;
          response = { type: 'text', content: <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        } else {
          response = { type: 'error', content: 'What manual page do you want?' };
        }
        break;
      case 'who':
        textOutput = "user     tty1         2026-04-02 07:32\nroot     tty7         2026-04-02 07:30 (:0)";
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'pwd':
        textOutput = "/home/user";
        response = { type: 'text', content: "/home/user" };
        break;
      case 'df':
        textOutput = "Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/sda1      512000000  12450000 499550000   3% /\ntmpfs            8192000         0   8192000   0% /dev/shm";
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'free':
        textOutput = "              total        used        free      shared  buff/cache   available\nMem:       16384000     4120000    12264000      120000     1200000    11800000\nSwap:       4096000           0     4096000";
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'ps':
        textOutput = "  PID TTY          TIME CMD\n  124 tty1     00:00:01 ge-sh\n  125 tty1     00:00:00 ps\n 1024 tty7     00:05:24 Xorg\n 1025 tty7     00:02:12 ge-desktop";
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'kill':
        if (args[1]) {
          response = { type: 'success', content: `Terminated process ${args[1]}` };
        } else {
          response = { type: 'error', content: 'kill: usage: kill <pid>' };
        }
        break;
      case 'ping6':
        const p6Target = args[1] || '::1';
        textOutput = `PING6 ${p6Target}(::1) 56 data bytes\n64 bytes from ::1: icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from ::1: icmp_seq=2 ttl=64 time=0.051 ms\n--- ${p6Target} ping6 statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1001ms`;
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'dig':
        const digTarget = args[1] || 'google.com';
        textOutput = `; <<>> DiG 9.18.12-GeLinux <<>> ${digTarget}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 45212\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n;; QUESTION SECTION:\n;${digTarget}.			IN	A\n\n;; ANSWER SECTION:\n${digTarget}.		300	IN	A	142.250.190.46\n\n;; Query time: 12 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8) (UDP)`;
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'curl':
        const curlUrl = args[1] || 'http://ge-linux.org';
        textOutput = `HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 124\n\n<html>\n<head><title>Ge-Linux</title></head>\n<body>Welcome to Ge-Linux Beta Edition</body>\n</html>`;
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case 'wget':
        const wgetUrl = args[1] || 'http://ge-linux.org/kernel.tar.gz';
        textOutput = `--2026-04-02 07:32:19--  ${wgetUrl}\nResolving ge-linux.org... 142.250.190.46\nConnecting to ge-linux.org|142.250.190.46|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 12450000 (12M) [application/x-gzip]\nSaving to: 'kernel.tar.gz'\n\n100%[======================================>] 12,450,000  1.24MB/s   in 10s\n\n2026-04-02 07:32:29 (1.24 MB/s) - 'kernel.tar.gz' saved [12450000/12450000]`;
        response = { type: 'text', content: <pre className="mt-2 font-mono text-[10px] text-accent/80">{textOutput}</pre> };
        break;
      case '':
        return;
      default:
        response = { type: 'error', content: `ge-sh: command not found: ${baseCmd}` };
    }

    if (outputFile) {
      if (textOutput !== null) {
        setFileSystem(prev => ({ ...prev, [outputFile!]: textOutput! }));
        setHistory(prev => [...prev, 
          { type: 'text', content: <div className="flex items-center gap-2 text-accent/70 font-mono text-xs"><ChevronRight size={12} /> {cmd}</div> },
          { type: 'success', content: `Output redirected to ${outputFile}` }
        ]);
      } else {
        setHistory(prev => [...prev, 
          { type: 'text', content: <div className="flex items-center gap-2 text-accent/70 font-mono text-xs"><ChevronRight size={12} /> {cmd}</div> },
          { type: 'error', content: `Redirection not supported for this command` }
        ]);
      }
    } else {
      setHistory(prev => [...prev, { type: 'text', content: <div className="flex items-center gap-2 text-accent/70 font-mono text-xs"><ChevronRight size={12} /> {cmd}</div> }, response]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  const COMMANDS = [
    'startx', 'help', 'welcome', 'sudo', 'ping', 'traceroute', 'netstat', 
    'doom', 'edit', 'play', 'browser', 'clock', 'ls', 'cat', 'neofetch', 
    'clear', 'reboot', 'shutdown', 'lock', 'exit', 'echo', 'install',
    'whoami', 'uptime', 'date', 'uname', 'top', 'mkdir', 'touch', 'rm', 'history',
    'man', 'who', 'pwd', 'df', 'free', 'ps', 'kill', 'ping6', 'dig', 'curl', 'wget', 'taskmanager'
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];
      
      if (parts.length === 1) {
        // Complete command
        const matches = COMMANDS.filter(c => c.startsWith(lastPart.toLowerCase()));
        if (matches.length === 1) {
          setInput(matches[0]);
        }
      } else {
        // Complete file path
        const matches = Object.keys(fileSystem).filter(f => f.startsWith(lastPart));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          setInput(parts.join(' '));
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  if (mode === 'boot') {
    return (
      <div className="min-h-screen bg-black p-8 font-mono text-[10px] crt-overlay text-[#d4d4d4] leading-tight">
        <div className="scanline" />
        <div className="max-w-4xl mx-auto">
          {bootLogs.map((log, i) => (
            <div key={i} className="mb-0.5">{log}</div>
          ))}
          <div className="terminal-cursor" />
        </div>
      </div>
    );
  }

  if (mode === 'installer') {
    return <Installer onComplete={() => { 
      setIsInstalled(true); 
      localStorage.setItem('ge-linux-installed', 'true');
      setMode('boot'); 
      setBootLogs([]); 
    }} />;
  }

  if (mode === 'lock') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center crt-overlay text-white font-sans overflow-hidden">
        <div className="scanline" />
        <div className="absolute top-10 right-10 text-right">
          <div className="text-6xl font-light tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-xl font-medium text-accent/80">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="w-32 h-32 rounded-full border-2 border-accent/30 p-1 bg-accent/5 flex items-center justify-center overflow-hidden">
            <User size={64} className="text-accent/50" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tracking-widest uppercase">USER</div>
            <div className="text-xs text-white/40 mt-1">LOCKED</div>
          </div>
          <div className="w-64 relative">
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-sm outline-none focus:border-accent/50 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') setMode('desktop');
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <ChevronRight size={20} />
            </div>
          </div>
          <div className="flex gap-6 mt-12">
            <button onClick={() => { setMode('shutdown'); setBootLogs([]); }} className="flex flex-col items-center gap-2 text-white/30 hover:text-error transition-colors group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-error/10 transition-colors">
                <Power size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Shut Down</span>
            </button>
            <button onClick={() => { setMode('boot'); setBootLogs([]); }} className="flex flex-col items-center gap-2 text-white/30 hover:text-white transition-colors group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <RotateCw size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Restart</span>
            </button>
            <button onClick={() => setMode('terminal')} className="flex flex-col items-center gap-2 text-white/30 hover:text-white transition-colors group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <TerminalIcon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">v2.0.0 Beta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'terminal') {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#d4d4d4] font-mono flex flex-col crt-overlay" onClick={() => inputRef.current?.focus()}>
        <div className="scanline" />
        <div className="h-10 bg-[#1a1a1a] border-b border-accent/20 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-accent">
              <Monitor size={16} />
              <span className="text-xs font-bold tracking-widest">GE-LINUX v2.0.0 BETA</span>
            </div>
            <div className="system-tag ml-4">BETA 2.0.0-DEVELOPER</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <AnimatePresence initial={false}>
            {history.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-2">
                {item.content}
              </motion.div>
            ))}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
            <span className="text-accent font-bold text-xs">user@ge-linux:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-accent caret-transparent text-xs"
              autoFocus
              spellCheck={false}
            />
            <div className="terminal-cursor" />
          </form>
          <div ref={terminalEndRef} />
        </div>
      </div>
    );
  }

  if (mode === 'shutdown') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center crt-overlay text-white font-mono overflow-hidden cursor-none">
        <div className="scanline" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="text-accent/20 animate-pulse">
            <Power size={64} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase">System Halted</div>
            <div className="text-[10px] text-white/20 uppercase tracking-widest">Ge-Linux Kernel 7.2.0-ge-linux</div>
          </div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            onClick={() => { setMode('boot'); setBootLogs([]); }}
            className="mt-12 px-6 py-2 bg-white/5 border border-white/10 rounded hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all text-[10px] font-bold uppercase tracking-[0.2em] group"
          >
            <span className="flex items-center gap-2">
              <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Power On System
            </span>
          </motion.button>
        </motion.div>
        
        <div className="absolute bottom-10 text-[8px] text-white/10 uppercase tracking-[0.5em]">
          All processes terminated. Safe to power off.
        </div>
      </div>
    );
  }

  if (isKernelPanic) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://ge-linux.os/recovery?stopcode=${panicData.code}&hex=${panicData.hex}&details=${panicDetails}`)}`;

    return (
      <div className="min-h-screen bg-[#0000aa] text-white font-mono p-12 overflow-hidden flex flex-col gap-6 selection:bg-white selection:text-[#0000aa] relative">
        {/* Dynamic Static noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1, 0.5, 1] }}
          transition={{ duration: 0.5 }}
          className="scanline" 
        />
        
        <div className="flex items-start justify-between relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white text-[#0000aa] px-4 py-1 text-xl font-bold inline-block"
          >
            GE-LINUX KERNEL PANIC
          </motion.div>
          
          <div className="grid grid-cols-5 gap-1">
             {[...Array(25)].map((_, i) => (
               <motion.div 
                key={i} 
                animate={{ opacity: [0.1, 0.5, 0.1] }} 
                transition={{ duration: 1, delay: i * 0.05, repeat: Infinity }}
                className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-white' : 'bg-white/20'}`} 
               />
             ))}
          </div>
        </div>
        
        <div className="space-y-6 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-lg leading-tight uppercase font-black italic text-shadow-glow">
              *** FATAL EXCEPTION {panicData.hex} ({panicData.code}) ***
            </p>
            
            <p className="text-sm leading-relaxed mt-2 opacity-80">
              A critical kernel module encountered a segmentation fault. Ge-Linux has halted execution to prevent global data corruption. Current uptime is {Math.floor(performance.now() / 1000)} seconds.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-6 bg-black/40 border-l-4 border-error rounded font-mono text-[10px] space-y-2 text-white/80 shadow-2xl"
          >
            <div className="text-error font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert size={12} /> Diagnostic Stack Trace
            </div>
            <TypewriterText text={`[0.000000] Kernel panic - not syncing: ${panicDetails || 'Attempted to kill init!'}`} delay={1.2} />
            <TypewriterText text="[0.000000] CPU: 0 PID: 1 Comm: systemd Not tainted 6.8.0-ge-linux-beta" delay={1.4} />
            <TypewriterText text="[0.000000] Hardware name: Ge-Linux Processor / Virtual-X86 Platform" delay={1.6} />
            <TypewriterText text={`[0.000000] Error Code: ${panicData.hex} (STOP_${panicData.code})`} delay={1.8} />
            <TypewriterText text="[0.000000] Stack Frame: 0xffff888001000000 / IP: 0xffffffff81000000" delay={1.9} />
            <TypewriterText text="[0.000000] Core Dump Status: INITIALIZING..." delay={2.5} />
            
            {/* Memory Dump Progress */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[8px] uppercase font-bold text-white/40">
                <span>Memory Flush</span>
                <motion.span 
                  animate={{ opacity: [1, 0.5, 1] }} 
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {(64.2 + (Math.random() * 10)).toFixed(1)} MB / 8,192.0 MB
                </motion.span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-white/20"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="flex gap-8 items-start"
          >
            <div className="space-y-4 flex-1">
              <p className="text-[10px] text-white/40 leading-relaxed uppercase">
                If this is the first time you've seen this Stop error screen, restart your virtual machine. Ge-Linux will attempt a memory scrub on next boot. Failure to recover may require manual CMOS reset in the BIOS shell.
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-white/20">Contact System Support with code: GE_LINUX_{panicData.code}</p>
                <p className="text-[8px] text-white/10 uppercase tracking-widest">Digital Signature: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
              </div>
            </div>
            
            {/* Real QR Code */}
            <div className="bg-white p-2 rounded shadow-2xl relative group">
              <img 
                src={qrUrl} 
                alt="Recovery QR Code" 
                className="w-24 h-24"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="text-[#0000aa] text-[6px] font-bold uppercase rotate-45">Recovery Key</div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5 }}
          className="mt-auto flex justify-between items-end border-t border-white/20 pt-8 relative z-10"
        >
          <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono leading-relaxed">
            CPU_HALT_REASON: SIGKILL_SYS_CORE<br/>
            REG_DUMP: EAX=0x00EB EBX=0x000F ECX={panicData.hex.substring(2,6)} EDX=0x0000<br/>
            VIRTUAL_DISK_SYNC... FAILED (READ_ONLY_LOCK)
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-white text-[#0000aa] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/90 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#0000aa]/5 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative">Execute Hardware Reboot</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden crt-overlay select-none">
      <div className="desktop-bg" />
      <div className="scanline" />

      {/* Start Menu (Raspberry Pi Style) */}
      <AnimatePresence>
        {isPowerMenuOpen && (
          <StartMenu 
            onClose={() => setIsPowerMenuOpen(false)}
            onToggleWindow={toggleWindow}
            onSetMode={setMode}
          />
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="p-6 grid grid-flow-col grid-rows-6 gap-6 w-fit">
        <DesktopIcon icon={<TerminalIcon size={32} />} label="Terminal" onClick={() => toggleWindow('terminal')} />
        <DesktopIcon icon={<Folder size={32} />} label="Files" onClick={() => toggleWindow('files')} />
        <DesktopIcon icon={<Activity size={32} />} label="Monitor" onClick={() => toggleWindow('system')} />
        <DesktopIcon icon={<Play size={32} />} label="Video" onClick={() => toggleWindow('video')} />
        <DesktopIcon icon={<FileText size={32} />} label="Editor" onClick={() => toggleWindow('editor')} />
        <DesktopIcon icon={<Globe size={32} />} label="Browser" onClick={() => toggleWindow('browser')} />
        <DesktopIcon icon={<Video size={32} className="text-red-500" />} label="YouTube" onClick={() => toggleWindow('youtube')} />
        <DesktopIcon icon={<Clock size={32} />} label="Clock" onClick={() => toggleWindow('clock')} />
        <DesktopIcon icon={<Info size={32} />} label="Welcome" onClick={() => toggleWindow('welcome')} />
        <DesktopIcon icon={<Gamepad2 size={32} />} label="DOOM" onClick={() => toggleWindow('doom')} />
        <DesktopIcon icon={<Layout size={32} />} label="Calc" onClick={() => toggleWindow('calculator')} />
        <DesktopIcon icon={<Video size={32} />} label="Camera" onClick={() => toggleWindow('camera')} />
        <DesktopIcon icon={<Palette size={32} />} label="Paint" onClick={() => toggleWindow('paint')} />
        <DesktopIcon icon={<Globe size={32} />} label="Chat" onClick={() => toggleWindow('messenger')} />
        <DesktopIcon icon={<Layers size={32} />} label="Stress" onClick={() => toggleWindow('stress')} />
        <DesktopIcon icon={<Gamepad2 size={32} />} label="Snake" onClick={() => toggleWindow('snake')} />
        <DesktopIcon icon={<Gamepad2 size={32} />} label="Mines" onClick={() => toggleWindow('mines')} />
        <DesktopIcon icon={<Shield size={32} />} label="Invaders" onClick={() => toggleWindow('invaders')} />
        <DesktopIcon icon={<Settings size={32} />} label="Settings" onClick={() => toggleWindow('settings')} />
        <DesktopIcon icon={<Info size={32} />} label="About" onClick={() => toggleWindow('about')} />
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.map(win => win.isOpen && !win.isMinimized && (
          <Window 
            key={win.id} 
            win={win} 
            onClose={() => closeWindow(win.id)} 
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onFocus={() => focusWindow(win.id)}
          >
            <>
              {win.id === 'terminal' && (
                <div className="h-full bg-black/90 p-4 font-mono text-xs overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1">
                    {history.map((item, i) => <div key={i} className="mb-1">{item.content}</div>)}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                      <span className="text-accent font-bold">user@ge-linux:~$</span>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-accent"
                        autoFocus
                        spellCheck={false}
                      />
                    </form>
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              )}
              {win.id === 'files' && (
                <div className="h-full flex flex-col">
                  <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-3 justify-between">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                      {Object.keys(fileSystem).length} items
                    </div>
                    {selectedFile && (
                      <button 
                        onClick={() => deleteFile(selectedFile)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-error/20 hover:bg-error/30 text-error text-[10px] font-bold rounded transition-colors"
                      >
                        <X size={10} /> DELETE
                      </button>
                    )}
                  </div>
                  <div className="flex-1 p-4 grid grid-cols-4 gap-4 overflow-y-auto">
                    {Object.keys(fileSystem).map(f => {
                      const isVideo = f.endsWith('.mp4') || f.endsWith('.mpeg');
                      const isText = f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.info') || f.endsWith('.key');
                      const isSelected = selectedFile === f;
                      
                      return (
                        <div 
                          key={f} 
                          onClick={() => setSelectedFile(f)}
                          onDoubleClick={() => openFileInEditor(f)}
                          className={`flex flex-col items-center gap-1 p-2 rounded cursor-pointer group transition-colors ${isSelected ? 'bg-accent/20 border border-accent/30' : 'hover:bg-accent/10 border border-transparent'}`}
                        >
                          {isVideo ? (
                            <Video size={32} className={`${isSelected ? 'text-accent' : 'text-accent/70'} group-hover:scale-110 transition-transform`} />
                          ) : isText ? (
                            <FileText size={32} className={`${isSelected ? 'text-accent' : 'text-accent/70'} group-hover:scale-110 transition-transform`} />
                          ) : (
                            <HardDrive size={32} className={`${isSelected ? 'text-accent' : 'text-accent/70'} group-hover:scale-110 transition-transform`} />
                          )}
                          <span className={`text-[10px] text-center break-all ${isSelected ? 'text-white font-bold' : 'text-white/70'}`}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {win.id === 'system' && <SystemMonitorApp />}
              {win.id === 'video' && <VideoPlayer src={videoSource} />}
              {win.id === 'youtube' && <YouTubeApp />}
              {win.id === 'browser' && (
                <BrowserApp 
                  onClose={() => closeWindow(win.id)} 
                  onMinimize={() => minimizeWindow(win.id)} 
                  onMaximize={() => maximizeWindow(win.id)} 
                />
              )}
              {win.id === 'clock' && <ClockApp />}
              {win.id === 'welcome' && <WelcomeApp onOpenAbout={() => toggleWindow('about')} />}
              {win.id === 'about' && <AboutApp />}
              {win.id === 'taskmanager' && (
                <TaskManagerApp 
                  windows={windows} 
                  closeWindow={closeWindow} 
                  onKernelPanic={triggerPanic}
                />
              )}
              {win.id === 'calculator' && <CalculatorApp />}
              {win.id === 'paint' && <PaintApp />}
              {win.id === 'camera' && <CameraApp />}
              {win.id === 'messenger' && <MessengerApp />}
              {win.id === 'stress' && <StressTestApp />}
              {win.id === 'snake' && <SnakeGame />}
              {win.id === 'mines' && <MinesweeperGame />}
              {win.id === 'invaders' && <KernelInvadersGame />}
              {win.id === 'editor' && (
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  <div className="h-8 bg-[#2d2d2d] border-b border-white/10 flex items-center justify-between px-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white/50">
                      <Edit3 size={12} /> {editingFile || 'Untitled'}
                    </div>
                    <button 
                      onClick={saveFile}
                      className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 hover:bg-accent/30 text-accent text-[10px] font-bold rounded transition-colors"
                    >
                      <Save size={10} /> SAVE
                    </button>
                  </div>
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="flex-1 bg-transparent p-4 text-xs font-mono outline-none resize-none text-white/80 caret-accent"
                    placeholder="Start typing..."
                  />
                </div>
              )}
              {win.id === 'doom' && (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <iframe 
                    src="https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos" 
                    className="w-full h-full border-none"
                    title="DOOM"
                  />
                </div>
              )}
              {win.id === 'settings' && (
                <SettingsApp 
                  crtEnabled={crtEnabled} setCrtEnabled={setCrtEnabled}
                  scanlinesEnabled={scanlinesEnabled} setScanlinesEnabled={setScanlinesEnabled}
                  brightness={brightness} setBrightness={setBrightness}
                  accentColor={accentColor} setAccentColor={setAccentColor}
                  systemVolume={systemVolume} setSystemVolume={setSystemVolume}
                  bootSoundEnabled={bootSoundEnabled} setBootSoundEnabled={setBootSoundEnabled}
                  currentThemeId={currentThemeId} setCurrentThemeId={setCurrentThemeId}
                />
              )}
            </>
          </Window>
        ))}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 w-full h-12 glass border-t border-accent/20 flex items-center justify-between px-4 z-[1000]">
        <div className="flex items-center gap-2 h-full">
          <button 
            onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
            className={`h-full px-4 flex items-center gap-2 transition-colors ${isPowerMenuOpen ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/50'}`}
          >
            <Layout size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">GE-LINUX</span>
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <div className="flex items-center gap-1 h-full">
            {windows.map(win => win.isOpen && (
              <button 
                key={win.id}
                onClick={() => focusWindow(win.id)}
                className={`flex items-center gap-2 px-3 h-8 rounded transition-all ${win.isMinimized ? 'bg-white/5 opacity-50' : 'bg-accent/20 border border-accent/30 shadow-[0_0_10px_rgba(63,185,80,0.2)]'}`}
              >
                {win.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{win.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="system-tag rounded-sm text-[8px] tracking-widest font-black">BETA BUILD</div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-accent/70">
            <div className="flex items-center gap-1"><Network size={12} /> 124 KB/s</div>
            <div className="flex items-center gap-1"><Cpu size={12} /> 12%</div>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-xs font-bold">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[9px] text-white/50 font-mono">{time.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}</span>
          </div>
          <button 
            className="p-2 hover:bg-error/20 rounded transition-colors text-error"
            onClick={() => setMode('shutdown')}
          >
            <Power size={18} />
          </button>
        </div>
      </div>

      {/* Custom Cursor */}
      <CustomCursor pos={cursorPos} type={cursorType} activeWindowId={focusedWindowId} />
    </div>
  );
}

function CustomCursor({ pos, type, activeWindowId }: { pos: { x: number, y: number }, type: string, activeWindowId: string | null }) {
  const getCursorColor = () => {
    if (type === 'pointer') return 'var(--accent)';
    if (type === 'text') return '#fff';
    
    switch (activeWindowId) {
      case 'terminal': return '#3fb950';
      case 'youtube': return '#ff0000';
      case 'doom': return '#ff4500';
      case 'browser': return '#4285f4';
      case 'system': return '#00f2ff';
      default: return 'var(--accent)';
    }
  };

  const cursorColor = getCursorColor();

  return (
    <div 
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      {/* Main Pointer */}
      <motion.div 
        className="w-3 h-3 -ml-1.5 -mt-1.5 rounded-full"
        style={{ backgroundColor: cursorColor }}
        animate={{
          scale: type === 'pointer' ? 1.5 : type === 'text' ? 0.8 : 1,
          borderRadius: type === 'text' ? '2px' : '50%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      
      {/* Trailing Ring */}
      <motion.div 
        className="absolute top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-white/20"
        style={{ borderColor: `${cursorColor}44` }}
        animate={{
          scale: type === 'pointer' ? 1.2 : 1,
          opacity: type === 'text' ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      />

      {/* Window Indicator */}
      {activeWindowId && type === 'default' && (
        <motion.div 
          className="absolute top-4 left-4 whitespace-nowrap"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={activeWindowId}
        >
          <span className="text-[8px] font-bold uppercase tracking-widest px-1 bg-black/50 backdrop-blur-sm rounded border border-white/10" style={{ color: cursorColor }}>
            {activeWindowId}
          </span>
        </motion.div>
      )}
    </div>
  );
}

function Installer({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [details, setDetails] = useState('');

  const steps = [
    { title: 'Welcome', desc: 'Prepare for the Ge-Linux experience.' },
    { title: 'Partitioning', desc: 'Allocating virtual space for the system.' },
    { title: 'Installation', desc: 'Copying system files and configuring kernel.' },
    { title: 'Finish', desc: 'Installation complete.' }
  ];

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(3);
            return 100;
          }
          const next = prev + Math.random() * 5;
          
          // Update details based on progress
          if (next < 20) setDetails('Formatting virtual disk (ext4)...');
          else if (next < 40) setDetails('Copying core binaries to /usr/bin...');
          else if (next < 60) setDetails('Configuring systemd and network targets...');
          else if (next < 80) setDetails('Installing Ge-Desktop environment...');
          else setDetails('Finalizing configuration and cleaning up...');
          
          return next;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans crt-overlay">
      <div className="scanline" />
      <div className="w-full max-w-3xl glass rounded-2xl overflow-hidden border border-white/10 flex flex-col shadow-2xl">
        <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Ge-Linux Installer v2.0.0-beta</span>
          </div>
          <div className="system-tag rounded-sm text-[8px] tracking-widest font-black">BETA BUILD</div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-48 bg-black/20 border-r border-white/10 p-6 flex flex-col gap-4">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 transition-opacity ${i > step ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                  i < step ? 'bg-accent border-accent text-black' : 
                  i === step ? 'border-accent text-accent shadow-[0_0_10px_rgba(63,185,80,0.4)]' : 
                  'border-white/20 text-white/20'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${i === step ? 'text-accent' : 'text-white/40'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-12 flex flex-col">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Ready to Evolve?</h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    You are about to install Ge-Linux Beta, the next evolution in web-based operating system architecture. 
                    This process will configure your virtual environment for peak desktop performance.
                  </p>
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl mb-8">
                    <p className="text-xs font-bold text-accent italic">"Performance is not an option, it's a requirement."</p>
                  </div>
                  <button 
                    onClick={() => setStep(1)}
                    className="px-8 py-3 bg-accent text-black font-black uppercase italic tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(63,185,80,0.4)]"
                  >
                    Begin Installation
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <HardDrive className="text-accent" /> Disk Configuration
                  </h2>
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-white/5 border border-accent/40 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">Virtual Disk (sda)</div>
                        <div className="text-[10px] text-white/40 uppercase">64.0 GB - WebAssembly Storage</div>
                      </div>
                      <div className="text-accent text-[10px] font-bold uppercase tracking-widest">Selected</div>
                    </div>
                    <p className="text-xs text-white/40 italic">
                      Ge-Linux will use the entire virtual disk for the root partition (/). 
                      All existing virtual data will be overwritten.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(0)} className="px-6 py-2 border border-white/20 rounded-lg text-xs font-bold uppercase hover:bg-white/5">Back</button>
                    <button onClick={() => setStep(2)} className="px-6 py-2 bg-accent text-black rounded-lg text-xs font-bold uppercase tracking-widest">Confirm & Install</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Installing Ge-Linux...</h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest animate-pulse">{details}</p>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      className="h-full bg-accent shadow-[0_0_15px_rgba(63,185,80,0.6)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="text-right text-[10px] font-mono text-accent">{Math.floor(progress)}%</div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-black mb-6 shadow-[0_0_30px_rgba(63,185,80,0.5)]">
                    <Monitor size={40} />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">System Ready</h2>
                  <p className="text-white/60 text-sm mb-8 max-w-sm">
                    Installation complete. Ge-Linux is now configured and ready for its first real boot.
                  </p>
                  <button 
                    onClick={onComplete}
                    className="px-10 py-3 bg-accent text-black font-black uppercase italic tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    Reboot Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemMonitorApp() {
  const [stats, setStats] = useState({
    cpu: 14,
    ram: 2.4,
    processes: 142,
    threads: 892,
    networkUp: 12,
    networkDown: 45,
    diskRead: 2.1,
    diskWrite: 0.8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(1.8, Math.min(14.5, prev.ram + (Math.random() * 0.1 - 0.05))),
        processes: Math.max(130, Math.min(160, prev.processes + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        threads: Math.max(850, Math.min(1050, prev.threads + (Math.random() > 0.7 ? Math.floor(Math.random() * 5 - 2) : 0))),
        networkUp: Math.max(0, Math.min(250, prev.networkUp + (Math.random() * 20 - 10))),
        networkDown: Math.max(0, Math.min(1500, prev.networkDown + (Math.random() * 100 - 50))),
        diskRead: Math.max(0, Math.min(150, prev.diskRead + (Math.random() * 10 - 5))),
        diskWrite: Math.max(0, Math.min(150, prev.diskWrite + (Math.random() * 10 - 5)))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full scrollbar-hide">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-white/70 uppercase tracking-wider">
          <span className="flex items-center gap-2"><Cpu size={14} className="text-accent" /> CPU Core Usage</span>
          <span>{stats.cpu.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" 
            animate={{ width: `${stats.cpu}%` }} 
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-white/70 uppercase tracking-wider">
          <span className="flex items-center gap-2"><Activity size={14} className="text-accent" /> Memory Forensics</span>
          <span>{stats.ram.toFixed(2)}GB / 16GB</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" 
            animate={{ width: `${(stats.ram / 16) * 100}%` }} 
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded border border-white/10 flex flex-col items-center justify-center gap-1">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Network Up</div>
          <div className="flex items-center gap-2">
            <Network size={12} className="text-accent rotate-180" />
            <div className="text-lg font-mono font-bold text-white/90">{stats.networkUp.toFixed(1)} <span className="text-[10px] text-white/30">KB/s</span></div>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded border border-white/10 flex flex-col items-center justify-center gap-1">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Network Down</div>
          <div className="flex items-center gap-2">
            <Network size={12} className="text-accent" />
            <div className="text-lg font-mono font-bold text-white/90">{stats.networkDown.toFixed(1)} <span className="text-[10px] text-white/30">KB/s</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded border border-white/10 flex flex-col items-center justify-center gap-1">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Disk Read</div>
          <div className="flex items-center gap-2">
            <HardDrive size={12} className="text-accent" />
            <div className="text-lg font-mono font-bold text-white/90">{stats.diskRead.toFixed(1)} <span className="text-[10px] text-white/30">MB/s</span></div>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded border border-white/10 flex flex-col items-center justify-center gap-1">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Disk Write</div>
          <div className="flex items-center gap-2">
            <HardDrive size={12} className="text-accent" />
            <div className="text-lg font-mono font-bold text-white/90">{stats.diskWrite.toFixed(1)} <span className="text-[10px] text-white/30">MB/s</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded border border-white/10 text-center">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest mb-1">Processes</div>
          <div className="text-xl font-mono font-bold text-accent">{stats.processes}</div>
        </div>
        <div className="p-3 bg-white/5 rounded border border-white/10 text-center">
          <div className="text-[8px] text-white/30 uppercase font-bold tracking-widest mb-1">Threads</div>
          <div className="text-xl font-mono font-bold text-accent">{stats.threads}</div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-accent/5 border border-accent/20 rounded text-[8px] text-accent/70 font-mono leading-tight">
        SYSTEM KERNEL: GE-LINUX 7.2.0-BETA-RELEASE<br/>
        UPTIME: 127 DAYS, 14 HOURS, 52 MINUTES<br/>
        LOAD AVERAGE: 0.12, 0.08, 0.05
      </div>
    </div>
  );
}

function AboutApp() {
  return (
    <div className="h-full bg-[#0c0c0c] text-white/90 p-8 overflow-y-auto font-sans">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(63,185,80,0.3)] mb-4">
            <Monitor size={56} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Ge-Linux 2.0</h1>
          <p className="text-accent font-bold text-sm tracking-widest uppercase opacity-80 mt-1">Version 2.0.0-beta</p>
        </div>

        <div className="space-y-6 text-left">
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User size={14} /> Creator & Contributors
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Heart size={20} />
              </div>
              <div>
                <div className="font-bold text-lg">Richard Bakro</div>
                <div className="text-xs text-white/40">Lead Architect & Cloud Visionary</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield size={14} /> License
            </h2>
            <p className="text-sm leading-relaxed">
              Ge-Linux is released under the <span className="text-accent font-bold">Apache-2.0 License</span>. 
              Free to use, modify, and distribute for the betterment of the web.
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={14} /> System Info
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-white/30 uppercase mb-1">Architecture</div>
                <div className="font-mono">Web-Native x64</div>
              </div>
              <div>
                <div className="text-white/30 uppercase mb-1">Kernel</div>
                <div className="font-mono">GE-Core 7.2.0</div>
              </div>
              <div>
                <div className="text-white/30 uppercase mb-1">Shell</div>
                <div className="font-mono">ge-sh 2.0</div>
              </div>
              <div>
                <div className="text-white/30 uppercase mb-1">UI Engine</div>
                <div className="font-mono">React + Motion</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em]">
          Designed with passion in the cloud
        </div>
      </div>
    </div>
  );
}

function WelcomeApp({ onOpenAbout }: { onOpenAbout: () => void }) {
  const [bootLog, setBootLog] = useState<string[]>([]);
  
  useEffect(() => {
    const logs = [
      'Initialize Kernel v2.0.0-Beta...',
      'Mapping virtual address space...',
      'Loading Ge-Linux Environment...',
      'Mounting /dev/root on /...',
      'Starting System Services...',
      'UI Compositor: ONLINE',
      'Uplink Tunnel: ESTABLISHED',
      'System Ready.'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-[#111] overflow-y-auto custom-scrollbar flex flex-col font-mono">
      <div className="p-8 text-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-lg shadow-accent/10 border border-accent/20">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Ge-Linux <span className="text-accent underline">v2.0</span></h1>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">Professional Web-Kernel Edition</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-black uppercase text-accent tracking-widest border-b border-white/5 pb-2">Hardware Spec</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40 font-bold uppercase">CPU</span>
                <span className="text-white/80">Virtual 8-Core Cluster</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40 font-bold uppercase">MEM</span>
                <span className="text-white/80">64.0 GiB (Simulation)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40 font-bold uppercase">NET</span>
                <span className="text-white/80 italic">Uplinked (HTTP/S)</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase text-accent tracking-widest border-b border-white/5 pb-2 mb-4">Quick Start</h2>
            <ul className="space-y-2 text-[10px] text-white/50 leading-relaxed uppercase font-bold">
              <li className="flex gap-2"><span className="text-accent">»</span> Use Terminal for forensics</li>
              <li className="flex gap-2"><span className="text-accent">»</span> Launch Snake for stress-test</li>
              <li className="flex gap-2"><span className="text-accent">»</span> Deploy Browser for networking</li>
            </ul>
          </div>
        </div>

        <div className="bg-black border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-2 text-white/30">
            <TerminalIcon size={12} />
            <span className="text-[9px] uppercase font-black tracking-widest">Boot Initialization Sequence</span>
          </div>
          <div className="space-y-1">
            {bootLog.map((log, idx) => (
              <div key={idx} className="text-[10px] flex gap-2">
                <span className="text-accent font-bold opacity-50">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>
                <span className="text-white/80">{log}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onOpenAbout}
            className="flex-1 bg-accent text-black font-black uppercase text-xs tracking-widest py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            System Manifesto
          </button>
          <button className="flex-1 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest py-3 rounded-full hover:bg-white/10 transition-all">
            Update Kernel
          </button>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-white/5 text-center">
        <p className="text-[8px] text-white/20 uppercase font-black tracking-[0.5em]">Licensed to Ge-Engine Forensics v2.0</p>
      </div>
    </div>
  );
}

function ClockApp() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <div className="text-6xl font-black tracking-tighter text-accent drop-shadow-[0_0_15px_rgba(63,185,80,0.4)] font-mono">
          {formatTime(time)}
        </div>
        <div className="text-sm text-white/50 mt-2 uppercase tracking-[0.3em] font-bold">
          {formatDate(time)}
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 w-full max-w-xs mt-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-[10px] font-bold text-white/30">{day}</div>
        ))}
        {[...Array(31)].map((_, i) => {
          const day = i + 1;
          const isToday = day === time.getDate();
          return (
            <div 
              key={i} 
              className={`aspect-square flex items-center justify-center text-[10px] rounded transition-colors ${
                isToday ? 'bg-accent text-black font-bold' : 'hover:bg-white/5 text-white/60'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4">
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-white/30 uppercase font-bold mb-1">London</div>
          <div className="text-xs font-mono text-accent/70">
            {new Date(time.getTime() + (time.getTimezoneOffset() * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Tokyo</div>
          <div className="text-xs font-mono text-accent/70">
            {new Date(time.getTime() + (time.getTimezoneOffset() * 60000) + (9 * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-white/30 uppercase font-bold mb-1">New York</div>
          <div className="text-xs font-mono text-accent/70">
            {new Date(time.getTime() + (time.getTimezoneOffset() * 60000) - (4 * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BrowserTab {
  id: string;
  url: string;
  inputUrl: string;
  history: string[];
  historyIndex: number;
  title: string;
}

function StartMenu({ onClose, onToggleWindow, onSetMode }: { onClose: () => void, onToggleWindow: (id: string) => void, onSetMode: (mode: any) => void }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { id: 'All', icon: <Layers size={14} />, label: 'All Apps' },
    { id: 'Programming', icon: <Code size={14} />, label: 'Programming' },
    { id: 'Internet', icon: <Globe size={14} />, label: 'Internet' },
    { id: 'Games', icon: <Gamepad size={14} />, label: 'Games' },
    { id: 'Accessories', icon: <Briefcase size={14} />, label: 'Accessories' },
    { id: 'System', icon: <Wrench size={14} />, label: 'System Tools' },
  ];

  const apps = [
    { id: 'terminal', title: 'Terminal', icon: <TerminalIcon size={16} />, category: 'Programming' },
    { id: 'editor', title: 'Text Editor', icon: <Edit3 size={16} />, category: 'Programming' },
    { id: 'browser', title: 'GE-Lunweb', icon: <Globe size={16} />, category: 'Internet' },
    { id: 'youtube', title: 'YouTube', icon: <Video size={16} className="text-red-500" />, category: 'Internet' },
    { id: 'doom', title: 'DOOM', icon: <Gamepad2 size={16} />, category: 'Games' },
    { id: 'files', title: 'File Explorer', icon: <Folder size={16} />, category: 'Accessories' },
    { id: 'clock', title: 'Clock', icon: <Clock size={16} />, category: 'Accessories' },
    { id: 'system', title: 'System Monitor', icon: <Activity size={16} />, category: 'System' },
    { id: 'taskmanager', title: 'Task Manager', icon: <Activity size={16} />, category: 'System' },
    { id: 'settings', title: 'Settings', icon: <Settings size={16} />, category: 'System' },
    { id: 'calculator', title: 'Calculator', icon: <Layout size={16} />, category: 'Accessories' },
    { id: 'paint', title: 'Ge-Paint', icon: <Palette size={16} />, category: 'Accessories' },
    { id: 'camera', title: 'Camera', icon: <Video size={16} />, category: 'Accessories' },
    { id: 'messenger', title: 'Messenger', icon: <Globe size={16} />, category: 'Internet' },
    { id: 'snake', title: 'Snake Game', icon: <Gamepad2 size={16} />, category: 'Games' },
    { id: 'mines', title: 'Minesweeper', icon: <Gamepad2 size={16} />, category: 'Games' },
    { id: 'invaders', title: 'Kernel Invaders', icon: <Shield size={16} />, category: 'Games' },
    { id: 'stress', title: 'Stress Test', icon: <Layers size={16} />, category: 'System' },
    { id: 'welcome', title: 'Welcome', icon: <Info size={16} />, category: 'All' },
    { id: 'about', title: 'About', icon: <Info size={16} />, category: 'All' },
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-14 left-4 w-[480px] h-[400px] glass border border-accent/20 rounded-xl overflow-hidden z-[1001] flex flex-col shadow-2xl shadow-black/50"
    >
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(63,185,80,0.2)]">
            <User size={20} className="text-accent" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight">Ge-Linux User</div>
            <div className="text-[8px] text-accent/50 uppercase tracking-widest font-black">Beta Build</div>
          </div>
        </div>
        <div className="relative w-48">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="text" 
            placeholder="Search apps..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-[10px] outline-none focus:border-accent/50 transition-colors"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-36 bg-black/20 border-r border-white/10 p-2 flex flex-col gap-1">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-2 content-start">
          {filteredApps.map(app => (
            <button 
              key={app.id}
              onClick={() => { onToggleWindow(app.id); onClose(); }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-accent/70 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                {app.icon}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white">
                {app.title}
              </div>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center h-full opacity-30 mt-12">
              <Search size={32} className="mb-2" />
              <div className="text-[10px] font-bold uppercase">No apps found</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Power Actions */}
      <div className="p-2 bg-white/5 border-t border-white/10 flex items-center justify-between px-4">
        <div className="flex gap-1">
          <button 
            onClick={() => { onSetMode('lock'); onClose(); }}
            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            title="Lock Screen"
          >
            <Shield size={14} />
          </button>
          <button 
            onClick={() => { onSetMode('terminal'); onClose(); }}
            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            title="Switch to Kernel Shell"
          >
            <TerminalIcon size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { onSetMode('boot'); onClose(); }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
          >
            <RotateCw size={14} /> Restart
          </button>
          <button 
            onClick={() => { onSetMode('shutdown'); onClose(); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-error/10 hover:bg-error/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-error transition-all"
          >
            <Power size={14} /> Shut Down
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsApp({ 
  crtEnabled, setCrtEnabled, 
  scanlinesEnabled, setScanlinesEnabled, 
  brightness, setBrightness, 
  accentColor, setAccentColor,
  systemVolume, setSystemVolume,
  bootSoundEnabled, setBootSoundEnabled,
  currentThemeId, setCurrentThemeId
}: { 
  crtEnabled: boolean, setCrtEnabled: (v: boolean) => void,
  scanlinesEnabled: boolean, setScanlinesEnabled: (v: boolean) => void,
  brightness: number, setBrightness: (v: number) => void,
  accentColor: string, setAccentColor: (v: string) => void,
  systemVolume: number, setSystemVolume: (v: number) => void,
  bootSoundEnabled: boolean, setBootSoundEnabled: (v: boolean) => void,
  currentThemeId: string, setCurrentThemeId: (v: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'appearance' | 'themes' | 'system'>('display');

  const colors = [
    { name: 'GitHub Green', value: '#3fb950' },
    { name: 'Cyber Blue', value: '#00d2ff' },
    { name: 'Neon Purple', value: '#bc13fe' },
    { name: 'Hot Pink', value: '#ff007f' },
    { name: 'Amber', value: '#ffbf00' },
    { name: 'Classic White', value: '#ffffff' },
  ];

  return (
    <div className="h-full flex overflow-hidden bg-black/40">
      {/* Sidebar */}
      <div className="w-40 border-r border-white/10 p-2 flex flex-col gap-1">
        <button 
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'display' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
        >
          <Monitor size={14} /> Display
        </button>
        <button 
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'audio' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
        >
          <Volume2 size={14} /> Audio
        </button>
        <button 
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'themes' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
        >
          <Palette size={14} /> Themes
        </button>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'appearance' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
        >
          <Layout size={14} /> Appearance
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'system' ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-white/40'}`}
        >
          <Wrench size={14} /> System
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'display' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent border-b border-accent/20 pb-2">Display & Video</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase">CRT Overlay</div>
                  <div className="text-[8px] text-white/40">Simulate retro CRT screen effects</div>
                </div>
                <button 
                  onClick={() => setCrtEnabled(!crtEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${crtEnabled ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${crtEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase">Moving Scanlines</div>
                  <div className="text-[8px] text-white/40">Add dynamic scanning line animation</div>
                </div>
                <button 
                  onClick={() => setScanlinesEnabled(!scanlinesEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${scanlinesEnabled ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${scanlinesEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="text-[10px] font-bold uppercase">System Brightness</div>
                  <div className="text-[10px] font-mono text-accent">{brightness}%</div>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent border-b border-accent/20 pb-2">Audio & Sound</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="text-[10px] font-bold uppercase">Master Volume</div>
                  <div className="text-[10px] font-mono text-accent">{systemVolume}%</div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={14} className="text-white/40" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={systemVolume} 
                    onChange={(e) => setSystemVolume(parseInt(e.target.value))}
                    className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase">Boot Sound</div>
                  <div className="text-[8px] text-white/40">Play audio during system startup</div>
                </div>
                <button 
                  onClick={() => setBootSoundEnabled(!bootSoundEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${bootSoundEnabled ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${bootSoundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent border-b border-accent/20 pb-2">Desktop Themes</h2>
            <div className="grid grid-cols-1 gap-3">
              {THEMES.map(theme => (
                <button 
                  key={theme.id}
                  onClick={() => {
                    setCurrentThemeId(theme.id);
                    setAccentColor(theme.accent);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${currentThemeId === theme.id ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center border border-white/10"
                    style={{ background: `radial-gradient(circle at center, ${theme.bgGradientStart} 0%, ${theme.bg} 100%)` }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest">{theme.name}</div>
                    <div className="text-[8px] text-white/40 mt-1 uppercase tracking-tighter">
                      Font: {theme.fontSans} • Pattern: {theme.pattern}
                    </div>
                  </div>
                  {currentThemeId === theme.id && <div className="text-accent text-[8px] font-bold uppercase">Active</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent border-b border-accent/20 pb-2">Appearance</h2>
            
            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-bold uppercase">Override Accent Color</div>
              <div className="grid grid-cols-3 gap-2">
                {colors.map(color => (
                  <button 
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`flex items-center gap-2 p-2 rounded border transition-all ${accentColor === color.value ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                    <span className="text-[8px] font-bold uppercase truncate">{color.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase mb-2">Desktop Background</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0c0c0c] border border-accent/40 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-accent">DEFAULT</span>
                  </div>
                  <div className="aspect-video bg-black border border-white/10 rounded flex items-center justify-center opacity-50 cursor-not-allowed">
                    <Plus size={16} className="text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent border-b border-accent/20 pb-2">System Management</h2>
            
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-error" size={20} />
                  <div className="text-[10px] font-bold uppercase text-error">Danger Zone</div>
                </div>
                <p className="text-[9px] text-white/50 mb-4 leading-tight">Resetting the system will wipe all local data, including your virtual file system and preferences. This action cannot be undone.</p>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset the system? All data will be lost.')) {
                      localStorage.removeItem('ge-linux-installed');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 bg-error/20 hover:bg-error/30 text-error text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
                >
                  Reset Ge-Linux
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-[10px] font-bold uppercase mb-1">Kernel Information</div>
                <div className="text-[8px] text-white/40 font-mono">Ge-Linux 6.8.0-ge-linux-quantum #1 SMP PREEMPT_DYNAMIC Mon Mar 30 2026 x86_64</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypewriterText({ text, delay = 0 }: { text: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text}
    </motion.div>
  );
}

function TaskManagerApp({ windows, closeWindow, onKernelPanic }: { windows: WindowState[], closeWindow: (id: string) => void, onKernelPanic: (details: string) => void }) {
  const [activeTab, setActiveTab] = useState<'processes'|'performance'|'details'>('processes');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name'|'pid'|'cpu'|'mem'>('pid');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');

  // Background processes simulation
  const [bgProcesses, setBgProcesses] = useState([
    { pid: 1, name: 'systemd', cpu: 0.1, mem: 12.4, user: 'root', status: 'Running', critical: true, icon: <Monitor size={10} /> },
    { pid: 142, name: 'kswapd0', cpu: 0.0, mem: 2.1, user: 'root', status: 'Sleeping', critical: false, icon: <Activity size={10} /> },
    { pid: 567, name: 'Xorg', cpu: 2.4, mem: 156.8, user: 'root', status: 'Running', critical: true, icon: <Layers size={10} /> },
    { pid: 890, name: 'ge-desktop', cpu: 1.2, mem: 84.5, user: 'user', status: 'Running', critical: true, icon: <Layout size={10} /> },
    { pid: 1024, name: 'network-mgr', cpu: 0.0, mem: 18.2, user: 'root', status: 'Running', critical: false, icon: <Network size={10} /> },
    { pid: 1088, name: 'pulseaudio', cpu: 0.5, mem: 34.1, user: 'user', status: 'Running', critical: false, icon: <Volume2 size={10} /> },
    { pid: 1120, name: 'ge-sh', cpu: 0.0, mem: 8.4, user: 'user', status: 'Running', critical: false, icon: <TerminalIcon size={10} /> },
    { pid: 1245, name: 'kernel-forensics', cpu: 5.4, mem: 212.4, user: 'root', status: 'Running', critical: false, icon: <Shield size={10} /> },
    { pid: 1301, name: 'cloud-sync', cpu: 0.2, mem: 45.1, user: 'user', status: 'Running', critical: false, icon: <Cloud size={10} /> },
    { pid: 1400, name: 'telemetry-d', cpu: 0.1, mem: 8.2, user: 'root', status: 'Sleeping', critical: false, icon: <Activity size={10} /> },
  ]);

  // Map windows to "real" processes
  const windowProcesses = windows
    .filter(w => w.isOpen)
    .map((w, index) => ({
      pid: 2000 + index,
      name: w.id === 'terminal' ? 'ge-sh (tty7)' : w.title,
      cpu: Math.random() * 5,
      mem: 50 + Math.random() * 200,
      user: 'user',
      status: w.isMinimized ? 'Suspended' : 'Running',
      windowId: w.id,
      critical: false,
      icon: w.icon
    }));

  const allProcesses = [...bgProcesses, ...windowProcesses]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const handleSort = (key: 'name'|'pid'|'cpu'|'mem') => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleEndTask = (pid: number, force: boolean = false) => {
    const process = allProcesses.find(p => p.pid === pid);
    if (!process) return;

    if (process.critical && !force) {
      alert(`CRITICAL ERROR: '${process.name}' (PID ${process.pid}) is a vital system component. Terminating it may cause system instability.`);
      return;
    }

    if (process.critical && force) {
      onKernelPanic(`Attempted to kill critical system process: ${process.name} (PID ${process.pid})`);
      return;
    }

    if ((process as any).windowId) {
      closeWindow((process as any).windowId);
    } else {
      setBgProcesses(prev => prev.filter(p => p.pid !== pid));
    }
  };

  const selectedProcess = allProcesses.find(p => p.pid === selectedPid);

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c] text-white/90 font-sans selection:bg-accent/30 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/5">
        {(['processes', 'performance', 'details'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {activeTab === 'processes' && (
          <div className="flex flex-col h-full gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search processes..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-bold text-white outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-white/10 rounded overflow-hidden">
              <table className="w-full text-left font-mono text-[10px]">
                <thead className="bg-white/10 text-white/50 sticky top-0">
                  <tr>
                    <th onClick={() => handleSort('name')} className="px-3 py-2 border-b border-white/10 cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-2">
                        Process {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('pid')} className="px-3 py-2 border-b border-white/10 cursor-pointer hover:text-white transition-colors">PID</th>
                    <th onClick={() => handleSort('cpu')} className="px-3 py-2 border-b border-white/10 cursor-pointer hover:text-white transition-colors">CPU %</th>
                    <th onClick={() => handleSort('mem')} className="px-3 py-2 border-b border-white/10 cursor-pointer hover:text-white transition-colors">Memory</th>
                    <th className="px-3 py-2 border-b border-white/10">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allProcesses.map(p => (
                    <tr 
                      key={p.pid} 
                      onClick={() => setSelectedPid(p.pid)}
                      className={`hover:bg-accent/10 cursor-pointer transition-colors ${selectedPid === p.pid ? 'bg-accent/20' : ''}`}
                    >
                      <td className="px-3 py-2 flex items-center gap-2">
                        <div className={`w-5 h-5 flex items-center justify-center rounded bg-white/5 border border-white/5 ${p.critical ? 'text-accent' : 'text-white/40'}`}>
                          {p.icon || <Activity size={10} />}
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="truncate">{p.name}</span>
                          {p.critical && <Shield size={8} className="text-accent opacity-50 shrink-0" />}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-white/40">{p.pid}</td>
                      <td className="px-3 py-2 text-accent">{(p.cpu || 0).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-white/40">{(p.mem || 0).toFixed(1)} MB</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          p.status === 'Running' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/40'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allProcesses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/20 uppercase tracking-widest font-black italic">No matching processes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
              <div className="text-[10px] text-white/40 uppercase tracking-tighter">
                {selectedProcess ? `Selected: ${selectedProcess.name} (PID: ${selectedProcess.pid})` : 'Select a process to manage'}
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={!selectedPid}
                  onClick={() => selectedProcess && handleEndTask(selectedProcess.pid, false)}
                  className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error rounded text-[9px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  End Task
                </button>
                <button 
                   disabled={!selectedPid}
                   onClick={() => selectedProcess && handleEndTask(selectedProcess.pid, true)}
                   className="px-3 py-1.5 bg-error text-black hover:scale-105 active:scale-95 rounded text-[9px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Force End
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="h-full overflow-y-auto">
            <SystemMonitorApp />
          </div>
        )}

        {activeTab === 'details' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
            {!selectedProcess ? (
              <div className="text-white/20 uppercase tracking-[0.2em] font-black italic">Select a process to view deep forensics</div>
            ) : (
              <div className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="flex items-center gap-4 mb-6 relative">
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shadow-[inset_0_0_10px_rgba(63,185,80,0.1)]">
                    {selectedProcess.icon || <Activity size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{selectedProcess.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">PID: {selectedProcess.pid}</span>
                      <span className="text-[7px] bg-white/5 px-1 rounded text-white/30 border border-white/10 uppercase tracking-tighter">{selectedProcess.user}</span>
                    </div>
                  </div>
                </div>

                {/* mini sparkline simulation */}
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 mb-6">
                  <div className="flex justify-between items-end mb-2 h-12 gap-1 uppercase">
                    {[10, 45, 30, 60, 20, 80, 40, 90, 50, 70, 30, 40].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, repeat: Infinity, repeatType: 'reverse', duration: 2 + Math.random() }}
                        className={`flex-1 rounded-t-[1px] ${i > 8 ? 'bg-accent/40' : 'bg-accent/20'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-widest">
                    <span>-60s</span>
                    <span>CPU LOAD HISTORY</span>
                    <span>NOW</span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-[10px] relative">
                  <div className="flex justify-between border-b border-white/5 pb-1 group-hover:border-accent/10 transition-colors">
                    <span className="text-white/30">CPU CORE AFFINITY</span>
                    <span className="text-accent font-bold">ALL CORES</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 group-hover:border-accent/10 transition-colors">
                    <span className="text-white/30">VIRTUAL ADDR SPACE</span>
                    <span className="text-white/70">{(selectedProcess.mem * 4).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 group-hover:border-accent/10 transition-colors">
                    <span className="text-white/30">I/O PRIORITY</span>
                    <span className="text-white/70 uppercase">High Performance</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 group-hover:border-accent/10 transition-colors">
                    <span className="text-white/30">PATH</span>
                    <span className="text-white/40 truncate ml-4 italic">/usr/bin/{selectedProcess.name.toLowerCase().replace(/\s/g, '-')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white/30">HANDLES</span>
                    <span className="text-white/70">1,241 (Buffered)</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <button 
                    className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/50 transition-all"
                    onClick={() => setSelectedPid(null)}
                  >
                    Close forensics
                  </button>
                  <button 
                    className="px-4 py-2 bg-error/10 border border-error/20 hover:bg-error/20 rounded-lg text-error text-[9px] font-black uppercase tracking-widest transition-all"
                    onClick={() => handleEndTask(selectedProcess.pid, false)}
                  >
                    Kill
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function YouTubeApp() {
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [input, setInput] = useState('');

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.includes('v=')) {
      setVideoId(input.split('v=')[1].split('&')[0]);
    } else if (input.includes('youtu.be/')) {
      setVideoId(input.split('youtu.be/')[1].split('?')[0]);
    } else if (input.includes('shorts/')) {
      setVideoId(input.split('shorts/')[1].split('?')[0]);
    } else {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="h-10 bg-[#2d2d2d] border-b border-white/10 flex items-center gap-2 px-3">
        <Video size={16} className="text-red-500" />
        <form onSubmit={handleSearch} className="flex-1">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube URL or search..."
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-1 text-[10px] text-white/80 outline-none focus:border-red-500/50 transition-colors"
          />
        </form>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">LIVE</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          className="w-full h-full"
          iframeClassName="w-full h-full border-none"
        />
      </div>
    </div>
  );
}

function BrowserViewport({ url, tabId }: { url: string, tabId: string }) {
  const [renderMode, setRenderMode] = useState<'object' | 'iframe' | 'proxy' | 'reader'>('object');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setErrorMessage('');
    // For 'about:blank' we don't render anything here
    if (url === 'about:blank') {
      setIsLoading(false);
      return;
    }
    
    // Auto-proxy heuristic
    const problematicDomains = ['google.com', 'github.com', 'twitter.com', 'facebook.com', 'youtube.com', 'linkedin.com', 'reddit.com'];
    const hostname = new URL(url).hostname;
    if (problematicDomains.some(d => hostname.includes(d))) {
      setRenderMode('proxy');
    } else {
      setRenderMode('object');
    }
  }, [url, tabId]);

  useEffect(() => {
    const handleForceProxy = (e: any) => {
      if (e.detail.tabId === tabId) {
        setRenderMode(prev => prev === 'proxy' ? 'object' : 'proxy');
      }
    };
    window.addEventListener('ge-browser-force-proxy', handleForceProxy);
    return () => window.removeEventListener('ge-browser-force-proxy', handleForceProxy);
  }, [tabId]);

  const handleObjectError = () => {
    console.warn("Object rendering failed, falling back to proxy");
    setRenderMode('proxy');
  };

  const handleIframeError = () => {
    console.warn("Iframe rendering failed, falling back to proxy");
    setRenderMode('proxy');
  };

  const handleProxyError = () => {
    setHasError(true);
    setIsLoading(false);
    setErrorMessage('The proxy engine was unable to tunnel into this node. This usually happens when the target server has extreme anti-scraping measures or is geographically restricted.');
  };

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

  if (url === 'about:blank') return null;

  // Simulated Reader Mode
  if (renderMode === 'reader') {
    return (
      <div className="h-full bg-[#fdfaf6] p-12 overflow-y-auto font-serif text-gray-900 selection:bg-accent/20">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">GE-Reader Protocol</h1>
              <p className="text-sm text-gray-500 font-sans uppercase tracking-widest font-bold opacity-60">Node: {new URL(url).hostname}</p>
            </div>
            <button 
              onClick={() => setRenderMode('proxy')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold uppercase transition-colors"
            >
              Exit Reader
            </button>
          </div>
          <div className="space-y-6 leading-[1.8] text-lg">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-11/12 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-10/12 animate-pulse" />
            <div className="h-8 bg-gray-50 rounded-lg w-full flex items-center justify-center text-xs font-bold text-gray-300 uppercase tracking-widest">Processing Node Blocks...</div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          </div>
          
          <div className="mt-16 p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Shield size={24} />
            </div>
            <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest mb-2">Technical Limitation</p>
            <p className="text-sm text-gray-500">Real-time neural parsing of dynamic web fragments is currently in beta. Content will stream as it is indexed by our crawling nodes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-white">
      {isLoading && renderMode !== 'reader' && (
        <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent/10 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe size={24} className="text-accent animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em] mb-1">Engaging Uplink</div>
            <div className="text-[9px] text-gray-400 uppercase font-bold flex items-center gap-2 justify-center">
              <span>{renderMode.toUpperCase()} MODE</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>TLS HANDSHAKE</span>
            </div>
          </div>
        </div>
      )}

      {hasError ? (
        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#f8f9fa] selection:bg-error/20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-error/5 rounded-3xl flex items-center justify-center mb-8 border border-error/10"
          >
            <ShieldAlert className="text-error" size={40} />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter uppercase italic">Neutralization Protocol</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">
            {errorMessage}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            <button 
              onClick={() => window.open(url, '_blank')}
              className="px-6 py-4 bg-accent text-white text-xs font-black uppercase italic tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
            >
              <ExternalLink size={18} /> Launch Externally
            </button>
            <button 
              onClick={() => setRenderMode('reader')}
              className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-600 text-xs font-black uppercase italic tracking-widest rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
            >
              <FileText size={18} /> Reader Mode
            </button>
          </div>
          
          <div className="mt-16 flex items-center gap-4 text-[9px] text-gray-300 uppercase font-black tracking-widest">
            <span>Code: 0x884-FL</span>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <span>Trace: Blocked by Node Operator</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-white flex flex-col">
          {renderMode === 'object' && (
            <object
              key={`obj-${tabId}-${url}`}
              data={url}
              type="text/html"
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              onError={handleObjectError}
            >
              <iframe 
                key={`if-fallback-${tabId}-${url}`}
                src={url} 
                className="w-full h-full border-none"
                onLoad={() => setIsLoading(false)}
                onError={handleIframeError}
              />
            </object>
          )}
          
          {renderMode === 'iframe' && (
            <iframe 
              key={`if-${tabId}-${url}`}
              src={url} 
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              onError={handleIframeError}
            />
          )}

          {renderMode === 'proxy' && (
            <iframe 
              key={`proxy-${tabId}-${url}`}
              src={proxyUrl} 
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              onError={handleProxyError}
            />
          )}
        </div>
      )}
    </div>
  );
}

function BrowserApp({ onClose, onMinimize, onMaximize }: { onClose: () => void, onMinimize: () => void, onMaximize: () => void }) {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      url: 'https://www.google.com/search?igu=1',
      inputUrl: 'https://www.google.com',
      history: ['https://www.google.com/search?igu=1'],
      historyIndex: 0,
      title: 'Google'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showHistory, setShowHistory] = useState(false);
  const [globalHistory, setGlobalHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('ge-browser-history');
    return saved ? JSON.parse(saved) : ['https://www.google.com', 'https://youtube.com', 'https://github.com'];
  });
  const [bookmarks, setBookmarks] = useState<{name: string, url: string}[]>(() => {
    const saved = localStorage.getItem('ge-browser-bookmarks');
    return saved ? JSON.parse(saved) : [
      { name: 'Google', url: 'https://www.google.com/search?igu=1' },
      { name: 'YouTube', url: 'https://youtube.com' },
      { name: 'Ge-Linux Wiki', url: 'https://github.com/richardbakro/ge-linux' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ge-browser-history', JSON.stringify(globalHistory));
  }, [globalHistory]);

  useEffect(() => {
    localStorage.setItem('ge-browser-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    
    if (finalUrl === '') return;

    // Handle Search vs URL
    if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
    } else {
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
    }
    
    // Engine specific fixes
    if (finalUrl.includes('youtube.com/watch?v=')) {
      const videoId = finalUrl.split('v=')[1]?.split('&')[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (finalUrl.includes('youtu.be/')) {
      const videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (finalUrl.includes('google.com') && !finalUrl.includes('igu=1')) {
      finalUrl = finalUrl + (finalUrl.includes('?') ? '&' : '?') + 'igu=1';
    }
    
    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    newHistory.push(finalUrl);
    
    updateActiveTab({
      url: finalUrl,
      inputUrl: finalUrl,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      title: finalUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] || 'Page'
    });

    setGlobalHistory(prev => [finalUrl, ...prev.filter(h => h !== finalUrl)].slice(0, 20));
    setShowHistory(false);
  };

  const addTab = (url: string = 'https://www.google.com/search?igu=1') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab: BrowserTab = {
      id: newId,
      url: url,
      inputUrl: url === 'about:blank' ? '' : url,
      history: [url],
      historyIndex: 0,
      title: url === 'about:blank' ? 'New Tab' : 'Page'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      updateActiveTab({ url: 'about:blank', inputUrl: '', history: ['about:blank'], historyIndex: 0, title: 'New Tab' });
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      updateActiveTab({
        historyIndex: newIndex,
        url: activeTab.history[newIndex],
        inputUrl: activeTab.history[newIndex]
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      updateActiveTab({
        historyIndex: newIndex,
        url: activeTab.history[newIndex],
        inputUrl: activeTab.history[newIndex]
      });
    }
  };

  const toggleBookmark = () => {
    const existing = bookmarks.find(b => b.url === activeTab.url);
    if (existing) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    } else if (activeTab.url !== 'about:blank') {
      setBookmarks(prev => [...prev, { name: activeTab.title, url: activeTab.url }]);
    }
  };

  const handleSumbit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(activeTab.inputUrl);
  };

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] select-text">
      {/* Tab Bar */}
      <div className="h-10 bg-[#1e1e1e] flex items-center px-2 gap-1 overflow-x-auto scrollbar-hide border-b border-white/5">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center gap-2 px-3 h-8 mt-2 rounded-t-lg text-[10px] cursor-pointer transition-all min-w-[120px] max-w-[200px] border-x border-t ${
                activeTabId === tab.id ? 'bg-[#2d2d2d] text-white border-white/10' : 'text-white/40 hover:bg-white/5 border-transparent'
              }`}
            >
              <Globe size={10} className={activeTabId === tab.id ? 'text-accent' : ''} />
              <span className="flex-1 truncate font-medium">{tab.title}</span>
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={() => addTab('about:blank')}
          className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors ml-1"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-[#2d2d2d] border-b border-white/10 flex items-center gap-3 px-3 shadow-lg z-30">
        <div className="flex items-center gap-1">
          <button onClick={goBack} disabled={activeTab.historyIndex === 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 text-white/70 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <button onClick={goForward} disabled={activeTab.historyIndex === activeTab.history.length - 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 text-white/70 transition-colors">
            <ArrowRight size={16} />
          </button>
          <button onClick={() => updateActiveTab({ url: activeTab.url })} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors" title="Reload Node">
            <RotateCw size={16} />
          </button>
          <button onClick={() => setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, url: 'https://www.google.com/search?igu=1', inputUrl: ''} : t))} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors" title="Terminal Core">
            <Home size={16} />
          </button>
          <button 
            onClick={() => {
              // Force Proxy Mode for active tab troubleshooting
              window.dispatchEvent(new CustomEvent('ge-browser-force-proxy', { detail: { tabId: activeTab.id } }));
            }} 
            className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors" 
            title="Toggle Tunneling"
          >
            <Shield size={16} />
          </button>
        </div>

        <div className="flex-1 relative flex items-center">
          <div className="absolute left-3 text-white/20 pointer-events-none">
            {activeTab.url.startsWith('https') ? <Shield size={12} className="text-accent" /> : <Info size={12} />}
          </div>
          <form onSubmit={handleSumbit} className="w-full">
            <input 
              type="text" 
              value={activeTab.inputUrl}
              onChange={(e) => updateActiveTab({ inputUrl: e.target.value })}
              onFocus={() => setShowHistory(true)}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-10 py-1.5 text-[11px] text-white/90 outline-none focus:border-accent/40 focus:bg-black/60 transition-all font-mono"
              placeholder="Search Google or enter a technical address"
            />
          </form>
          <button 
            onClick={toggleBookmark}
            className={`absolute right-3 transition-colors ${isBookmarked ? 'text-accent' : 'text-white/20 hover:text-white/50'}`}
          >
            <Heart size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#252525] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
              >
                <div className="p-3 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Recent Node Points</span>
                  <button onClick={() => setShowHistory(false)} className="text-[8px] text-white/30 hover:text-white">ESC</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {globalHistory.length > 0 ? globalHistory.map((h, i) => (
                    <div 
                      key={i}
                      onClick={() => navigate(h)}
                      className="px-4 py-3 text-[10px] text-white/70 hover:bg-accent/10 border-l-2 border-transparent hover:border-accent cursor-pointer flex items-center gap-3 group transition-all"
                    >
                      <History size={12} className="text-white/20 group-hover:text-accent" />
                      <span className="truncate flex-1 font-mono">{h}</span>
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-30" />
                    </div>
                  )) : (
                    <div className="p-8 text-center text-[10px] text-white/20 italic">No history nodes logged.</div>
                  )}
                </div>
                <div 
                  onClick={() => { setGlobalHistory([]); setShowHistory(false); }}
                  className="p-3 text-center text-[8px] text-white/30 hover:text-error cursor-pointer bg-black/20 hover:bg-error/5 transition-colors font-bold uppercase tracking-widest"
                >
                  Clear Telemetry History
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open(activeTab.url === 'about:blank' ? 'https://google.com' : activeTab.url, '_blank')}
            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            title="External Uplink"
          >
            <ExternalLink size={16} />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />
          
          <div className="flex items-center gap-3 px-3 py-1.5 bg-black/30 rounded-full border border-white/5 group relative cursor-help">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-bold text-accent uppercase tracking-tighter leading-none">Status</span>
              <span className="text-[8px] font-black text-white/70 uppercase leading-none">Encrypted</span>
            </div>
            <Shield size={12} className="text-accent animate-pulse" />
            
            <div className="absolute top-full right-0 mt-3 w-64 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[60] scale-95 group-hover:scale-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Shield size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">GE-Lunweb Engine v2.0</p>
                  <p className="text-[8px] text-accent font-black">ACTIVE PROTECTION</p>
                </div>
              </div>
              <p className="text-[9px] text-white/50 leading-relaxed mb-4">
                Using Multi-Vector rendering (Object + IFrame + Proxy) to bypass modern web barriers. If a node fails to render, use <span className="text-white">External Uplink</span>.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white/5 rounded border border-white/5">
                  <p className="text-[7px] text-white/30 uppercase mb-1">Encapsulation</p>
                  <p className="text-[10px] font-mono text-accent">L4 BOLT</p>
                </div>
                <div className="p-2 bg-white/5 rounded border border-white/5">
                  <p className="text-[7px] text-white/30 uppercase mb-1">Proxy Tunnel</p>
                  <p className="text-[10px] font-mono text-accent">V-AES-256</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-8 bg-[#252525] border-b border-white/5 flex items-center px-4 gap-4 overflow-x-auto scrollbar-hide">
        <label className="text-[8px] text-white/20 uppercase font-black tracking-widest shrink-0">Bookmarks:</label>
        <div className="flex items-center gap-3">
          {bookmarks.map((b, i) => (
            <button 
              key={i}
              onClick={() => navigate(b.url)}
              className="flex items-center gap-1.5 group shrink-0"
            >
              <Globe size={10} className="text-white/20 group-hover:text-accent transition-colors" />
              <span className="text-[9px] text-white/50 group-hover:text-white transition-colors">{b.name}</span>
            </button>
          ))}
          <button 
            onClick={toggleBookmark}
            className="p-1 text-white/10 hover:text-accent transition-colors"
          >
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white relative overflow-hidden" onClick={() => setShowHistory(false)}>
        {activeTab.url === 'about:blank' ? (
          <div className="h-full w-full bg-[#0c0c0c] flex flex-col items-center justify-center p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl w-full"
            >
              <div className="flex flex-col items-center mb-16">
                <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-black shadow-[0_0_40px_rgba(63,185,80,0.2)] mb-6">
                  <Globe size={48} />
                </div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">GE-Lunweb Explorer</h1>
                <p className="text-accent font-bold text-[10px] tracking-[0.4em] uppercase mt-1">Terminal-Grade Navigation</p>
              </div>

              <div className="max-w-2xl mx-auto w-full mb-16">
                <form onSubmit={handleSumbit} className="relative group">
                  <input 
                    type="text"
                    value={activeTab.inputUrl}
                    onChange={(e) => updateActiveTab({ inputUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 text-lg text-white outline-none focus:border-accent/40 focus:bg-white/10 transition-all font-sans"
                    placeholder="Search the node web..."
                    autoFocus
                  />
                  <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent text-black font-black uppercase text-xs rounded-xl shadow-lg">ENTER</button>
                </form>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Terminal', icon: <Terminal size={24} />, url: 'https://github.com/richardbakro/ge-linux', desc: 'Core Repository' },
                  { name: 'Intelligence', icon: <Cpu size={24} />, url: 'https://ais-dev-wtwrxnuhrgs52exqksw5xq-582718103733.us-east1.run.app', desc: 'Ge-Cloud Lab' },
                  { name: 'Forensics', icon: <Activity size={24} />, url: 'https://www.google.com/search?q=kernel+panic+help&igu=1', desc: 'System Rescue' },
                  { name: 'Archive', icon: <Folder size={24} />, url: 'https://archive.org', desc: 'Digital Legacy' }
                ].map((site, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => navigate(site.url)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer group transition-all"
                  >
                    <div className="text-accent mb-4 group-hover:scale-110 transition-transform">{site.icon}</div>
                    <div className="font-bold text-sm text-white mb-1 uppercase tracking-wider">{site.name}</div>
                    <div className="text-[10px] text-white/40 uppercase font-bold">{site.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <BrowserViewport url={activeTab.url} tabId={activeTab.id} />
            
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none z-50">
              <div className="p-2 bg-black/80 rounded-lg text-[9px] text-white/50 backdrop-blur-md border border-white/10 font-mono shadow-2xl">
                GE-OVR: {new URL(activeTab.url).hostname}<br/>
                <span className="text-accent font-bold">STATUS: STREAMING</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-6 bg-[#1a1a1a] border-t border-white/5 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[8px] text-accent font-bold uppercase tracking-widest">Protocol Secured</span>
          </div>
          <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px] text-white/20 font-mono uppercase">Nodes Active: {tabs.length}</span>
          <span className="text-[8px] text-accent font-black uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded leading-none">
            ENGINE: {activeTab.url === 'about:blank' ? 'NULL' : 'DYNAMIC'}
          </span>
          <span className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em] italic">GE-LUNWEB ENGINE 2.0</span>
        </div>
      </div>
    </div>
  );
}


function StressTestApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState(5000);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frames = 0;

    const particles: { x: number, y: number, vx: number, vy: number, color: string }[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
      }
    };

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        initParticles();
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (time: number) => {
      frames++;
      if (time - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = time;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [particleCount]);

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="text-accent font-black italic text-4xl tracking-tighter drop-shadow-2xl">
          GE-LINUX STRESS ENGINE
        </div>
        <div className="flex gap-4">
          <div className="px-3 py-1 bg-black/50 border border-accent/30 rounded backdrop-blur">
            <span className="text-[10px] text-accent/50 uppercase font-bold tracking-widest">Active Entities</span>
            <div className="text-xl font-mono text-white">{particleCount.toLocaleString()}</div>
          </div>
          <div className="px-3 py-1 bg-black/50 border border-accent/30 rounded backdrop-blur">
            <span className="text-[10px] text-accent/50 uppercase font-bold tracking-widest">Performance</span>
            <div className="text-xl font-mono text-white">{fps} FPS</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="text-[8px] text-white/20 uppercase font-black tracking-[0.5em] mb-2">Adjust Particle Density</div>
        <div className="flex gap-1">
          {[1000, 5000, 10000, 20000, 50000].map(n => (
            <button 
              key={n}
              onClick={() => setParticleCount(n)}
              className={`px-3 py-1 text-[10px] font-bold uppercase transition-all rounded ${particleCount === n ? 'bg-accent text-black scale-110 shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {n / 1000}K
            </button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="flex-1 cursor-crosshair" />
    </div>
  );
}

function MessengerApp() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'KernelBot', text: 'Welcome to GE-Messenger Protocol.', time: 'System', type: 'system' },
    { id: 2, user: 'Bakro_X', text: 'Hey, have you tried the new stress test?', time: '14:20', type: 'received' },
    { id: 3, user: 'Bakro_X', text: 'It pushes the limits of the web-based kernel.', time: '14:21', type: 'received' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: 'You',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'sent'
    };

    setMessages([...messages, newMsg]);
    setInput('');

    // Simulated reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        user: 'Bakro_X',
        text: 'The distribution is holding firm. Ge-Linux v2.0 is solid.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'received'
      }]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#111] overflow-hidden">
      <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <User size={16} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">Bakro_X</div>
          <div className="text-[8px] text-accent uppercase font-black tracking-widest mt-1">Uplink Stable</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.type === 'sent' ? 'items-end' : m.type === 'system' ? 'items-center' : 'items-start'}`}>
            {m.type === 'system' ? (
              <div className="px-3 py-1 bg-white/5 text-[8px] text-white/30 uppercase font-black tracking-[0.2em] rounded">
                {m.text}
              </div>
            ) : (
              <div className="max-w-[80%] space-y-1">
                <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${m.type === 'sent' ? 'bg-accent text-black font-medium' : 'bg-white/5 text-white/80 border border-white/5'}`}>
                  {m.text}
                </div>
                <div className="text-[8px] text-white/20 uppercase font-bold px-1">{m.time}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Transmit signal..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-white outline-none focus:border-accent/40 transition-all"
        />
        <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-accent/20">
          <ChevronRight size={20} />
        </button>
      </form>
    </div>
  );
}

function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedItems, setCapturedItems] = useState<{type: 'image' | 'video', url: string, name: string}[]>([]);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        setError('Hardware access denied or camera not found.');
      }
    }

    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/png');
    setCapturedItems(prev => [{type: 'image', url, name: `IMG_${Date.now()}.png`}, ...prev]);
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!stream) return;
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setCapturedItems(prev => [{type: 'video', url, name: `VID_${Date.now()}.webm`}, ...prev]);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden group font-mono">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-3xl flex items-center justify-center text-error mb-6 border border-error/20">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Access Denied</h2>
          <p className="text-xs text-white/40 max-w-xs">{error}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          
          {/* Viewfinder Overlays */}
          <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
             <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-error animate-pulse' : 'bg-white/20'}`} />
                  <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">{isRecording ? 'Recording' : 'Standby'}</span>
                </div>
             </div>
          </div>

          {/* Gallery Sidebar */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 max-h-[60%] overflow-y-auto no-scrollbar py-2">
            {capturedItems.map((item, idx) => (
              <a 
                key={idx} 
                href={item.url} 
                download={item.name}
                className="w-10 h-10 rounded border border-white/20 overflow-hidden bg-black/50 hover:scale-110 transition-transform flex items-center justify-center"
              >
                {item.type === 'image' ? (
                   <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                   <Download size={14} className="text-white/40" />
                )}
              </a>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
            <button 
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center transition-all ${isRecording ? 'bg-error/20 border-error scale-110' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <div className={`transition-all ${isRecording ? 'w-4 h-4 rounded-sm bg-error' : 'w-4 h-4 rounded-full bg-white/40'}`} />
            </button>

            <button 
              onClick={takePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group-hover:scale-110 transition-transform active:scale-95 bg-white/20 relative"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
                <Camera size={20} className="text-black" />
              </div>
            </button>

            <div className="w-12 h-12 flex items-center justify-center">
              <Download size={20} className="text-white/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rect' | 'circle'>('pencil');
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initial white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      if (tool === 'rect') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (confirm('Clear the canvas? Current progress will be lost.')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `GE_PAINT_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', 
    '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3',
    '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
  ];

  return (
    <div className="h-full bg-[#2a2a2a] flex flex-col font-mono text-white select-none">
      <div className="bg-[#1e1e1e] border-b border-white/10 p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 rounded-lg p-1 gap-1">
            <button onClick={() => setTool('pencil')} className={`p-2 rounded ${tool === 'pencil' ? 'bg-accent text-black' : 'hover:bg-white/5 text-white/40'}`} title="Pencil"><Pencil size={14} /></button>
            <button onClick={() => setTool('eraser')} className={`p-2 rounded ${tool === 'eraser' ? 'bg-accent text-black' : 'hover:bg-white/5 text-white/40'}`} title="Eraser"><Eraser size={14} /></button>
            <button onClick={() => setTool('rect')} className={`p-2 rounded ${tool === 'rect' ? 'bg-accent text-black' : 'hover:bg-white/5 text-white/40'}`} title="Rectangle"><Square size={14} /></button>
            <button onClick={() => setTool('circle')} className={`p-2 rounded ${tool === 'circle' ? 'bg-accent text-black' : 'hover:bg-white/5 text-white/40'}`} title="Circle"><Circle size={14} /></button>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <input 
              type="range" min="1" max="50" value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))} 
              className="w-24 accent-accent"
            />
            <span className="text-[10px] w-6 opacity-50">{brushSize}px</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="p-2 hover:bg-error/20 text-error rounded transition-colors" title="Clear Canvas"><Trash2 size={16} /></button>
          <button onClick={downloadImage} className="p-2 hover:bg-accent/20 text-accent rounded transition-colors" title="Save Image"><Download size={16} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-12 bg-[#1e1e1e] border-r border-white/10 p-2 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {colors.map(c => (
            <button 
              key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-sm border-2 ${color === c ? 'border-accent scale-110 shadow-lg shadow-accent/20' : 'border-black/20 hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input 
            type="color" value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="w-8 h-8 rounded-sm bg-transparent border-2 border-white/10 p-0 cursor-pointer" 
          />
        </div>
        <div className="flex-1 bg-[#333] p-4 flex items-center justify-center overflow-auto custom-scrollbar">
          <canvas 
            ref={canvasRef} 
            width={1000} height={700} 
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white shadow-2xl cursor-crosshair"
          />
        </div>
      </div>

      <div className="bg-[#1e1e1e] border-t border-white/10 px-4 py-1 flex justify-between">
         <div className="text-[8px] text-white/20 uppercase font-black tracking-widest leading-loose">Ge-Engine Canvas Controller v1.0</div>
         <div className="text-[8px] text-white/40 uppercase font-black">1000 x 700 PX</div>
      </div>
    </div>
  );
}

function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleInput = (val: string) => {
    if (display === '0' && val !== '.') setDisplay(val);
    else setDisplay(prev => prev + val);
  };

  const calculate = () => {
    try {
      // Basic safety check for eval
      const result = eval(display.replace(/[^0-9+\-*/.]/g, ''));
      setExpression(display + ' =');
      setDisplay(String(result));
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] p-4 gap-4">
      <div className="flex-1 flex flex-col justify-end p-4 bg-black/40 rounded-xl border border-white/5 text-right font-mono">
        <div className="text-[10px] text-white/20 uppercase font-black h-4">{expression}</div>
        <div className="text-4xl font-bold text-white truncate drop-shadow-glow">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={clear} className="col-span-2 p-4 bg-white/5 hover:bg-white/10 text-accent font-black text-xs rounded-xl uppercase tracking-widest transition-all">Clear</button>
        <button onClick={() => handleInput('/')} className="p-4 bg-white/5 hover:bg-accent/20 text-accent rounded-xl text-lg transition-all">/</button>
        <button onClick={() => handleInput('*')} className="p-4 bg-white/5 hover:bg-accent/20 text-accent rounded-xl text-lg transition-all">*</button>
        
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => (
          <button key={n} onClick={() => handleInput(String(n))} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-bold transition-all">{n}</button>
        ))}
        
        <button onClick={() => handleInput('-')} className="p-4 bg-white/5 hover:bg-accent/20 text-accent rounded-xl text-lg transition-all">-</button>
        <button onClick={() => handleInput('0')} className="col-span-2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-bold transition-all">0</button>
        <button onClick={() => handleInput('.')} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-lg font-bold transition-all">.</button>
        <button onClick={() => handleInput('+')} className="p-4 bg-white/5 hover:bg-accent/20 text-accent rounded-xl text-lg transition-all">+</button>
        
        <button onClick={calculate} className="col-span-4 p-4 bg-accent text-black font-black text-xs rounded-xl uppercase tracking-[0.3em] shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all">Execute Calculation</button>
      </div>
    </div>
  );
}

function KernelInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let shipX = canvas.width / 2;
    const bullets: { x: number, y: number }[] = [];
    const bugs: { x: number, y: number, type: string }[] = [];
    let frame = 0;
    let animationId: number;

    const keys: Record<string, boolean> = {};
    (window as any)._invaderKeys = keys;
    const handleKeyDown = (e: KeyboardEvent) => keys[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      if (keys['ArrowLeft']) shipX -= 5;
      if (keys['ArrowRight']) shipX += 5;
      shipX = Math.max(20, Math.min(canvas.width - 20, shipX));

      if (frame % 10 === 0 && keys[' ']) bullets.push({ x: shipX, y: canvas.height - 40 });
      if (frame % 40 === 0) bugs.push({ x: Math.random() * (canvas.width - 40) + 20, y: -20, type: ['NullPointer', 'SegFault', 'Leak'][Math.floor(Math.random() * 3)] });

      bullets.forEach((b, i) => {
        b.y -= 7;
        if (b.y < 0) bullets.splice(i, 1);
      });

      bugs.forEach((b, i) => {
        b.y += 2 + (score / 1000);
        if (b.y > canvas.height) setGameState('gameover');
        
        bullets.forEach((bullet, bi) => {
          if (Math.abs(bullet.x - b.x) < 20 && Math.abs(bullet.y - b.y) < 20) {
            bugs.splice(i, 1);
            bullets.splice(bi, 1);
            setScore(s => s + 100);
          }
        });
      });

      frame++;
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ship
      ctx.fillStyle = '#3fb950';
      ctx.beginPath();
      ctx.moveTo(shipX, canvas.height - 40);
      ctx.lineTo(shipX - 15, canvas.height - 10);
      ctx.lineTo(shipX + 15, canvas.height - 10);
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#fff';
      bullets.forEach(b => ctx.fillRect(b.x - 1, b.y, 2, 10));

      // Bugs
      bugs.forEach(b => {
        ctx.fillStyle = '#f85149';
        ctx.font = '10px monospace';
        ctx.fillText(b.type, b.x - 20, b.y);
        ctx.fillRect(b.x - 10, b.y + 5, 20, 10);
      });
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, score]);

  return (
    <div className="h-full bg-black flex flex-col font-mono text-accent p-4">
      <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest">Score: {score}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest">Kernel Shield: Active</div>
      </div>
      <div className="flex-1 relative border border-white/5 bg-black">
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-center p-8">
            <h2 className="text-2xl font-black italic mb-4 uppercase tracking-tighter">Kernel Invaders</h2>
            <p className="text-[10px] text-white/50 mb-8 uppercase leading-relaxed max-w-xs">Defend the Ge-Linux kernel from incoming logic bugs. Use arrows to move and space to patch.</p>
            <button onClick={() => setGameState('playing')} className="px-6 py-2 bg-accent text-black font-black uppercase text-xs tracking-widest rounded-full shadow-lg shadow-accent/20">Init Service</button>
          </div>
        )}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-error/20 backdrop-blur-sm z-10 text-center p-8">
            <h2 className="text-4xl font-black italic mb-2 uppercase text-error tracking-tighter">System Panic</h2>
            <p className="text-sm text-white/70 mb-8 font-bold uppercase tracking-widest">Final Score: {score}</p>
            <button onClick={() => { setGameState('playing'); setScore(0); }} className="px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full shadow-xl">Reboot Engine</button>
          </div>
        )}
        <canvas ref={canvasRef} width={560} height={400} className="w-full h-full" />
      </div>

      {/* Mobile Controls */}
      {gameState === 'playing' && (
        <div className="mt-4 flex justify-between items-center px-4 mb-2">
          <div className="flex gap-2">
            <button 
              onMouseDown={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowLeft'] = true; }}
              onMouseUp={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowLeft'] = false; }}
              onTouchStart={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowLeft'] = true; }}
              onTouchEnd={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowLeft'] = false; }}
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onMouseDown={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowRight'] = true; }}
              onMouseUp={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowRight'] = false; }}
              onTouchStart={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowRight'] = true; }}
              onTouchEnd={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys['ArrowRight'] = false; }}
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <button 
            onMouseDown={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys[' '] = true; }}
            onMouseUp={() => { if((window as any)._invaderKeys) (window as any)._invaderKeys[' '] = false; }}
            onTouchStart={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys[' '] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); if((window as any)._invaderKeys) (window as any)._invaderKeys[' '] = false; }}
            className="px-8 h-12 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center text-accent font-black uppercase text-xs tracking-widest active:bg-accent active:text-black transition-all"
          >
            FIRE
          </button>
        </div>
      )}
    </div>
  );
}

function MinesweeperGame() {
  const SIZE = 10;
  const MINES = 15;
  const [grid, setGrid] = useState<{v: number, revealed: boolean, flagged: boolean}[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const init = () => {
    const newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null).map(() => ({ v: 0, revealed: false, flagged: false })));
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (newGrid[r][c].v !== -1) {
        newGrid[r][c].v = -1;
        minesPlaced++;
      }
    }
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (newGrid[r][c].v === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (r + dr >= 0 && r + dr < SIZE && c + dc >= 0 && c + dc < SIZE && newGrid[r + dr][c + dc].v === -1) count++;
          }
        }
        newGrid[r][c].v = count;
      }
    }
    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => init(), []);

  const reveal = (r: number, c: number) => {
    if (gameOver || won || grid[r][c].revealed || grid[r][c].flagged) return;
    const newGrid = [...grid.map(row => [...row])];
    if (newGrid[r][c].v === -1) {
      setGameOver(true);
      return;
    }

    const revealEmpty = (row: number, col: number) => {
      if (row < 0 || row >= SIZE || col < 0 || col >= SIZE || newGrid[row][col].revealed) return;
      newGrid[row][col].revealed = true;
      if (newGrid[row][col].v === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) revealEmpty(row + dr, col + dc);
        }
      }
    };
    revealEmpty(r, c);
    setGrid(newGrid);
    // Check win
    if (newGrid.flat().filter(cell => !cell.revealed && cell.v !== -1).length === 0) setWon(true);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || grid[r][c].revealed) return;
    const newGrid = [...grid.map(row => [...row])];
    newGrid[r][c].flagged = !newGrid[r][c].flagged;
    setGrid(newGrid);
  };

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col p-4 select-none">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-[10px] font-black text-accent uppercase tracking-widest">System Scan</div>
        <button onClick={init} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RotateCw size={14} className={gameOver ? 'text-error' : won ? 'text-accent' : 'text-white/40'} />
        </button>
      </div>
      <div className="flex-1 grid grid-cols-10 gap-1 bg-black/20 p-2 rounded-xl border border-white/5">
        {grid.map((row, r) => row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            onClick={() => reveal(r, c)}
            onContextMenu={(e) => toggleFlag(e, r, c)}
            className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
              cell.revealed 
                ? 'bg-white/5 text-white/80' 
                : 'bg-white/10 hover:bg-white/20 shadow-lg active:scale-95'
            } ${gameOver && cell.v === -1 ? 'bg-error/30 text-error' : ''}`}
          >
            {cell.revealed ? (cell.v === -1 ? 'X' : cell.v || '') : (cell.flagged ? '!' : '')}
          </div>
        )))}
      </div>
      {gameOver && <div className="mt-4 text-[10px] text-error font-black uppercase text-center tracking-[0.3em] animate-pulse">Exploited</div>}
      {won && <div className="mt-4 text-[10px] text-accent font-black uppercase text-center tracking-[0.3em] animate-pulse">Secured</div>}
    </div>
  );
}

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [nextDir, setNextDir] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('ge-snake-high') || 0));

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('ge-snake-high', String(score));
    }
  }, [score, highScore]);

  useEffect(() => {
    if (gameOver) return;
    const move = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + nextDir.x, y: prev[0].y + nextDir.y };
        setDir(nextDir);
        
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 120);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir.y === 0) setNextDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dir.y === 0) setNextDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dir.x === 0) setNextDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dir.x === 0) setNextDir({ x: 1, y: 0 });
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      clearInterval(move);
      window.removeEventListener('keydown', handleKey);
    };
  }, [dir, nextDir, food, gameOver]);

  return (
    <div className="h-full bg-[#111] flex flex-col p-4 font-mono">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">Score: {score}</div>
          <div className="text-[8px] text-white/30 uppercase mt-1">BEST: {highScore}</div>
        </div>
        {gameOver && <button onClick={() => { setSnake([{x:10,y:10}]); setGameOver(false); setScore(0); setDir({x:0,y:-1}); setNextDir({x:0,y:-1}); }} className="px-3 py-1 bg-white text-black text-[10px] uppercase font-black italic rounded hover:scale-105 transition-transform">Reboot Cyberspace</button>}
      </div>
      <div className="flex-1 bg-black rounded-xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
          {Array(400).fill(0).map((_, i) => {
            const x = i % 20;
            const y = Math.floor(i / 20);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;
            return (
              <div key={i} className={`w-full h-full border-[0.5px] border-white/5 ${isSnake ? (isHead ? 'bg-accent scale-110 z-10' : 'bg-accent/60 scale-90') : isFood ? 'bg-error animate-pulse rounded-full scale-50 shadow-[0_0_10px_rgba(248,81,73,0.5)]' : ''} transition-all duration-150`} />
            );
          })}
        </div>
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
            <h2 className="text-2xl font-black text-error italic uppercase mb-2 tracking-tighter">Protocol Failed</h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Memory leak detected. System frozen.</p>
          </div>
        )}
      </div>

      {/* Snake D-Pad */}
      {!gameOver && (
        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button 
              onMouseDown={() => { if(dir.y === 0) setNextDir({ x: 0, y: -1 }); }}
              onTouchStart={(e) => { e.preventDefault(); if(dir.y === 0) setNextDir({ x: 0, y: -1 }); }}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all shadow-lg"
            >
              <ChevronUp size={24} />
            </button>
            <div />
            
            <button 
              onMouseDown={() => { if(dir.x === 0) setNextDir({ x: -1, y: 0 }); }}
              onTouchStart={(e) => { e.preventDefault(); if(dir.x === 0) setNextDir({ x: -1, y: 0 }); }}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onMouseDown={() => { if(dir.y === 0) setNextDir({ x: 0, y: 1 }); }}
              onTouchStart={(e) => { e.preventDefault(); if(dir.y === 0) setNextDir({ x: 0, y: 1 }); }}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all shadow-lg"
            >
              <ChevronDown size={24} />
            </button>
            <button 
              onMouseDown={() => { if(dir.x === 0) setNextDir({ x: 1, y: 0 }); }}
              onTouchStart={(e) => { e.preventDefault(); if(dir.x === 0) setNextDir({ x: 1, y: 0 }); }}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white active:bg-accent active:text-black transition-all shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isProcessing = useRef(false);
  const togglePlay = async () => {
    if (videoRef.current && !isProcessing.current) {
      isProcessing.current = true;
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error("Playback error:", err);
        }
      } finally {
        isProcessing.current = false;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      setError(null);
      videoRef.current.load();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        const p = (video.currentTime / video.duration) * 100;
        setProgress(p);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
      }
    };

    const handleError = () => {
      const error = video.error;
      let message = 'An unknown error occurred.';
      if (error) {
        switch (error.code) {
          case 1: message = 'The fetching process aborted by user.'; break;
          case 2: message = 'A network error occurred.'; break;
          case 3: message = 'The video decoding failed.'; break;
          case 4: message = 'The video format is not supported.'; break;
        }
      }
      setError(message);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex-1 relative group">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 z-10">
            <X size={48} className="text-error mb-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-error mb-2">Playback Error</h3>
            <p className="text-[10px] text-white/50 max-w-xs">{error}</p>
            <button 
              onClick={() => { setError(null); videoRef.current?.load(); }}
              className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Retry
            </button>
          </div>
        ) : null}
        <video 
          key={src}
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={togglePlay} className="p-4 bg-black/50 rounded-full text-accent">
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </button>
        </div>
      </div>
      <div className="h-12 bg-[#1a1a1a] border-t border-white/10 flex flex-col">
        <div className="h-1 w-full bg-white/10 relative">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-white/70">
            <SkipBack size={16} className="cursor-pointer hover:text-accent" />
            <button onClick={togglePlay}>
              {isPlaying ? <Pause size={18} className="text-accent" /> : <Play size={18} className="text-accent" />}
            </button>
            <SkipForward size={16} className="cursor-pointer hover:text-accent" />
            <Volume2 size={16} className="cursor-pointer hover:text-accent" />
          </div>
          <div className="text-[10px] font-mono text-white/50">
            {formatTime(currentTime)} / {formatTime(duration)} ({formatTime(duration - currentTime)} left)
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/10 cursor-pointer group w-20"
    >
      <div className="text-accent group-hover:drop-shadow-[0_0_8px_rgba(63,185,80,0.6)] transition-all">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-white/80 text-center uppercase tracking-wider drop-shadow-md">{label}</span>
    </motion.div>
  );
}

function Window({ win, children, onClose, onMinimize, onMaximize, onFocus }: React.PropsWithChildren<{ win: WindowState, onClose: () => void, onMinimize: () => void, onMaximize: () => void, onFocus: () => void }>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: win.isMaximized ? '100%' : win.width,
        height: win.isMaximized ? '100%' : win.height,
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        borderRadius: win.isMaximized ? 0 : 8
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      drag={!win.isMaximized}
      dragMomentum={false}
      onMouseDown={onFocus}
      style={{ 
        zIndex: win.zIndex,
      }}
      className={`absolute glass overflow-hidden flex flex-col window-shadow ${win.isMaximized ? '' : 'rounded-lg'}`}
    >
      {/* Window Header */}
      <div className="h-9 bg-white/5 border-b border-white/10 flex items-center justify-between px-3 cursor-move">
        <div className="flex items-center gap-2">
          <span className="text-accent">{win.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/50"><Minimize2 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/50"><Maximize2 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 hover:bg-error/20 rounded transition-colors text-error/70"><X size={14} /></button>
        </div>
      </div>
      {/* Window Content */}
      <div className="flex-1 overflow-auto bg-black/20">
        {children}
      </div>
    </motion.div>
  );
}
