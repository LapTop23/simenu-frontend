// lib/socket.js
'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Module-level singleton: every component that calls getSocket() shares the
// SAME connection, rather than each mounting its own socket. This is what
// makes "clean up listeners on unmount, but don't kill the connection out
// from under a sibling component" possible — components add/remove their own
// `.on`/`.off` handlers on this shared instance without ever calling
// `.disconnect()` themselves.
let socket;

/**
 * getSocket — lazily creates (once) and returns the shared Socket.IO client.
 * Safe to call from multiple components; only the first call actually opens
 * a connection.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => console.log(`[Socket] connected: ${socket.id}`));
    socket.on('disconnect', (reason) => console.log(`[Socket] disconnected: ${reason}`));
    socket.on('connect_error', (err) => console.warn(`[Socket] connection error: ${err.message}`));
  }
  return socket;
}
