import Link from "next/link";
import { getSettings } from "@/lib/data";

export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  const s = await getSettings();

  const name = s.owner_name || "Jobin Skariah";
  const intro =
    s.home_intro ||
    "Welcome to my personal world. A place to explore my roots, journey and memories.";

  return (
    <section className="hero pg">
      <div className="hero-content">
        <span className="tag">WELCOME TO MY WORLD</span>

        <h1>
          <span>KERAVIA</span>
        </h1>

        <div className="hero-divider">
          <span>◆</span>
        </div>

        <p className="serif sub">
          MY ROOTS. MY WORLD.
        </p>

        <p className="hero-description">
          {intro}
        </p>

        <p className="hero-owner">{name}</p>

        <div className="hero-actions">
          <Link href="/about" className="btn">
            Explore My World →
          </Link>

          <Link href="/journey" className="btn btn-outline">
            My Journey
          </Link>
        </div>
      </div>

      <div className="home-quick-links">
        <Link href="/about">ABOUT</Link>
        <Link href="/journey">JOURNEY</Link>
        <Link href="/projects">PROJECTS</Link>
        <Link href="/gallery">GALLERY</Link>
        <Link href="/kerala">KERALA</Link>
      </div>
    </section>
  );
}
