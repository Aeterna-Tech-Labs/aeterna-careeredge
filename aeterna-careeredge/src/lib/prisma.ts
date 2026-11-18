// src/lib/prisma.ts
// Compatibility export for db client
import { db } from "./db";
export const prisma = db;
export { db };
