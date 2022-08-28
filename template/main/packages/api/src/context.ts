import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
  req,
  res,
});

export type IContext = inferAsyncReturnType<typeof createContext>;