import { http, HttpResponse } from "msw";
import { GOCARDLESS_API } from "./gocardless-api.ts";
import { invalidRequestResponse } from "./invalid-request-response.ts";
import { mockGocardlessData } from "./mock-gocardless-data.ts";

export const handlers = [
  http.get(`${GOCARDLESS_API}/api/v2/institutions`, ({ request }) => {
    const invalidResponse = invalidRequestResponse(request);

    if (invalidResponse) {
      return invalidResponse;
    }

    const country = new URL(request.url).searchParams.get("country");

    if (!country) {
      return HttpResponse.json(
        {
          error: "please supply country param",
        },
        { status: 400 },
      );
    }
    return HttpResponse.json(mockGocardlessData.mockInstititionsList);
  }),

  http.post<object, { institution_id: string }>(
    `${GOCARDLESS_API}/api/v2/requisitions`,
    async ({ request }) => {
      const invalidResponse = invalidRequestResponse(request);

      if (invalidResponse) {
        return invalidResponse;
      }

      const data = await request.json();

      const { institution_id } = data;

      if (
        institution_id !==
        mockGocardlessData.mockRequisitionResponse.institution_id
      ) {
        return HttpResponse.json({ error: "not found" }, { status: 404 });
      }

      return HttpResponse.json(mockGocardlessData.mockRequisitionResponse);
    },
  ),

  http.post<object, { secret_id: string; secret_key: string }>(
    `${GOCARDLESS_API}/api/v2/token/new`,
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
          detail: "No active account found with the given credentials",
          status_code: 401,
        });
      }
      return HttpResponse.json({
        access: mockGocardlessData.mockToken,
        access_expires: 86400,
        refresh: mockGocardlessData.mockRefreshToken,
        refresh_expires: 2592000,
      });
    },
  ),
];
