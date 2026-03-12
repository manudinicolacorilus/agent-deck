import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';

const MSG_INPUT = 'input';
const MSG_OUTPUT = 'output';
const MSG_RESIZE = 'resize';
const MSG_SESSION_EXIT = 'session:exit';
const MSG_ERROR = 'error';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

const THEME = {
  background: '#0d1117',
  foreground: '#e6edf3',
  cursor: '#58a6ff',
};

export default function TerminalView({ sessionId, style }) {
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const disposedRef = useRef(false);
  const resizeObserverRef = useRef(null);

  const sendMessage = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !sessionId) return;

    disposedRef.current = false;

    // --- Terminal setup ---
    const terminal = new Terminal({
      theme: THEME,
      fontFamily: 'Cascadia Code, Consolas, monospace',
      fontSize: 14,
      cursorBlink: true,
    });
    terminalRef.current = terminal;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    terminal.loadAddon(fitAddon);

    terminal.open(containerRef.current);

    // Try WebGL renderer, fall back to canvas
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      terminal.loadAddon(webglAddon);
    } catch {
      // WebGL not available — xterm uses its default canvas renderer
    }

    // Initial fit
    try {
      fitAddon.fit();
    } catch {
      // Container may not be visible yet
    }

    // --- User input handler ---
    const onDataDisposable = terminal.onData((data) => {
      sendMessage({ type: MSG_INPUT, data });
    });

    // --- WebSocket setup ---
    function connectWs() {
      if (disposedRef.current) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws?sessionId=${encodeURIComponent(sessionId)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;

        // Send current terminal size on connect
        if (terminalRef.current) {
          sendMessage({
            type: MSG_RESIZE,
            cols: terminalRef.current.cols,
            rows: terminalRef.current.rows,
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case MSG_OUTPUT:
              terminalRef.current?.write(msg.data);
              break;
            case MSG_SESSION_EXIT:
              terminalRef.current?.write(
                `\r\n\x1b[33m[Session exited${msg.code != null ? ` with code ${msg.code}` : ''}]\x1b[0m\r\n`
              );
              break;
            case MSG_ERROR:
              terminalRef.current?.write(
                `\r\n\x1b[31m[Error: ${msg.data || 'unknown'}]\x1b[0m\r\n`
              );
              break;
            default:
              break;
          }
        } catch {
          // Non-JSON message — ignore
        }
      };

      ws.onclose = () => {
        if (disposedRef.current) return;
        attemptReconnect();
      };

      ws.onerror = () => {
        // onclose will fire after onerror, reconnect handled there
      };
    }

    function attemptReconnect() {
      if (disposedRef.current) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        terminalRef.current?.write(
          '\r\n\x1b[31m[Connection lost. Max reconnect attempts reached.]\x1b[0m\r\n'
        );
        return;
      }
      reconnectAttemptsRef.current += 1;
      terminalRef.current?.write(
        `\r\n\x1b[33m[Reconnecting (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...]\x1b[0m\r\n`
      );
      reconnectTimerRef.current = setTimeout(connectWs, RECONNECT_DELAY_MS);
    }

    connectWs();

    // --- ResizeObserver ---
    const resizeObserver = new ResizeObserver(() => {
      if (disposedRef.current) return;
      try {
        fitAddon.fit();
        if (terminalRef.current) {
          sendMessage({
            type: MSG_RESIZE,
            cols: terminalRef.current.cols,
            rows: terminalRef.current.rows,
          });
        }
      } catch {
        // Ignore resize errors during teardown
      }
    });
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    // --- Cleanup ---
    return () => {
      disposedRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      resizeObserver.disconnect();
      resizeObserverRef.current = null;

      onDataDisposable.dispose();

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, sendMessage]);

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
