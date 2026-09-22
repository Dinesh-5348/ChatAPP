import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <p className="eyebrow">Todo app</p>
        <h1>Make space for the next thing.</h1>
        <p className="muted">A quiet, private place for your tasks. Start with an Inbox and build from there.</p>
        <div className="landing-actions">
          <Link className="primary-link" href="/register">Create an account</Link>
          <Link className="secondary-link" href="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}
