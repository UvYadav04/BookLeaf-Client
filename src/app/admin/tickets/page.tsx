"use client";

import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";

import RequireRole from "@/components/RequireRole";
import TicketImage from "@/components/TicketImage";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";

import { Ticket } from "@/lib/types";

import {
  useAddInternalNoteMutation,
  useAssignTicketMutation,
  useCreateDraftMutation,
  useGetAdminsQuery,
  useGetAllTicketsQuery,
  useGetTicketMessagesQuery,
  useSendReplyMutation,
  useUpdateTicketMutation,
} from "@/store/api/adminApi";
import { loadAuth } from "@/lib/authStorage";
import { useGetMeQuery } from "@/store/api/authApi";

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [manualDraft, setManualDraft] = useState("");
  const [replyError, setReplyError] = useState("");

  const [internalNote, setInternalNote] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const { data: messages } = useGetTicketMessagesQuery()

  const { data: user } = useGetMeQuery()
  const currentAdminId = user?.id

  const params = useMemo(
    () => ({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      assigneeId: assignedToMeOnly
        ? currentAdminId || undefined
        : undefined,
    }),
    [
      statusFilter,
      priorityFilter,
      assignedToMeOnly,
      currentAdminId,
    ]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAllTicketsQuery(params, {
    pollingInterval: 15000,
  });


  const getTicketMessages = (id: string) => {
    return messages?.items?.filter((item)=>item.ticketId ===id && item.isInternal === true)
  }

  const { data: adminsData } = useGetAdminsQuery();

  const [updateTicket, { isLoading: updating }] =
    useUpdateTicketMutation();

  const [createDraft, { isLoading: creatingDraft }] =
    useCreateDraftMutation();

  const [sendReply, { isLoading: sendingDraft }] =
    useSendReplyMutation();

  const [assignTicket, { isLoading: assigningTicket }] =
    useAssignTicketMutation();

  const [addInternalNote, { isLoading: addingNote }] =
    useAddInternalNoteMutation();

  const selectedFromList = selectedTicket
    ? data?.items.find((t) => t.id === selectedTicket.id) ??
      selectedTicket
    : null;
  
  const getAdminName = (id: string) => {
    return adminsData?.items.find((item)=>item.id === id)
  }

  useEffect(() => {
    if (selectedFromList) {
      const aiDraft =
        selectedFromList.aiMeta?.draft?.draft?.trim() ?? "";

      setManualDraft(aiDraft);
      setReplyError("");
      setSelectedAdminId(
        selectedFromList.assigneeId || ""
      );
    } else {
      setManualDraft("");
      setReplyError("");
      setSelectedAdminId("");
    }
  }, [selectedFromList?.aiMeta?.draft?.draft]);

  const draftText =
    selectedFromList?.aiMeta?.draft?.draft?.trim() ?? "";

  const previewDraft = manualDraft || draftText;

  function validateReply(text: string) {
    if (!text.trim()) return "Reply cannot be empty.";
    if (text.trim().length < 3)
      return "Reply must be at least 3 characters.";
    if (text.trim().length > 5000)
      return "Reply must be under 5000 characters.";

    return "";
  }

  async function handleSendReply() {
    if (!selectedFromList) return;

    const text = manualDraft.trim();

    const error = validateReply(text);

    if (error) {
      setReplyError(error);
      return;
    }

    setReplyError("");

    await sendReply({
      ticketId: selectedFromList.id,
      message: text,
    }).unwrap();

    refetch();

    setManualDraft("");
  }

  async function handleAssignTicket() {
    if (!selectedFromList || !selectedAdminId) return;

    await assignTicket({
      ticketId: selectedFromList.id,
      adminId: selectedAdminId,
    }).unwrap();

    refetch();
  }

  async function handleAddInternalNote() {
    if (!selectedFromList || !internalNote.trim()) return;

    await addInternalNote({
      ticketId: selectedFromList.id,
      note: internalNote,
    }).unwrap();

    setInternalNote("");

    refetch();
  }



  console.log(data?.items)

  return (
    <RequireRole role="admin">
      <main className="page">
        <PageHeader
          title="Ticket Queue"
          subtitle="Review author requests and manage support workflows."
        />

    <section
  className="toolbar"
  style={{
    display: "flex",
    flexDirection: "column",

    gap: "12px",
  }}
>
  <div
    style={{
      width:"100%",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    }}
  >
    <label className="field">
      Status

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
      >
        <option value="">All</option>
        <option value="Open">Open</option>
        <option value="In Progress">
          In Progress
        </option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>
    </label>

    <label className="field">
      Priority

      <select
        value={priorityFilter}
        onChange={(e) =>
          setPriorityFilter(e.target.value)
        }
      >
        <option value="">All</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </label>
  </div>

  {/* Second Row */}
  <div
    style={{
              display: "flex",
      justifyContent:"start",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      Assigned To Me

      <input
        type="checkbox"
        checked={assignedToMeOnly}
        onChange={(e) =>
          setAssignedToMeOnly(e.target.checked)
        }
      />
    </label>

    <button
      type="button"
      onClick={() => refetch()}
    >
      Refresh
    </button>
  </div>
</section>

        <section className="card card-elevated">
          {isLoading ? (
            <p className="empty-state">
              Loading queue...
            </p>
          ) : null}

          {isError ? (
            <p
              className="empty-state"
              style={{ color: "var(--danger)" }}
            >
              Failed to load queue.
            </p>
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
                      <th>Assigned To</th>
                      <th>Updated</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.items.map((ticket) => {
                      if (assignedToMeOnly && ticket.assigneeId !== user?.id)
                        return null;
                      return (
                      <tr
                        key={ticket.id}
                        className="clickable"
                        onClick={() =>
                          setSelectedTicket(ticket)
                        }
                      >
                        <td>
                          <strong>{ticket.subject}</strong>
                        </td>

                        <td>
                          <StatusBadge
                            status={ticket.status}
                          />
                        </td>

                        <td>{ticket.category}</td>

                        <td>
                          <PriorityBadge
                            priority={ticket.priority}
                          />
                        </td>

                        <td>
                          {getAdminName(ticket?.assigneeId || "")?.name || "Unassigned"}
                        </td>

                        <td className="muted">
                          {new Date(
                            ticket.updatedAt
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="empty-state">
                No tickets match your filters.
              </div>
            )
          )}
        </section>

        <Modal
          open={!!selectedFromList}
          onClose={() => setSelectedTicket(null)}
          title={
            selectedFromList?.subject ?? "Ticket"
          }
          size="lg"
        >
          {selectedFromList ? (
            <div className="grid">
              <div className="row">
                <StatusBadge
                  status={selectedFromList.status}
                />

                <PriorityBadge
                  priority={selectedFromList.priority}
                />

                <span className="badge badge-closed">
                  {selectedFromList.category}
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedFromList.description}
              </p>

              <TicketImage
                imageUrl={selectedFromList.imageUrl}
                alt={`Attachment for ${selectedFromList.subject}`}
              />

              {/* Assignment */}
              <div className="draft-box">
                <strong>Assign Ticket</strong>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <select
                    value={selectedAdminId}
                    onChange={(e) =>
                      setSelectedAdminId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Admin
                    </option>

                    {adminsData?.items.map((admin) => (
                      <option
                        key={admin.id}
                        value={admin.id}
                      >
                        {admin.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssignTicket}
                    disabled={
                      assigningTicket ||
                      !selectedAdminId
                    }
                  >
                    {assigningTicket
                      ? "Assigning..."
                      : "Assign"}
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
           <div className="draft-box">
  <strong>Internal Notes</strong>

  {/* Existing Notes */}
  <div
    style={{
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    {getTicketMessages(selectedFromList.id)?.map((message: any) => (
      <details
        key={message.ticketId}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {getAdminName(message.senderId)?.name}
          </span>

          <span
            style={{
              fontSize: 12,
              color: "#666",
              marginLeft: 12,
            }}
          >
            {new Date(
              message.createdAt
            ).toLocaleString()}
          </span>
        </summary>

        <div
          style={{
            marginTop: 12,
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {message.message}
        </div>
      </details>
    ))}
  </div>

  {/* Add New Note */}
  <textarea
    placeholder="Add internal admin note..."
    rows={4}
    value={internalNote}
    onChange={(e) =>
      setInternalNote(e.target.value)
    }
    style={{
      width: "100%",
      marginTop: 16,
      resize: "vertical",
    }}
  />

  <button
    type="button"
    style={{ marginTop: 12 }}
    onClick={handleAddInternalNote}
    disabled={
      addingNote ||
      !internalNote.trim()
    }
  >
    {addingNote
      ? "Saving..."
      : "Add Note"}
  </button>
</div>
              {/* Reply Draft */}
              <div className="draft-box">
                <strong
                  style={{
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Reply Draft
                </strong>

                <textarea
                  placeholder="Write your reply here..."
                  rows={8}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    fontFamily: "inherit",
                    marginBottom: 12,
                    borderColor: replyError
                      ? "var(--danger)"
                      : undefined,
                  }}
                  value={manualDraft}
                  onChange={(e) =>
                    setManualDraft(e.target.value)
                  }
                  disabled={sendingDraft}
                />

                {replyError ? (
                  <div
                    style={{
                      color: "var(--danger)",
                      marginBottom: 8,
                    }}
                  >
                    {replyError}
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 2,
                    fontWeight: 500,
                  }}
                >
                  Preview:
                </div>

                <div
                  style={{
                    minHeight: 48,
                    border:
                      "1px solid var(--border)",
                    padding: 8,
                    background:
                      "var(--background-soft)",
                  }}
                >
                  <Markdown>
                    {previewDraft ||
                      "No draft to preview."}
                  </Markdown>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      await updateTicket({
                        ticketId:
                          selectedFromList.id,
                        patch: {
                          status: "In Progress",
                        },
                      }).unwrap();

                      refetch();
                    }}
                    disabled={updating}
                  >
                    In Progress
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await updateTicket({
                        ticketId:
                          selectedFromList.id,
                        patch: {
                          status: "Resolved",
                        },
                      }).unwrap();

                      refetch();
                    }}
                    disabled={updating}
                  >
                    Resolved
                  </button>

                  <button
                    type="button"
                    className="primary"
                    onClick={async () => {
                      await createDraft({
                        ticketId:
                          selectedFromList.id,
                      }).unwrap();

                      await refetch();
                    }}
                    disabled={creatingDraft}
                  >
                    {creatingDraft
                      ? "Generating..."
                      : "Generate Draft"}
                  </button>

                  <button
                    type="button"
                    className="primary"
                    onClick={handleSendReply}
                    disabled={sendingDraft}
                  >
                    {sendingDraft
                      ? "Sending..."
                      : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </main>
    </RequireRole>
  );
}