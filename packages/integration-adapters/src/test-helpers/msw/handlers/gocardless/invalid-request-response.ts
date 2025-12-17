import { HttpResponse, type DefaultBodyType, type StrictRequest } from "msw";
import { mockGocardlessData } from "./mock-gocardless-data.ts";

export const invalidRequestResponse = (
  request: StrictRequest<DefaultBodyType>,
  withoutToken?: boolean
) => {
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  const auth = request.headers.get("Authorization");

  if (!withoutToken && auth !== `Bearer ${mockGocardlessData.mockToken}`) {
    return HttpResponse.json(
      {
        summary: "Invalid token",
        detail: "Token is invalid or expired",
        status_code: 401
      },
      { status: 401 }
    );
  }

  if (accept !== "application/json") {
    return HttpResponse.json(
      {
        error: "bad_request"
      },
      { status: 400 }
    );
  }

  if (contentType !== "application/json") {
    return HttpResponse.json(
      {
        error: "bad_request"
      },
      { status: 400 }
    );
  }

  return undefined;
};
