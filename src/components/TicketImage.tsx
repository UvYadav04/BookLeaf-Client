import { resolveMediaUrl } from "@/lib/media";

export default function TicketImage({
  imageUrl,
  alt,
}: {
  imageUrl?: string | null;
  alt: string;
}) {
  const src = resolveMediaUrl(imageUrl);
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="ticket-attachment"
      style={{
        maxWidth: "100%",
        width: "100%",
        maxHeight: 320,
        objectFit: "contain",
        borderRadius: 10,
        border: "1px solid var(--line)",
        background: "#f8fafc",
        marginTop: 12,
      }}
    />
  );
}
