/**
 * Shared SSE event schema for AI streaming.
 * Used by both server-side SSE routes and client-side stream consumers.
 */

// ---------------------------------------------------------------------------
// StreamEvent discriminated union
// ---------------------------------------------------------------------------

export type StreamEvent =
  | { type: "start"; seq: number; meta?: { requestId: string } }
  | { type: "token"; seq: number; delta: string }
  | { type: "done"; seq: number; finalText?: string }
  | {
      type: "error";
      seq: number;
      code: string;
      message: string;
      retriable: boolean;
    }
  | { type: "heartbeat"; seq: number; ts: number };

// ---------------------------------------------------------------------------
// Serialization (server → client)
// ---------------------------------------------------------------------------

/**
 * Serialize a StreamEvent to the SSE wire format:
 *   event: {type}\n
 *   data: {json}\n
 *   \n
 */
export function serializeStreamEvent(e: StreamEvent): string {
  return `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`;
}

// ---------------------------------------------------------------------------
// Parsing (client-side)
// ---------------------------------------------------------------------------

/**
 * Parse a raw SSE message block (the text between double newlines) back into
 * a StreamEvent.  Returns `null` if the block cannot be parsed.
 *
 * Expected input format (one block):
 *   "event: token\ndata: {...}"
 */
export function parseStreamEvent(raw: string): StreamEvent | null {
  if (!raw || typeof raw !== "string") return null;

  const lines = raw.split("\n");

  let eventType: string | undefined;
  let dataLine: string | undefined;

  for (const line of lines) {
    if (line.startsWith("event: ")) {
      eventType = line.slice("event: ".length).trim();
    } else if (line.startsWith("data: ")) {
      dataLine = line.slice("data: ".length).trim();
    }
  }

  if (!eventType || !dataLine) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(dataLine);
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("type" in parsed) ||
    !("seq" in parsed)
  ) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate that the parsed type matches the event field
  if (obj.type !== eventType) return null;

  // Type-narrow to the correct variant
  switch (eventType) {
    case "start": {
      const meta =
        typeof obj.meta === "object" && obj.meta !== null
          ? (obj.meta as { requestId?: unknown })
          : undefined;
      return {
        type: "start",
        seq: obj.seq as number,
        ...(meta && typeof meta.requestId === "string"
          ? { meta: { requestId: meta.requestId } }
          : {}),
      };
    }
    case "token": {
      if (typeof obj.delta !== "string") return null;
      return { type: "token", seq: obj.seq as number, delta: obj.delta };
    }
    case "done": {
      return {
        type: "done",
        seq: obj.seq as number,
        ...(typeof obj.finalText === "string"
          ? { finalText: obj.finalText }
          : {}),
      };
    }
    case "error": {
      if (
        typeof obj.code !== "string" ||
        typeof obj.message !== "string" ||
        typeof obj.retriable !== "boolean"
      ) {
        return null;
      }
      return {
        type: "error",
        seq: obj.seq as number,
        code: obj.code,
        message: obj.message,
        retriable: obj.retriable,
      };
    }
    case "heartbeat": {
      if (typeof obj.ts !== "number") return null;
      return { type: "heartbeat", seq: obj.seq as number, ts: obj.ts };
    }
    default:
      return null;
  }
}
