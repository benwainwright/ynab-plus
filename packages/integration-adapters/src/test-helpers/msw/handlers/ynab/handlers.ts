import { http, HttpResponse } from "msw";
import { invalidRequestResponse } from "./invalid-request-response.ts";
import { MOCK_TRANSACTIONS } from "./mock-transactions.ts";
import { MOCK_ACCOUNT_ID } from "./mock-account-id.ts";
import { YNAB_API } from "./ynab-api.ts";

export const handlers = [
  http.get<{ budget: string; account: string }>(
    `${YNAB_API}/v1/budgets/:budget/accounts/:account/transactions`,
    ({ request, params }) => {
      const inValidRequestResponse = invalidRequestResponse(request, params);

      if (inValidRequestResponse) {
        return inValidRequestResponse;
      }

      return HttpResponse.json({
        data: {
          transactions: MOCK_TRANSACTIONS,
          server_knowledge: 123
        }
      });
    }
  ),

  http.get<{ budget: string }>(`${YNAB_API}/v1/budgets/:budget/accounts`, ({ request, params }) => {
    const inValidRequestResponse = invalidRequestResponse(request, params);

    if (inValidRequestResponse) {
      return inValidRequestResponse;
    }

    return HttpResponse.json({
      data: {
        accounts: [
          {
            id: MOCK_ACCOUNT_ID,
            name: "string",
            type: "checking",
            on_budget: true,
            closed: true,
            note: "string",
            balance: 100,
            cleared_balance: 1_000,
            uncleared_balance: 10_000,
            transfer_payee_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            direct_import_linked: true,
            direct_import_in_error: true,
            last_reconciled_at: "2025-11-18T22:21:16.749Z",
            debt_original_balance: 0,
            debt_interest_rates: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0
            },
            debt_minimum_payments: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0
            },
            debt_escrow_amounts: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0
            },
            deleted: true
          }
        ],
        server_knowledge: 1231
      }
    });
  })
];
