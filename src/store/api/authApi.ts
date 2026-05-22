import { baseApi } from "@/store/api/baseApi";
import { LoginResponse, UserInfo } from "@/lib/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
        credentials:'include'
      }),
      invalidatesTags: ["Book", "Ticket",'TicketList','Admins'],

    }),
    signup: builder.mutation<LoginResponse, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
                credentials:'include'

      }),
      invalidatesTags: ["Book", "Ticket",'TicketList','Admins'],
    }),
    getMe: builder.query<UserInfo, void>({
      query: () => ({
        url: "/auth/me",
        credentials:'include'
      }),

    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
