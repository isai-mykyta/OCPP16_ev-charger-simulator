import { WebSocketServer } from "ws";

import { ConfigurationService } from "../../configuration";
import { eventsService } from "../../events/events.service";
import { simulatorsRegistry, SimulatorState } from "../../simulator-registry";
import { WebSocketService } from "../../websocket/websocket.service";

describe("WebSocketClient", () => {
  const identity = "TEST-SIMULATOR";
  const wssPort = 8081;
  let wss: WebSocketServer;

  beforeEach(() => {
    wss = new WebSocketServer({ port: wssPort });

    const configuration = [
      {
        key: "WebSocketUrl",
        readonly: true,
        value: "ws://127.0.0.1:8081"
      },
      {
        key: "ChargePointIdentity",
        readonly: true,
        value: identity
      },
      {
        key: "WebSocketPingInterval",
        readonly: true,
        value: "60"
      },
    ];
    
    const state = new SimulatorState({
      identity,
      cpmsUrl: "ws://127.0.0.1:8081",
      configuration: new ConfigurationService(configuration),
      model: "test-model",
      vendor: "test-vendor"
    });
    
    simulatorsRegistry.addSimulator(state);
  });

  afterEach(() => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  });

  test("should connect to ws server", (done) => {
    const wsClient = new WebSocketService(identity);

    const eventHandler = jest.fn();
    eventsService.on("simulatorConnected", eventHandler);

    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

      expect(wss.clients.size).toBe(1);
      expect(socket.protocol).toBe("ocpp1.6");
      expect(eventHandler).toHaveBeenCalledWith({ identity });

      wsClient.disconnect();
      done();
    });

    wsClient.connect();
  });

  test("should send Boot Notification after connection", (done) => {
    const wsClient = new WebSocketService(identity);

    const eventHandler = jest.fn();
    eventsService.on("simulatorConnected", eventHandler);

    wss.once("connection", async (socket) => {
      socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        expect(msg[0]).toBe(2);
        expect(msg[2]).toBe("BootNotification");
        expect(msg[3].chargePointModel).toBe("test-model");
        expect(msg[3].chargePointVendor).toBe("test-vendor");

        wsClient.disconnect();
        done();
      });
    });

    wsClient.connect();
  });

  test("should disconnect from ws server", (done) => {
    const wsClient = new WebSocketService(identity);

    const eventHandler = jest.fn();
    eventsService.on("simulatorDisconnected", eventHandler);

    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsClient.disconnect();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(eventHandler).toHaveBeenCalledWith({ identity });

      done();
    });

    wsClient.connect();
  });

  test("should pong", (done) => {
    const wsClient = new WebSocketService(identity);

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
