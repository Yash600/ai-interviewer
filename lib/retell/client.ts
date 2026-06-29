import "server-only";
import Retell from "retell-sdk";

if (!process.env.RETELL_API_KEY) {
  throw new Error("RETELL_API_KEY environment variable is not set");
}

export const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });
