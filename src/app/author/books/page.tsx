"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import RequireRole from "@/components/RequireRole";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/apiError";
import { useGetMyBooksQuery, usePublishBookMutation } from "@/store/api/authorApi";

export default function AuthorBooksPage() {
  const { data, isLoading, isError, refetch } = useGetMyBooksQuery();
  const [publishBookMutation, { isLoading: publishing }] = usePublishBookMutation();

  const [publishOpen, setPublishOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [genre, setGenre] = useState("");
  const [mrp, setMrp] = useState("");
  const [publicationDate, setPublicationDate] = useState("");

  useEffect(() => {
    if (isError) toast.error("Failed to load books.");
  }, [isError]);

  function resetForm() {
    setTitle("");
    setIsbn("");
    setGenre("");
    setMrp("");
    setPublicationDate("");
  }

  async function publish_book(event: FormEvent) {
    event.preventDefault();

    // Basic validation
    const trimmedTitle = title.trim();
    const trimmedIsbn = isbn.trim();
    const trimmedGenre = genre.trim();
    const numMrp = Number(mrp);
    let validationError = "";

    if (!trimmedTitle) {
      validationError = "Title is required.";
    } else if (trimmedTitle.length > 200) {
      validationError = "Title must be 200 characters or less.";
    } else if (!trimmedIsbn) {
      validationError = "ISBN is required.";
    } else if (trimmedIsbn.length > 20) {
      validationError = "ISBN must be 20 characters or less.";
    } else if (!trimmedGenre) {
      validationError = "Genre is required.";
    } else if (trimmedGenre.length > 80) {
      validationError = "Genre must be 80 characters or less.";
    } else if (!mrp) {
      validationError = "MRP is required.";
    } else if (isNaN(numMrp) || numMrp < 0) {
      validationError = "MRP must be a valid non-negative number.";
    }
    // You may want to validate publicationDate format here as well if needed

    if (validationError) {
      toast.info(validationError);
      return;
    }

    try {
      await publishBookMutation({
        title: trimmedTitle,
        isbn: trimmedIsbn,
        genre: trimmedGenre,
        mrp: numMrp,
        publicationDate: publicationDate || undefined,
      }).unwrap();
      toast.info("Book published successfully.");
      resetForm();
      setPublishOpen(false);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to publish book."));
    }
  }

  return (
    <RequireRole role="author">
      <main className="page">
        <PageHeader
          title="My Books"
          subtitle="Publish titles and view royalty performance."
        />

        <section className="card card-elevated">
          {isLoading ? <p className="empty-state">Loading books...</p> : null}
          {isError ? (
            <p className="empty-state" style={{ color: "var(--danger)" }}>
              Failed to load books.
            </p>
          ) : null}

          {!isLoading && !isError && !data?.items?.length ? (
            <div className="empty-state">
              <p>No books published yet.</p>
              {/* <button type="button" className="primary" style={{ marginTop: 12 }} onClick={() => setPublishOpen(true)}>
                Publish your first book
              </button> */}
            </div>
          ) : null}

          {data?.items?.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>ISBN</th>
                    <th>Genre</th>
                    <th>Status</th>
                    <th>MRP</th>
                    <th>Sold</th>
                    <th>Earned</th>
                    <th>Paid</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.title}</strong>
                      </td>
                      <td>{book.isbn}</td>
                      <td>{book.genre}</td>
                      <td>
                        <span className="badge badge-progress">{book.status}</span>
                      </td>
                      <td>₹{book.mrp}</td>
                      <td>{book.totalCopiesSold}</td>
                      <td>₹{book.totalRoyaltyEarned}</td>
                      <td>₹{book.royaltyPaid}</td>
                      <td>₹{book.royaltyPending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <Modal
          open={publishOpen}
          onClose={() => {
            setPublishOpen(false);
            resetForm();
          }}
          title="Publish Book"
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setPublishOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" form="publish-book-form" className="primary" disabled={publishing}>
                {publishing ? "Publishing..." : "Publish Book"}
              </button>
            </>
          }
        >
          <form id="publish-book-form" className="grid" onSubmit={publish_book}>
            <label className="field">
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={1} />
            </label>
            <label className="field">
              ISBN
              <input value={isbn} onChange={(e) => setIsbn(e.target.value)} required minLength={4} maxLength={20} />
            </label>
            <label className="field">
              Genre
              <input value={genre} onChange={(e) => setGenre(e.target.value)} required minLength={1} />
            </label>
            <label className="field">
              MRP (₹)
              <input
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                type="number"
                min={0}
                step="0.01"
                required
              />
            </label>
            <label className="field">
              Publication date
              <input
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                type="date"
              />
            </label>
          </form>
        </Modal>
      </main>
    </RequireRole>
  );
}
