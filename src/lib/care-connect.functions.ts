import { createServerFn } from "@tanstack/react-start";

export interface DeidentifyResult {
  topic: string;
  body: string;
  changes: string[];
  error?: string;
}

const SYSTEM_PROMPT = `You help paid caregivers post safely in a peer-support community.
Rewrite the caregiver's draft so it contains NO identifying information about anyone receiving care
or their household: no names (replace with "the person I support", "her daughter", etc.), no
addresses or neighbourhoods, no diagnoses or medical conditions, no ages, no employer or agency
names, no dates, times, shift schedules, or appointment details, no photos or links.
Keep the caregiver's own voice, feelings, and the substance of the question. Keep it warm and plain.
Respond with strict JSON only, shaped as:
{"topic": string, "body": string, "changes": string[]}
where "changes" lists short plain-language notes about what you removed or generalised.`;

/** Uses the Lovable AI gateway to strip identifying care-recipient details from a draft post. */
export const deidentifyCareConnectPost = createServerFn({ method: "POST" })
  .inputValidator((input: { topic: string; body: string }) => input)
  .handler(async ({ data }): Promise<DeidentifyResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { topic: data.topic, body: data.body, changes: [], error: "AI review is unavailable." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Topic: ${data.topic}\n\nDraft post: ${data.body}`,
          },
        ],
      }),
    });

    if (response.status === 429) {
      return { topic: data.topic, body: data.body, changes: [], error: "Too many requests right now. Try again in a moment." };
    }
    if (response.status === 402) {
      return { topic: data.topic, body: data.body, changes: [], error: "AI credits are required to review drafts." };
    }
    if (!response.ok) {
      return { topic: data.topic, body: data.body, changes: [], error: "The review could not be completed." };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    const json = content.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(json) as { topic?: string; body?: string; changes?: string[] };
      return {
        topic: parsed.topic?.trim() || data.topic,
        body: parsed.body?.trim() || data.body,
        changes: Array.isArray(parsed.changes) ? parsed.changes.slice(0, 8) : [],
      };
    } catch {
      return { topic: data.topic, body: content.trim() || data.body, changes: [] };
    }
  });
