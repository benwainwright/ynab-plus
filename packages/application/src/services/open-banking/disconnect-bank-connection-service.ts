import { AbstractApplicationService, inject } from "@core";
import type { IBankConnectionRepository, IOauthTokenRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Permission } from "@ynab-plus/domain";

export class DisconnectBankConnectionService extends AbstractApplicationService<"DisconnectBankCoonnectionCommand"> {
  public override readonly commandName = "DisconnectBankCoonnectionCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  public constructor(
    @inject("OauthTokenRepository")
    private readonly tokenRepo: IOauthTokenRepository,

    @inject("BankConnectionRepository")
    private readonly connectionRepo: IBankConnectionRepository,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  protected override async handle(): Promise<void> {
    const token = await this.tokenRepo.get(this.currentUser.id, "open-banking");
    if (token) {
      token.delete();
      await this.tokenRepo.delete(token);
    }
    const connection = await this.connectionRepo.getConnection(this.currentUser.id);

    if (connection) {
      connection.delete();
      await this.connectionRepo.deleteConnection(connection);
    }
  }
}
