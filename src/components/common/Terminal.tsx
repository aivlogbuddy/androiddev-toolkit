import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalProps {
  sessionId?: string;
  onData?: (data: string) => void;
  onReady?: (terminal: XTerm) => void;
}

const Terminal: React.FC<TerminalProps> = ({ sessionId, onData, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize xterm with dark theme (VS Code dark+)
    const terminal = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        selectionForeground: '#d4d4d4',
        black: '#000000',
        brightBlack: '#666666',
        red: '#cd3131',
        brightRed: '#f14c4c',
        green: '#0dbc79',
        brightGreen: '#23d18b',
        yellow: '#e5e510',
        brightYellow: '#f5f543',
        blue: '#2472c8',
        brightBlue: '#3b8eea',
        magenta: '#bc3fbc',
        brightMagenta: '#d670d6',
        cyan: '#11a8cd',
        brightCyan: '#29b8e5',
        white: '#e5e5e5',
        brightWhite: '#ffffff',
      },
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 10000,
    });

    // Add FitAddon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Add WebLinksAddon
    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(webLinksAddon);

    // Open terminal in container
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle data input
    if (onData) {
      terminal.onData(onData);
    }

    // Call onReady callback
    if (onReady) {
      onReady(terminal);
    }

    // Handle resize with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [sessionId, onData, onReady]);

  // Handle terminal data from parent
  const handleData = useCallback((data: string) => {
    if (terminalRef.current && onData) {
      terminalRef.current.write(data);
    }
  }, [onData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#1e1e1e] overflow-hidden"
    />
  );
};

export default Terminal;