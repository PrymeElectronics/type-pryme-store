export default function SetupNotice() {
  return (
    <main style={{ maxWidth: 560, margin: "15vh auto", padding: 24 }}>
      <h1>Almost live</h1>
      <p>The store database isn't connected yet. In Vercel, open your project, go to Storage, and connect Upstash Redis. Then redeploy.</p>
    </main>
  );
}
