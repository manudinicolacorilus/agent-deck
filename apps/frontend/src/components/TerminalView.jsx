import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

const THEME = {
  background: '#0d1117',
  foreground: '#e6edf3',
  cursor: '#58a6ff',
};

export default function TerminalView({ sessionId, style }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !sessionId) return;

    let disposed = false;
    let sessionExited = false;
    let ws = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;

    // --- Terminal setup ---
    const terminal = new Terminal({
      theme: THEME,
      fontFamily: 'Cascadia Code, Consolas, monospace',
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(el);

    // Defer fit + WebGL to next frame so the DOM has layout dimensions
    requestAnimationFrame(() => {
      if (disposed) return;
      try {
        fitAddon.fit();
      } catch { /* not visible yet */ }

      // Try WebGL addon after terminal has rendered
      try {
        import('@xterm/addon-webgl').then(({ WebglAddon }) => {
          if (disposed) return;
          try {
            const webgl = new WebglAddon();
            webgl.onContextLoss(() => webgl.dispose());
            terminal.loadAddon(webgl);
          } catch { /* fall back to canvas */ }
        }).catch(() => { /* module not available */ });
      } catch { /* dynamic import not supported */ }
    });

    // --- helpers ---
    function send(msg) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    }

    // --- User input ---
    const onDataDisposable = terminal.onData((data) => {
      send({ type: 'input', data });
    });

    // --- WebSocket ---
    function connectWs() {
      if (disposed) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws?sessionId=${encodeURIComponent(sessionId)}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        reconnectAttempts = 0;
        send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'output':
              terminal.write(msg.data);
              break;
            case 'session:exit':
              sessionExited = true;
              terminal.write(
                `\r\n\x1b[33m[Session exited${msg.exitCode != null ? ` with code ${msg.exitCode}` : ''}]\x1b[0m\r\n`
              );
              break;
            case 'session_closed':
              terminal.write(
                '\r\n\x1b[90m--- Session closed ---\x1b[0m\r\n'
              );
              if (ws) ws.close();
              disposed = true;
              return;
            case 'error':
              terminal.write(
                `\r\n\x1b[31m[Error: ${msg.message || 'unknown'}]\x1b[0m\r\n`
              );
              break;
          }
        } catch { /* ignore non-JSON */ }
      };

      ws.onclose = () => {
        if (disposed || sessionExited) return;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          terminal.write('\r\n\x1b[31m[Connection lost. Max reconnect attempts reached.]\x1b[0m\r\n');
          return;
        }
        reconnectAttempts++;
        terminal.write(
          `\r\n\x1b[33m[Reconnecting (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...]\x1b[0m\r\n`
        );
        reconnectTimer = setTimeout(connectWs, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => { /* onclose handles reconnect */ };
    }

    connectWs();

    // --- ResizeObserver ---
    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      try {
        fitAddon.fit();
        send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
      } catch { /* ignore */ }
    });
    resizeObserver.observe(el);

    // --- Cleanup ---
    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      resizeObserver.disconnect();
      onDataDisposable.dispose();
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
      terminal.dispose();
    };
  }, [sessionId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 300,
        ...style,
      }}
    />
  );
}
