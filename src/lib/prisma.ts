import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaGksProgramSchema?: PrismaClient;
};
export const db =
  globalForPrisma.prismaGksProgramSchema ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db",
    }),
  });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGksProgramSchema = db;
}
