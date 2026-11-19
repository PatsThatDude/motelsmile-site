// Serve audio with proper byte-range support so the record player can seek and scratch.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const res = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));
  if (!res.ok) return res;
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const type = res.headers.get("Content-Type") || "audio/mpeg";
  const base = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400" };
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get("Range") || "");
  if (!m) return new Response(request.method === "HEAD" ? null : buf, { status: 200, headers: { ...base, "Content-Length": String(size) } });
  let start = m[1] === "" ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  let end = m[1] !== "" && m[2] !== "" ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${size}` } });
  return new Response(request.method === "HEAD" ? null : buf.slice(start, end + 1), { status: 206,
    headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
}
