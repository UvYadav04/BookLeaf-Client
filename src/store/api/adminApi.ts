import { Ticket } from "@/lib/types";
import { baseApi } from "@/store/api/baseApi";

type AdminUser = {
  id: string;
  name: string;
  email: string;
};

type TicketMessage = {
  ticketId: string,
  message: string,
  isInternal: boolean,
  senderId:string
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTickets: builder.query<
      { items: Ticket[]; total: number },
      {
        status?: string;
        priority?: string;
        category?: string;
      }
    >({
      query: (params) => ({
        url: "/admin/tickets",
        params,
        credentials: "include",
      }),
      providesTags: ["TicketList"],
    }),

    updateTicket: builder.mutation<
      { item: Ticket },
      {
        ticketId: string;
        patch: Record<string, string>;
      }
    >({
      query: ({ ticketId, patch }) => ({
        url: `/admin/tickets/${ticketId}`,
        method: "PATCH",
        body: patch,
        credentials: "include",
      }),
      invalidatesTags: ["TicketList", "Ticket"],
    }),

    createDraft: builder.mutation<
      {
        item: {
          draft: string;
          source: string;
          reason?: string;
        };
      },
      {
        ticketId: string;
      }
    >({
      query: ({ ticketId }) => ({
        url: `/admin/tickets/${ticketId}/draft`,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["TicketList", "Ticket"],
    }),

    sendReply: builder.mutation<
      { item: unknown },
      {
        ticketId: string;
        message: string;
      }
    >({
      query: ({ ticketId, message }) => ({
        url: `/admin/tickets/${ticketId}/reply`,
        method: "POST",
        body: { message },
        credentials: "include",
      }),
      invalidatesTags: ["TicketList", "Ticket"],
    }),

    // Fetch all admins
    getAdmins: builder.query<{ items: AdminUser[] }, void>({
      query: () => ({
        url: "/admin/admins",
        credentials: "include",
      }),
      providesTags: ["Admins"],
    }),
    getTicketMessages: builder.query<{ items: TicketMessage[] }, void>({
      query: () => ({
        url: "/admin/tickets/messages",
        credentials: "include",
      }),
      providesTags: ["Admins"],
    }),

    // Assign ticket to another admin
    assignTicket: builder.mutation<
      { item: Ticket },
      {
        ticketId: string;
        adminId: string;
      }
    >({
      query: ({ ticketId, adminId }) => ({
        url: `/admin/tickets/${ticketId}/assign/${adminId}`,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["TicketList", "Ticket"],
    }),

    // Add internal admin note
    addInternalNote: builder.mutation<
      { item: unknown },
      {
        ticketId: string;
        note: string;
      }
    >({
      query: ({ ticketId, note }) => ({
        url: `/admin/tickets/${ticketId}/notes`,
        method: "POST",
        body: { note },
        credentials: "include",
      }),
      invalidatesTags: ["TicketList", "Ticket"],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useUpdateTicketMutation,
  useCreateDraftMutation,
  useSendReplyMutation,
  useGetAdminsQuery,
  useAssignTicketMutation,
  useAddInternalNoteMutation,
  useGetTicketMessagesQuery
} = adminApi;