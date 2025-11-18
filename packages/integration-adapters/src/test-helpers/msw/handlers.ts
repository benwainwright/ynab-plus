import { http, HttpResponse } from "msw";
import { MOCK_TOKEN } from "./mock-token.ts";

const YNAB_API = `https://api.ynab.com`;

export const handlers = [
  http.get(`${YNAB_API}/v1/budgets/default/accounts`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (authHeader !== `Bearer ${MOCK_TOKEN}`) {
      return HttpResponse.json({}, { status: 403 });
    }

    return HttpResponse.json({
      data: {
        accounts: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "string",
            type: "checking",
            on_budget: true,
            closed: true,
            note: "string",
            balance: 0,
            cleared_balance: 0,
            uncleared_balance: 0,
            transfer_payee_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            direct_import_linked: true,
            direct_import_in_error: true,
            last_reconciled_at: "2025-11-18T22:21:16.749Z",
            debt_original_balance: 0,
            debt_interest_rates: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0,
            },
            debt_minimum_payments: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0,
            },
            debt_escrow_amounts: {
              additionalProp1: 0,
              additionalProp2: 0,
              additionalProp3: 0,
            },
            deleted: true,
          },
        ],
        server_knowledge: 0,
      },
    });
  }),
];
