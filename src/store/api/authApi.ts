import { baseApi } from "@/store/api/baseApi";
import { LoginResponse, UserInfo } from "@/lib/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    signup: builder.mutation<LoginResponse, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<UserInfo, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
