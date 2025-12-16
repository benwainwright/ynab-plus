import type { IBankConnectionRepository, IOauthTokenRepository } from "@ports";
import { createMockServiceContext } from "@test-helpers";
import { mock } from "vitest-mock-extended";
import { DisconnectBankConnectionService } from "./disconnect-bank-connection-service.ts";
import { when } from "vitest-when";
import { BankConnection, OauthToken } from "@ynab-plus/domain";

describe("disconnect bank connection service", () => {
  it("deletes the token and the connection", async () => {
    const tokenRepo = mock<IOauthTokenRepository>();
    const connectionRepo = mock<IBankConnectionRepository>();

    const context = createMockServiceContext("DisconnectBankCoonnectionCommand", undefined, "ben");

    const service = new DisconnectBankConnectionService(tokenRepo, connectionRepo, mock());

    const mockToken = mock<OauthToken>();
    const mockConnection = mock<BankConnection>();

    when(tokenRepo.get).calledWith("ben", "open-banking").thenResolve(mockToken);
    when(connectionRepo.getConnection).calledWith("ben").thenResolve(mockConnection);

    await service.doHandle(context);

    expect(mockToken.delete).toHaveBeenCalled();
    expect(mockConnection.delete).toHaveBeenCalled();
    expect(tokenRepo.delete).toHaveBeenCalledWith(mockToken);
    expect(connectionRepo.deleteConnection).toHaveBeenCalledWith(mockConnection);
  });
});
