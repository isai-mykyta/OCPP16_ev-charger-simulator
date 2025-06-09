import { Request, Response } from "express";

import { connectMiddleware } from "../../api";

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
} as unknown as Response;

const next = jest.fn();

describe("API middleware", () => {
  describe("connectMiddleware", () => {
    test("should return 400 if chargePointIdentity is not provided", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          model: "HYC_300"
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if chargePointIdentity length is out of range", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          model: "HYC_300",
          chargePointIdentity: "i"
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();

      req.body.chargePointIdentity = "123456789098765432123";
      connectMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if webSocketUrl is not provided", () => {
      const req = { 
        body: {
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          chargePointIdentity: "TEST.IDENTITY",
          model: "HYC_300"
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if webSocketUrl is not valid", () => {
      const req = { 
        body: {
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          chargePointIdentity: "TEST.IDENTITY",
          model: "HYC_300",
          webSocketUrl: "invalid-url",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if chargePointSerialNumber is not provided", () => {
      const req = { 
        body: {
          vendor: "alpitronic",
          chargePointIdentity: "TEST.IDENTITY",
          model: "HYC_300",
          webSocketUrl: "wss://example-url.com",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if chargePointSerialNumber length is out of range", () => {
      const req = { 
        body: {
          vendor: "alpitronic",
          chargePointIdentity: "TEST.IDENTITY",
          model: "HYC_300",
          webSocketUrl: "wss://example-url.com",
          chargePointSerialNumber: "SN",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();

      req.body.chargePointSerialNumber = "1".repeat(51);

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if vendor is not provided", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          model: "HYC_300",
          chargePointIdentity: "TEST.IDENTITY",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if model is not provided", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          chargePointIdentity: "TEST.IDENTITY",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if vendor is invalid", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "randomVendor",
          model: "HYC_300",
          chargePointIdentity: "TEST.IDENTITY",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Invalid vendor." });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 400 if model is invalid", () => {
      const req = { 
        body: {
          webSocketUrl: "ws://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          model: "invalidModel",
          chargePointIdentity: "TEST.IDENTITY",
        }
      } as Request;

      connectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Invalid model." });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 200 is request data is valid", () => {
      const req = { 
        body: {
          webSocketUrl: "wss://example-url.com",
          chargePointSerialNumber: "SN123456",
          vendor: "alpitronic",
          model: "HYC_300",
          chargePointIdentity: "TEST.IDENTITY",
        }
      } as Request;

      connectMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
