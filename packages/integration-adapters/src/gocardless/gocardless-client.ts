import { inject } from "@core";
import { HttpClient } from "@http-client";
import {
  type IBankConnectionCreator,
  type IInstitutionAuthPageLinkFetcher,
  type IOpenBankingTokenFetcher,
} from "@ynab-plus/app";
import { type ConfigValue, type ILogger } from "@ynab-plus/bootstrap";
import { BankConnection, OauthToken } from "@ynab-plus/domain";
import { injectable } from "inversify";
import z from "zod";

@injectable()
export class GocardlessClient
  implements
    IBankConnectionCreator,
    IInstitutionAuthPageLinkFetcher,
    IOpenBankingTokenFetcher
{
  private client: HttpClient;

  public constructor(
    @inject("GocardlessClientSecretIdConfigValue")
    private secretId: ConfigValue<string>,

    @inject("GocardlessClientSecretKeyConfigValue")
    private secretKey: ConfigValue<string>,

    @inject("Logger")
    logger: ILogger,
  ) {
    this.client = new HttpClient(
      `https://bankaccountdata.gocardless.com/api/v2`,
      logger,
      {
        accept: "application/json",
        "content-type": "application/json",
      },
    );
  }
  public async getLink(
    connection: BankConnection,
    token: OauthToken,
  ): Promise<{ requsitionId: string; url: string }> {
    const result = await this.client.post({
      path: "requisitions",
      body: {
        institution_id: connection.id,
      },
      headers: {
        Authorization: `Bearer ${token.use()}`,
      },
      responseSchema: z.object({
        id: z.string(),
        created: z.string(),
        redirect: z.string(),
        status: z.string(),
        institution_id: z.string(),
        agreement: z.string(),
        reference: z.string(),
        user_language: z.string(),
        link: z.string(),
        ssn: z.string(),
      }),
    });

    return {
      url: result.link,
      requsitionId: result.id,
    };
  }

  public async getNewToken() {
    return await this.client.post({
      path: "token/new",
      body: {
        secret_id: await this.secretId.value,
        secret_key: await this.secretKey.value,
      },
      responseSchema: z
        .object({
          access: z.string(),
          access_expires: z.number(),
          refresh: z.string(),
          refresh_expires: z.number(),
        })
        .transform((data) => ({
          token: data.access,
          refreshToken: data.refresh,
          tokenExpiresIn: data.access_expires,
          refreshTokenExpiresIn: data.refresh_expires,
        })),
    });
  }

  public async getConnections(
    userId: string,
    token: OauthToken,
  ): Promise<BankConnection[]> {
    return await this.client.get({
      path: "institutions",
      queryString: {
        country: "GB",
      },
      headers: {
        Authorization: `Bearer ${token.use()}`,
      },
      responseSchema: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            bic: z.string(),
            transaction_total_days: z.string(),
            countries: z.array(z.string()),
            logo: z.string(),
            max_access_valid_for_days: z.string(),
          }),
        )
        .transform((data) =>
          data.map((item) =>
            BankConnection.create({
              id: item.id,
              userId,
              bankName: item.name,
              logo: item.logo,
            }),
          ),
        ),
    });
  }
}
