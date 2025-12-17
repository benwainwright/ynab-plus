import { http, HttpResponse } from "msw";
import { GOCARDLESS_API } from "./gocardless-api.ts";
import { invalidRequestResponse } from "./invalid-request-response.ts";
import { mockGocardlessData } from "./mock-gocardless-data.ts";

export const handlers = [
  http.get<{ accountId: string }>(
    `${GOCARDLESS_API}/api/v2/accounts/:accountId/details/`,
    ({ request, params }) => {
      const invalidResponse = invalidRequestResponse(request);

      if (invalidResponse) {
        return invalidResponse;
      }

      const { accountId } = params;

      if (!accountId) {
        return HttpResponse.json(
          {
            summary: "Invalid Account ID",
            detail: "$ACCOUNT_ID is not a valid Account UUID. ",
            status_code: 400
          },
          { status: 400 }
        );
      }

      if (accountId === "foo") {
        return HttpResponse.json(mockGocardlessData.mockAccountDetailsResponses.foo);
      }
      if (accountId === "bar") {
        return HttpResponse.json(mockGocardlessData.mockAccountDetailsResponses.bar);
      }
      return HttpResponse.json(
        {
          summary: "Invalid Account ID",
          detail: "$ACCOUNT_ID is not a valid Account UUID. ",
          status_code: 400
        },
        { status: 400 }
      );
    }
  ),

  http.get<{ accountId: string }>(
    `${GOCARDLESS_API}/api/v2/accounts/:accountId/balances/`,
    ({ request, params }) => {
      const invalidResponse = invalidRequestResponse(request);

      if (invalidResponse) {
        return invalidResponse;
      }

      const { accountId } = params;

      if (!accountId || accountId !== mockGocardlessData.mockAccountId) {
        return HttpResponse.json(
          {
            summary: "Invalid Account ID",
            detail: "$ACCOUNT_ID is not a valid Account UUID. ",
            status_code: 400
          },
          { status: 400 }
        );
      }
      return HttpResponse.json(mockGocardlessData.mockBalancesResponse);
    }
  ),

  http.get(`${GOCARDLESS_API}/api/v2/institutions`, ({ request }) => {
    const invalidResponse = invalidRequestResponse(request);

    if (invalidResponse) {
      return invalidResponse;
    }

    const country = new URL(request.url).searchParams.get("country");

    if (!country) {
      return HttpResponse.json(
        {
          error: "please supply country param"
        },
        { status: 400 }
      );
    }
    return HttpResponse.json(mockGocardlessData.mockInstititionsList);
  }),

  http.post<object, { institution_id: string; redirect: string }>(
    `${GOCARDLESS_API}/api/v2/requisitions/`,
    async ({ request }) => {
      const invalidResponse = invalidRequestResponse(request);

      if (invalidResponse) {
        return invalidResponse;
      }

      const data = await request.json();

      const { institution_id, redirect } = data;

      if (
        institution_id !== mockGocardlessData.mockRequisitionResponse.institution_id ||
        !redirect
      ) {
        return HttpResponse.json({ error: "not found" }, { status: 404 });
      }

      return HttpResponse.json(mockGocardlessData.mockRequisitionResponse);
    }
  ),

  http.post<object, { refresh: string }>(
    `${GOCARDLESS_API}/api/v2/token/refresh/`,
    async ({ request }) => {
      const invalidResponse = invalidRequestResponse(request, true);

      if (invalidResponse) {
        return invalidResponse;
      }

      const data = await request.json();

      const { refresh } = data;

      if (refresh !== mockGocardlessData.mockRefreshToken) {
        return HttpResponse.json({
          summary: "Authentication failed",
          detail: "No active account found with the given credentials!",
          status_code: 401
        });
      }
      return HttpResponse.json({
        access: mockGocardlessData.mockRefreshedToken,
        access_expires: 86400
      });
    }
  ),

  http.post<object, { secret_id: string; secret_key: string }>(
    `${GOCARDLESS_API}/api/v2/token/new/`,
    async ({ request }) => {
      const invalidResponse = invalidRequestResponse(request, true);

      if (invalidResponse) {
        return invalidResponse;
      }

      const data = await request.json();

      const { secret_id, secret_key } = data;

      if (
        secret_id !== mockGocardlessData.secretId &&
        secret_key !== mockGocardlessData.secretKey
      ) {
        return HttpResponse.json({
          summary: "Authentication failed",
          detail: "No active account found with the given credentials!",
          status_code: 401
        });
      }
      return HttpResponse.json({
        access: mockGocardlessData.mockToken,
        access_expires: 86400,
        refresh: mockGocardlessData.mockRefreshToken,
        refresh_expires: 2592000
      });
    }
  )
];
