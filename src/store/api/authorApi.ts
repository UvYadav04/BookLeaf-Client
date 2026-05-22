import { Book, Ticket } from "@/lib/types";
import { baseApi } from "@/store/api/baseApi";

export const authorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyBooks: builder.query<{ items: Book[] }, void>({
      query: () => ({
        url: "/author/books",
                credentials:'include'

      }),
      providesTags: ["Book"],
    }),
    publishBook: builder.mutation<
      { item: Book },
      { title: string; isbn: string; genre: string; mrp: number; publicationDate?: string }
    >({
      query: (body) => ({
        url: "/author/books",
        method: "POST",
        body,
                credentials:'include'

      }),
      invalidatesTags: ["Book"],
    }),
    getMyTickets: builder.query<{ items: Ticket[]; total: number }, void>({
      query: () => ({
        url: "/author/tickets",
                credentials:'include'
      }),
      providesTags: ["TicketList"],
    }),
    createTicket: builder.mutation<
      { item: Ticket },
      { bookId: string; subject: string; description: string; image?: File | null }
    >({
      query: ({ bookId, subject, description, image }) => {
        const form = new FormData();
        form.append("subject", subject);
        form.append("description", description);
        if (bookId) form.append("bookId", bookId);
        if (image) form.append("image", image);
        return {
          url: "/author/tickets",
          method: "POST",
          body: form,
                  credentials:'include'

        };
      },
      invalidatesTags: ["TicketList"],
    }),
  }),
});

export const { useGetMyBooksQuery, usePublishBookMutation, useGetMyTicketsQuery, useCreateTicketMutation } =
  authorApi;
