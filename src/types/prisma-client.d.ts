declare module "@prisma/client" {
  export class PrismaClient {
    userEvent: {
      create(args: { data: { eventType:string; sessionId:string|null; source:string; agentResult:string|null; payload:unknown } }): Promise<unknown>;
      findMany(args?: unknown): Promise<Array<{ eventType:string; source:string; agentResult:string|null; createdAt:Date }>>;
    };
  }
}
