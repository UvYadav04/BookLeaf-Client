"use client";

import { FormEvent, useCallback, useState } from "react";
import Markdown from "react-markdown";
import RequireRole from "@/components/RequireRole";
import TicketImage from "@/components/TicketImage";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { useAuthorTicketWebSocket } from "@/lib/useAuthorTicketWebSocket";
import { Ticket } from "@/lib/types";
import { useCreateTicketMutation, useGetMyBooksQuery, useGetMyTicketsQuery } from "@/store/api/authorApi";

export default function AuthorTicketsPage() {
  const { data: booksData } = useGetMyBooksQuery();
  const { data, isLoading, isError, refetch } = useGetMyTicketsQuery();
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);

  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleTicketUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useAuthorTicketWebSocket(handleTicketUpdate);

  function resetCreateForm() {
    setBookId("");
    setSubject("");
    setDescription("");
    setImage(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    // Basic validation
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    let validationError = "";

    if (!trimmedSubject) {
      validationError = "Subject is required.";
    } else if (trimmedSubject.length > 120) { // reasonable cap, customize as needed
      validationError = "Subject must be 120 characters or fewer.";
    } else if (!trimmedDescription) {
      validationError = "Description is required.";
    } else if (trimmedDescription.length > 2000) {
      validationError = "Description must be 2000 characters or fewer.";
    } else if (image && image.size > 1 * 1024 * 1024) {
      validationError = "Image must be under 5MB.";
    }

    if (validationError) {
      alert(validationError);
      return;
    }

    await createTicket({
      bookId: bookId || undefined,
      subject: trimmedSubject,
      description: trimmedDescription,
      image,
    }).unwrap();
    resetCreateForm();
    setCreateOpen(false);
    refetch();
  }

  return (
    <RequireRole role="author">
      <main className="page">
        <PageHeader
          title="My Tickets"
          subtitle="Track support requests and responses in real time."
          action={
            <button type="button" className="primary" onClick={() => setCreateOpen(true)}>
              + New Ticket
            </button>
          }
        />

        <section className="card card-elevated">
          {isLoading ? <p className="empty-state">Loading tickets...</p> : null}
          {isError ? (
            <p className="empty-state" style={{ color: "var(--danger)" }}>
              Failed to load tickets.
            </p>
          ) : null}

          {!isLoading && !isError && !data?.items.length ? (
            <div className="empty-state">
              <p>No tickets yet.</p>
              <button type="button" className="primary" style={{ marginTop: 12 }} onClick={() => setCreateOpen(true)}>
                Create your first ticket
              </button>
            </div>
          ) : null}

          {data?.items.length ? (
            <>
              <div className="table-wrap hide-mobile-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="clickable"
                        onClick={() => setDetailTicket(ticket)}
                      >
                        <td>
                          <strong>{ticket.subject}</strong>
                          {ticket.imageUrl ? (
                            <small className="muted" style={{ display: "block", marginTop: 4 }}>
                              Has attachment
                            </small>
                          ) : null}
                        </td>
                        <td>
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td>{ticket.category}</td>
                        <td>
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="muted">{new Date(ticket.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ticket-cards hide-desktop-cards">
                {data.items.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="ticket-card"
                    onClick={() => setDetailTicket(ticket)}
                  >
                    <h4>{ticket.subject}</h4>
                    <p>{ticket.description}</p>
                    <div className="row">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>

        <Modal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            resetCreateForm();
          }}
          title="Submit Support Query"
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" form="create-ticket-form" className="primary" disabled={creating}>
                {creating ? "Submitting..." : "Create Ticket"}
              </button>
            </>
          }
        >
          <form id="create-ticket-form" className="grid" onSubmit={onSubmit}>
            <label className="field">
              Book
              <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">General</option>
                <option value="Account Level">Account Level</option>
                {booksData?.items.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Subject
              <input value={subject} onChange={(e) => setSubject(e.target.value)} minLength={3} required />
            </label>
            <label className="field">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={10}
                required
                rows={5}
              />
            </label>
            <label className="field">
              Attachment
              <span className="hint">One image (JPEG, PNG, WebP, GIF)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </label>
          </form>
        </Modal>

        <Modal
          open={!!detailTicket}
          onClose={() => setDetailTicket(null)}
          title={detailTicket?.subject ?? "Ticket"}
          size="lg"
        >
          {detailTicket ? (
            <div className="grid">
              <div className="row">
                <StatusBadge status={detailTicket.status} />
                <PriorityBadge priority={detailTicket.priority} />
                <span className="badge badge-closed">{detailTicket.category}</span>
              </div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{detailTicket.description}</p>
              <TicketImage imageUrl={detailTicket.imageUrl} alt={`Attachment for ${detailTicket.subject}`} />
              <small className="muted">Updated {new Date(detailTicket.updatedAt).toLocaleString()}</small>
              {detailTicket.aiMeta?.draft?.draft ? (
                <div className="draft-box">
                  <strong style={{ display: "block", marginBottom: 8 }}>Support response</strong>
                  <Markdown>{detailTicket.aiMeta.draft.draft}</Markdown>
                </div>
              ) : null}
            </div>
          ) : null}
        </Modal>
      </main>
    </RequireRole>
  );
}
