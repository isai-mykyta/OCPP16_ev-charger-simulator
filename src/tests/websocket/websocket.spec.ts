import { WebSocketServer } from "ws";

import { KeyValue } from "../../ocpp";
import { WebSocketService } from "../../websocket/websocket.service";
import { TestSimulator } from "../fixtures";

describe("WebSocketClient", () => {
  const wssPort = 8081;
  let wss: WebSocketServer;
  let simulator: TestSimulator;

  beforeEach(() => {
    wss = new WebSocketServer({ port: wssPort });

    simulator = new TestSimulator({
      chargePointIdentity: "TEST.SIMULATOR",
      configuration: [] as KeyValue[],
      model: "test-model",
      vendor: "test-vendor",
      webSocketUrl: `ws://127.0.0.1:${wssPort}`,
      connectors: []
    });
  });

  afterEach(() => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  });

  test("should connect to ws server", (done) => {
    const wsClient = new WebSocketService({
      simulator,
      webSocketPingInterval: 60
    });

    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

      expect(wss.clients.size).toBe(1);
      expect(socket.protocol).toBe("ocpp1.6");
      expect(simulator.isOnline).toBe(true);

      wsClient.disconnect();
      done();
    });

    wsClient.connect();
  });

  test("should disconnect from ws server", (done) => {
    const wsClient = new WebSocketService({
      simulator,
      webSocketPingInterval: 60
    });

    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsClient.disconnect();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(simulator.isOnline).toBe(false);
      done();
    });

    wsClient.connect();
  });

  test("should pong", (done) => {
    const wsClient = new WebSocketService({
      simulator,
      webSocketPingInterval: 60
    });

    wss.once("connection", async (socket) => {
      socket.once("pong", () => {
        wsClient.disconnect();
        done();
      });

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      socket.ping();
    });

    wsClient.connect();
  });
});
