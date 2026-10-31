import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <section className="pg" style={{ textAlign: "center" }}>
      <h2 className="t">404</h2>
      <div className="orn" />
      <p style={{ marginBottom: 20 }}>ഈ പേജ് കണ്ടെത്താനായില്ല.</p>
      <Link className="btn fill" href="/">Home</Link>
    </section>
  );
}
