import { upAll, downAll, type IDockerComposeResult } from "docker-compose";
import waitOn from "wait-on";
import path from "path";

export const setup = async () => {
  // oxlint-disable eslint/no-misused-promises
  await new Promise<IDockerComposeResult>((accept, reject) =>
    upAll({ cwd: path.join(__dirname, ".."), log: true }).then(
      async (result) => {
        console.log("Localstack started");
        await waitOn({ resources: ["http://127.0.0.1:4566"] });
        accept(result);
      },
      (err: unknown) => {
        if (err instanceof Error) {
          reject(err);
        }
      },
    ),
  );
};

export const teardown = async () => {
  // oxlint-disable eslint/no-misused-promises
  await new Promise<IDockerComposeResult>((accept, reject) =>
    downAll({ cwd: path.join(__dirname, ".."), log: true }).then(
      (result) => {
        console.log("Localstack stopped");
        accept(result);
      },
      (err: unknown) => {
        if (err instanceof Error) {
          reject(err);
        }
      },
    ),
  );
};
