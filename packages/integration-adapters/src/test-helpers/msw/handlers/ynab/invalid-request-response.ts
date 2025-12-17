import { HttpResponse, type DefaultBodyType, type StrictRequest } from "msw";
import { MOCK_TOKEN } from "./mock-token.ts";
import { MOCK_BUDGET_ID } from "./mock-budget-id.ts";
import { MOCK_ACCOUNT_ID } from "./mock-account-id.ts";

export const invalidRequestResponse = (
  request: StrictRequest<DefaultBodyType>,
  params: { budget: string; account?: string }
) => {
  const authHeader = request.headers.get("Authorization");

  if (
    params.budget !== "default" &&
    params.budget !== MOCK_BUDGET_ID &&
    ((typeof !params.account === "undefined" && params.account !== MOCK_ACCOUNT_ID) ||
      typeof params.account === "undefined")
  ) {
    return HttpResponse.json(
      {
        error: {
          id: "404.2",
          name: "resource_not_found",
          detail: "Resource not found"
        }
      },
      { status: 404 }
    );
  }

  if (authHeader !== `Bearer ${MOCK_TOKEN}`) {
    return HttpResponse.json(
      {
        error: {
          id: "401",
          name: "unauthorized",
          detail: "Unauthorized"
        }
      },
      { status: 401 }
    );
  }
  return undefined;
};
