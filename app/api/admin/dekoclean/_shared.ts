import { ParticipantAccessError, participantAccessResponse, requireAdminSession } from "../../../../lib/auth/participantAccess";

export async function withDekoCleanAdmin<T>(handler: (adminReference: string) => Promise<T>, options: { exposeDomainErrors?: boolean } = {}): Promise<Response> {
  try {
    const session = await requireAdminSession();
    const result = await handler(session.email ?? session.name ?? "admin-session");
    return Response.json(result);
  } catch (error) {
    if (options.exposeDomainErrors && error instanceof Error && !(error instanceof ParticipantAccessError)) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return participantAccessResponse(error);
  }
}

export function readStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) throw new Error(`${name} must be a string array.`);
  return value;
}
