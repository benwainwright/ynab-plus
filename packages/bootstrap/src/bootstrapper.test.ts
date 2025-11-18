import { afterEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import z from "zod";
import { mock } from "vitest-mock-extended";

import { Bootstrapper, LOG_CONTEXT } from "./bootstrapper.ts";
import type { ILogger } from "./i-logger.ts";

// Mock fs once for the whole file – this is fine in ESM, unlike spyOn
vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Bootstrapper", () => {
  it("reads the config file, validates it and resolves configValue only after start", async () => {
    const logger = mock<ILogger>();

    const configJson = {
      port: 3000,
      host: "localhost",
    };

    const readFileSyncMock = fs.readFileSync as unknown as {
      mockReturnValue: (value: string) => void;
    };
    readFileSyncMock.mockReturnValue(JSON.stringify(configJson));

    const bootstrapper = new Bootstrapper({
      configFile: "config.json",
      logger,
    });

    const portConfig = bootstrapper.configValue("port", z.number() as any);
    const hostConfig = bootstrapper.configValue("host", z.string() as any);

    await bootstrapper.start();

    await expect(portConfig.value).resolves.toBe(3000);
    await expect(hostConfig.value).resolves.toBe("localhost");

    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      "Starting application",
      LOG_CONTEXT,
    );
    expect(logger.debug).toHaveBeenCalledWith(
      `Application config ${JSON.stringify(configJson)}`,
      LOG_CONTEXT,
    );
  });

  it("runs bootstrapping steps sequentially", async () => {
    const logger = mock<ILogger>();

    const configJson = { foo: "bar" };

    const readFileSyncMock = fs.readFileSync as unknown as {
      mockReturnValue: (value: string) => void;
    };
    readFileSyncMock.mockReturnValue(JSON.stringify(configJson));

    const bootstrapper = new Bootstrapper({
      configFile: "config.json",
      logger,
    });

    bootstrapper.configValue("foo", z.string() as any);

    const callOrder: string[] = [];

    // eslint-disable-next-line @typescript-eslint/require-await
    bootstrapper.addInitStep(async () => {
      callOrder.push("first");
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    bootstrapper.addInitStep(async () => {
      expect(callOrder).toEqual(["first"]);
      callOrder.push("second");
    });

    await bootstrapper.start();

    expect(callOrder).toEqual(["first", "second"]);
  });

  it("logs validation errors and does not run bootstrapping steps when config is invalid", async () => {
    expect.assertions(4);
    const logger = mock<ILogger>();

    const badConfigJson = {
      port: "not-a-number",
    };

    const readFileSyncMock = fs.readFileSync as unknown as {
      mockReturnValue: (value: string) => void;
    };
    readFileSyncMock.mockReturnValue(JSON.stringify(badConfigJson));

    const bootstrapper = new Bootstrapper({
      configFile: "config.json",
      logger,
    });

    bootstrapper.configValue("port", z.number() as any);

    const step = vi.fn(async () => {});

    bootstrapper.addInitStep(step);

    await bootstrapper.start();

    expect(logger.error).toHaveBeenCalledTimes(1);
    const call = logger.error.mock.calls[0];
    if (call) {
      const [message, context] = call;

      expect(typeof message).toBe("string");
      expect(context).toEqual(LOG_CONTEXT);

      expect(step).not.toHaveBeenCalled();
    }
  });

  it("resolves ConfigValue for a single key using the JSON config", async () => {
    const logger = mock<ILogger>();

    const configJson = {
      someKey: "some-value",
    };

    const readFileSyncMock = fs.readFileSync as unknown as {
      mockReturnValue: (value: string) => void;
    };
    readFileSyncMock.mockReturnValue(JSON.stringify(configJson));

    const bootstrapper = new Bootstrapper({
      configFile: "config.json",
      logger,
    });

    const someConfig = bootstrapper.configValue("someKey", z.string() as any);

    await bootstrapper.start();

    await expect(someConfig.value).resolves.toBe("some-value");
  });

  it("logs a silly message when initialising the bootstrapper", () => {
    const logger = mock<ILogger>();

    const readFileSyncMock = fs.readFileSync as unknown as {
      mockReturnValue: (value: string) => void;
    };
    readFileSyncMock.mockReturnValue(JSON.stringify({}));

     
    new Bootstrapper({
      configFile: "config.json",
      logger,
    });

    expect(logger.silly).toHaveBeenCalledWith("Initialising bootstrapper", {
      context: "bootstrapper",
    });
  });
});
