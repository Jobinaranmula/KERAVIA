"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [
  ["/about", "About"],
  ["/journey", "Journey"],
  ["/projects", "Projects"],
  ["/skills", "Skills"],
  ["/services", "Services"],
  ["/gallery", "Gallery"],
  ["/memories", "Memories"],
  ["/interests", "Interests"],
  ["/kerala", "Kerala"],
  ["/contact", "Contact"],
];

export default function Shell({ children, footer, owner }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const glowRef = useRef(null);
  const bgRef = useRef(null);

  // Loading screen
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1100);
    return () => clearTimeout(t);
  }, []);

  // Pointer glow, parallax hills, 3D card tilt, background drift
  useEffect(() => {
    const move = (e) => {
      if (e.pointerType === "touch") return;

      const g = glowRef.current;

      if (g) {
        g.style.left = e.clientX + "px";
        g.style.top = e.clientY + "px";
      }

      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      const a = document.getElementById("l1");
      const b = document.getElementById("l2");

      if (a) {
        a.style.transform = `translate(${x * -30}px,${y * -12}px)`;
      }

      if (b) {
        b.style.transform = `translate(${x * -55}px,${y * -18}px)`;
      }

      const card = e.target.closest && e.target.closest(".tilt");

      if (card) {
        const r = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;

        card.style.transform =
          `rotateY(${cx * 14}deg) rotateX(${-cy * 14}deg) translateZ(8px)`;
      }
    };

    const out = (e) => {
      const card = e.target.closest && e.target.closest(".tilt");
      if (card) card.style.transform = "";
    };

    const scroll = () => {
      if (bgRef.current) {
        bgRef.current.style.backgroundPositionY =
          window.scrollY * 0.15 + "px";
      }
    };

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerout", out);
    window.addEventListener("scroll", scroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  // Page change handling
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);

    try {
      if (sessionStorage.getItem("k")) {
        setEntered(true);
      }
    } catch {}

    const els = Array.from(
      document.querySelectorAll(".rv:not(.in)")
    );

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [path]);

  const welcome = path === "/" && !entered;

  return (
    <div className={welcome ? "welcome" : ""}>
      <div className="bg" ref={bgRef} />
      <div className="glow" ref={glowRef} />

      <div
        className={"ld" + (loaded ? " off" : "")}
        aria-hidden="true"
      >
        <span
          className="serif"
          style={{
            fontSize: 30,
            letterSpacing: ".4em",
            color: "var(--au)",
          }}
        >
          KERAVIA
        </span>
        <i />
      </div>

      <nav>
        <div className="nav-in">
          <Link href="/" className="logo">
            KERAVIA
          </Link>

          <button
            className="burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>

          <div className={"menu" + (open ? " open" : "")}>
            {NAV.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={path === href ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer>
        <b>KERAVIA</b>
        <br />
        {footer}
        <br />
        <br />
        © {new Date().getFullYear()} {owner} ·{" "}
        <Link href="/admin">Admin</Link>
      </footer>
    </div>
  );
}
