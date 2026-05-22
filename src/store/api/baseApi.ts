import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { clearSession, setTokens } from "@/store/slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  prepareHeaders: (headers, { getState, arg }) => {
    const state = getState() as { auth?: { tokens?: { accessToken?: string } } };
    const token = state.auth?.tokens?.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const body =
      typeof arg === "object" && arg !== null && "body" in arg ? (arg as { body?: unknown }).body : undefined;
    if (!(body instanceof FormData)) {
      headers.set("content-type", "application/json");
    }
    return headers;
  },
});

const baseQueryWithReAuth = async (args: Parameters<typeof rawBaseQuery>[0], api: Parameters<typeof rawBaseQuery>[1], extraOptions: Parameters<typeof rawBaseQuery>[2]) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as {
      auth?: { tokens?: { refreshToken?: string; accessToken?: string; tokenType?: string } };
    };

    const refreshToken = state.auth?.tokens?.refreshToken;
    if (!refreshToken) {
      api.dispatch(clearSession());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data && typeof refreshResult.data === "object" && "tokens" in refreshResult.data) {
      const tokens = (refreshResult.data as { tokens: { accessToken: string; refreshToken: string; tokenType: string } }).tokens;
      api.dispatch(setTokens(tokens));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearSession());
    }
  }

  return result;
};

const resilientBaseQuery = retry(baseQueryWithReAuth, { maxRetries: 2 });

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: resilientBaseQuery,
  tagTypes: ["Book", "Ticket", "TicketList",'Admins',"Messages"],
  endpoints: () => ({}),
});
