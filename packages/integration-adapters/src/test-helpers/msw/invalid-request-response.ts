import { HttpResponse, type DefaultBodyType, type StrictRequest } from "msw";
import { MOCK_BUDGET_ID, MOCK_TOKEN } from "./mock-token.ts";

export const invalidRequestResponse = (
  request: StrictRequest<DefaultBodyType>,
  params: { budget: string },
) => {
  const authHeader = request.headers.get("Authorization");

  if (params.budget !== "default" && params.budget !== MOCK_BUDGET_ID) {
    return HttpResponse.json(
      {
        error: {
          id: "404.2",
          name: "resource_not_found",
          detail: "Resource not found",
        },
      },
      { status: 404 },
    );
  }

  if (authHeader !== `Bearer ${MOCK_TOKEN}`) {
    return HttpResponse.json(
      {
        error: {
          id: "401",
          name: "unauthorized",
          detail: "Unauthorized",
        },
      },
      { status: 401 },
    );
  }
  return undefined;
};
