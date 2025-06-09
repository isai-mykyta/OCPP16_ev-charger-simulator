import { Request, Response } from "express";

import { ApiController } from "../../api";
import { AlpitronicHyc300 } from "../../models";
import { Simulator } from "../../simulator";

jest.mock("../../models", () => ({
  AlpitronicHyc300: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
} as unknown as Response;

describe("API controller", () => {
  let controller: ApiController;

  beforeEach(() => {
    controller = new ApiController();
  });

  describe("Connect simulator", () => {
    const req = {
      body: {
        vendor: "alpitronic",
        model: "HYC_300",
        chargePointIdentity: "TEST.IDENTITY",
        webSocketUrl: "ws://127.0.0.1:8080",
        chargePointSerialNumber: "TESTSN0001",
      }
    } as Request;

    test("should connect alpitronic HYC_300", async () => {
      await controller.connectSimulator(req, res);

      expect(AlpitronicHyc300).toHaveBeenCalledWith(expect.objectContaining({
        chargePointIdentity: req.body.chargePointIdentity,
        webSocketUrl: req.body.webSocketUrl,
        chargePointSerialNumber: req.body.chargePointSerialNumber,
      }));

      const instance = (AlpitronicHyc300 as jest.Mock).mock.results[0].value;
      expect(instance.start).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ status: "Connected" });
    });

    test("should return 400 if simulator is already connected", async () => {
      controller["simulator"] = {} as Simulator;
      await controller.connectSimulator(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Simulator is already connected" });
    });
  });

  describe("Disconnect simulator", () => {
    const req = {} as Request;

    test("should disconnect simulator", () => {
      const stop = jest.fn();

      controller["simulator"] = { stop } as unknown as Simulator;
      controller.disconnectSimualtor(req, res);

      expect(stop).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ status: "Disconnected" });
    });

    test("should retrun 400 if simulator is not connected", () => {
      controller.disconnectSimualtor(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Simulator is not connected" });
    });
  });
});
