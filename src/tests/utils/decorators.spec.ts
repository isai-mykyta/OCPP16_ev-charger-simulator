import { IsWebSocketUrl, validateDto } from "../../utils";

describe("Decorators Utils", () => {
  describe("IsWebSocketUrl", () => {
    test("should pass with valid ws url", () => {
      class DtoExample {
        @IsWebSocketUrl()
        public wsUrl: string;
      }

      const validInput = { wsUrl: "ws://example-url.com" };
      const result = validateDto(validInput, DtoExample);
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test("should pass with valid wss url", () => {
      class DtoExample {
        @IsWebSocketUrl()
        public wsUrl: string;
      }

      const validInput = { wsUrl: "wss://example-url.com" };
      const result = validateDto(validInput, DtoExample);
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test("should not pass with invalid ws url", () => {
      class DtoExample {
        @IsWebSocketUrl()
        public wsUrl: string;
      }

      const validInput = { wsUrl: "invalid-ws-url" };
      const result = validateDto(validInput, DtoExample);
      
      expect(result.isValid).toBe(false);
    });
  });
});
