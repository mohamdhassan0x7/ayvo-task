import { API_URL } from "@/lib/api-client";

export default async function Home() {
  return (
    <main>
      <h1>Frontend is running</h1>
      <p>Backend URL: {API_URL}</p>
    </main>
  );
}
