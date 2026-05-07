import { handleLawLookup } from "../tools/static-server.mjs";

export default async function handler(req, res) {
  try {
    await handleLawLookup(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      ok: false,
      status: "server_error",
      note: error?.message || "Law lookup failed",
    }));
  }
}
