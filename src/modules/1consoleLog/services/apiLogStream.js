/**
 * Centralized API Debugging Dashboard
 * Server-Sent Events (SSE) Stream Manager
 *
 * Manages active browser dashboard connections, sends periodic heartbeats,
 * broadcasts real-time API request/response logs, and cleans up disconnected clients.
 */

export class ApiLogStream {
  constructor() {
    this.clients = new Set();
    this.heartbeatInterval = null;
    this.MAX_CLIENTS = 50; // Safeguard against connection leaks
  }

  /**
   * Start periodic heartbeat to keep SSE connections alive
   */
  startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      if (this.clients.size === 0) {
        this.stopHeartbeat();
        return;
      }

      for (const client of this.clients) {
        try {
          client.write(': heartbeat\n\n');
        } catch {
          this.removeClient(client);
        }
      }
    }, 15000);

    // Unref so interval does not block process exit
    if (typeof this.heartbeatInterval.unref === 'function') {
      this.heartbeatInterval.unref();
    }
  }

  /**
   * Stop heartbeat when no clients are connected
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Register a new SSE dashboard client
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  addClient(req, res) {
    if (this.clients.size >= this.MAX_CLIENTS) {
      // Discard oldest client if capacity reached
      const oldest = this.clients.values().next().value;
      if (oldest) {
        this.removeClient(oldest);
      }
    }

    // Set standard SSE streaming headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering (Nginx, Caddy)
      'Access-Control-Allow-Origin': '*',
    });

    res.flushHeaders?.();

    this.clients.add(res);

    // Send initial connected acknowledgement event
    const connectPayload = JSON.stringify({
      status: 'connected',
      timestamp: new Date().toISOString(),
      activeClients: this.clients.size,
    });
    res.write(`event: connected\ndata: ${connectPayload}\n\n`);

    this.startHeartbeat();

    // Clean up when client disconnects
    const cleanup = () => {
      if (typeof req?.removeListener === 'function') {
        req.removeListener('close', cleanup);
      }
      if (typeof res?.removeListener === 'function') {
        res.removeListener('close', cleanup);
        res.removeListener('finish', cleanup);
      }
      this.removeClient(res);
    };

    if (typeof req?.on === 'function') {
      req.on('close', cleanup);
    }
    if (typeof res?.on === 'function') {
      res.on('close', cleanup);
      res.on('finish', cleanup);
    }
  }

  /**
   * Remove a client from active stream
   * @param {object} res - Express response
   */
  removeClient(res) {
    if (this.clients.has(res)) {
      this.clients.delete(res);
      try {
        if (!res.writableEnded) {
          res.end();
        }
      } catch {
        // Ignore socket closure errors
      }
    }

    if (this.clients.size === 0) {
      this.stopHeartbeat();
    }
  }

  /**
   * Broadcast an event to all connected dashboard clients
   * @param {string} eventName
   * @param {*} data
   */
  broadcast(eventName, data) {
    if (this.clients.size === 0) return;

    let payloadString;
    try {
      payloadString = typeof data === 'string' ? data : JSON.stringify(data);
    } catch (err) {
      payloadString = JSON.stringify({ error: 'Serialization error', message: err.message });
    }

    const message = `event: ${eventName}\ndata: ${payloadString}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch {
        this.removeClient(client);
      }
    }
  }

  /**
   * Broadcast a newly recorded API log entry
   * @param {object} logEntry
   */
  broadcastLog(logEntry) {
    this.broadcast('log', logEntry);
  }

  /**
   * Broadcast clear logs notification
   */
  broadcastClear() {
    this.broadcast('clear', { timestamp: new Date().toISOString() });
  }

  /**
   * Get total number of active connections
   * @returns {number}
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Export singleton instance
export const apiLogStream = new ApiLogStream();
export default apiLogStream;
