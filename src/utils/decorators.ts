import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export const IsWebSocketUrl = (validationOptions?: ValidationOptions) => {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: "isWebSocketUrl",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: ValidationArguments) {
          if (typeof value !== "string") return false;

          try {
            const url = new URL(value);
            return url.protocol === "ws:" || url.protocol === "wss:";
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid WebSocket URL`;
        },
      },
    });
  };
};
