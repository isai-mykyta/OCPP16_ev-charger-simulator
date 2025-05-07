import { WebSocketServer } from "ws";

import { WebSocketClient } from "../../simulator/websocket";

describe("WebSocketClient", () => {
  const wssPort = 8081;
  let wss: WebSocketServer;

  beforeEach(() => {
    wss = new WebSocketServer({ port: wssPort });
  });

  afterEach(() => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  });

  test("should connect to ws server", (done) => {
    const wsClient = new WebSocketClient();

    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(1);
      expect(wsClient.getIsConnected()).toBe(true);
      expect(socket.protocol).toBe("ocpp1.6");
      done();
    });

    wsClient.connect(`ws://127.0.0.1:${wssPort}`, "TEST-SIMULATOR");
  });

  test("should disconnect from ws server", (done) => {
    const wsClient = new WebSocketClient();

    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsClient.disconnect();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(wsClient.getIsConnected()).toBe(false);
      done();
    });

    wsClient.connect(`ws://127.0.0.1:${wssPort}`, "TEST-SIMULATOR");
  });

  test("should pong", (done) => {
    const wsClient = new WebSocketClient();

    wss.once("connection", async (socket) => {
      socket.once("pong", () => {
        done();
      });

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      socket.ping();
    });

    wsClient.connect(`ws://127.0.0.1:${wssPort}`, "TEST-SIMULATOR");
  });
});
