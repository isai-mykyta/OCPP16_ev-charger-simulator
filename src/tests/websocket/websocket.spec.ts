import { WebSocketServer } from "ws";

import { eventsService } from "../../events/events.service";
import { WebSocketService } from "../../websocket/websocket.service";

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
    const wsClient = new WebSocketService();

    const eventHandler = jest.fn();
    eventsService.on("simulatorConnected", eventHandler);

    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

      expect(wss.clients.size).toBe(1);
      expect(socket.protocol).toBe("ocpp1.6");
      expect(eventHandler).toHaveBeenCalledWith({ identity: "TEST-SIMULATOR" });

      wsClient.disconnect();
      done();
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      chargePointIdentity: "TEST-SIMULATOR",
      cpmsUrl: `ws://127.0.0.1:${wssPort}`
    });
  });

  test("should disconnect from ws server", (done) => {
    const wsClient = new WebSocketService();

    const eventHandler = jest.fn();
    eventsService.on("simulatorDisconnected", eventHandler);

    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsClient.disconnect();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(eventHandler).toHaveBeenCalledWith({ identity: "TEST-SIMULATOR" });

      done();
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      chargePointIdentity: "TEST-SIMULATOR",
      cpmsUrl: `ws://127.0.0.1:${wssPort}`
    });
  });

  test("should pong", (done) => {
    const wsClient = new WebSocketService();

    wss.once("connection", async (socket) => {
      socket.once("pong", () => {
        wsClient.disconnect();
        done();
      });

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      socket.ping();
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      chargePointIdentity: "TEST-SIMULATOR",
      cpmsUrl: `ws://127.0.0.1:${wssPort}`
    });
  });
});
