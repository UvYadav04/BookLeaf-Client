import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ErrorWithStatus = FetchBaseQueryError | SerializedError | unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractFromDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (isRecord(item) && typeof item.msg === "string") return item.msg;
        return null;
      })
      .filter((msg): msg is string => Boolean(msg));

    if (messages.length) return messages.join(", ");
  }

  if (isRecord(detail) && typeof detail.message === "string") {
    return detail.message;
  }

  return null;
}

export function getApiErrorMessage(error: ErrorWithStatus, fallback = "Something went wrong"): string {
  if (isRecord(error) && "status" in error) {
    const fetchError = error as FetchBaseQueryError;

    if (typeof fetchError.status === "string") {
      if (fetchError.status === "FETCH_ERROR") return "Network error. Please check your connection.";
      if (fetchError.status === "TIMEOUT_ERROR") return "Request timed out. Please try again.";
      if (fetchError.status === "PARSING_ERROR") return "Unexpected server response.";
      return fallback;
    }

    const data = fetchError.data;
    if (typeof data === "string" && data.trim()) return data;

    if (isRecord(data)) {
      const detailMessage = extractFromDetail(data.detail);
      if (detailMessage) return detailMessage;

      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
    }
  }

  if (isRecord(error) && typeof (error as SerializedError).message === "string") {
    const message = (error as SerializedError).message?.trim();
    if (message) return message;
  }

  return fallback;
}
