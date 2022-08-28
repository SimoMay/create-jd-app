import { z } from "zod";

export default z.object({
  PORT: z.string().transform((port) => parseInt(port) ?? 4000),
});