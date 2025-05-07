import winston from "winston";

class Logger {
  public readonly logger: winston.Logger;

  constructor () {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }
}

export const logger = new Logger();
