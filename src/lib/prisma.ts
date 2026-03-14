// Prisma client singleton for database access.
// Requires a PostgreSQL adapter to be configured when connecting to a real database.
// See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration
//
// Example with @prisma/adapter-pg:
//   import { PrismaPg } from "@prisma/adapter-pg";
//   import { PrismaClient } from "@/generated/prisma/client";
//   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
//   export const prisma = new PrismaClient({ adapter });

export {};
