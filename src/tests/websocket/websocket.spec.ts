import { WebSocketServer } from "ws";

import { simulatorsRegistry } from "../../registry";
import { WebSocketService } from "../../websocket/websocket.service";
import { TestSimulator } from "../fixtures";

describe("WebSocketClient", () => {
  const wssPort = 8081;
  let wss: WebSocketServer;
  let testSimulator: TestSimulator;

  beforeEach(() => {
    wss = new WebSocketServer({ port: wssPort });

    testSimulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:${wssPort}`
    });

    simulatorsRegistry.addSimulator(testSimulator);
  });

  afterEach(() => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  });

  test("should connect to ws server", (done) => {
    const wsClient = new WebSocketService();

    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

      expect(wss.clients.size).toBe(1);
      expect(socket.protocol).toBe("ocpp1.6");
      expect(testSimulator.isOnline).toBe(true);

      wsClient.disconnect();
      done();
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      webSocketUrl: `ws://127.0.0.1:${wssPort}`,
      identity: "TEST.SIMULATOR"
    });
  });

  test("should send Boot Notification after connection", (done) => {
    const wsClient = new WebSocketService();

    wss.once("connection", async (socket) => {
      socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        expect(msg[0]).toBe(2);
        expect(msg[2]).toBe("BootNotification");
        expect(msg[3].chargePointModel).toBe("test-model");
        expect(msg[3].chargePointVendor).toBe("test-vendor");
        expect(testSimulator.getPendingRequest(msg[1])).toBeDefined();

        wsClient.disconnect();
        done();
      });
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      webSocketUrl: `ws://127.0.0.1:${wssPort}`,
      identity: "TEST.SIMULATOR"
    });
  });

  test("should disconnect from ws server", (done) => {
    const wsClient = new WebSocketService();

    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsClient.disconnect();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(testSimulator.isOnline).toBe(false);
      done();
    });

    wsClient.connect({
      webSocketPingInterval: 60,
      webSocketUrl: `ws://127.0.0.1:${wssPort}`,
      identity: "TEST.SIMULATOR"
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
      webSocketUrl: `ws://127.0.0.1:${wssPort}`,
      identity: "TEST.SIMULATOR"
    });
  });
});
