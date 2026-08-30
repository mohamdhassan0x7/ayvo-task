import { API_URL } from "@/lib/api";

// Minimal connection check to the NestJS backend.
// No UI components on purpose — this project is a starting skeleton.
async function getBackendStatus() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export default async function Home() {
  const status = await getBackendStatus();

  return (
    <main>
      <h1>Frontend is running</h1>
      <p>Backend URL: {API_URL}</p>
      <pre>{JSON.stringify(status, null, 2)}</pre>
      <div>dasdas</div>
    </main>
  );
}
