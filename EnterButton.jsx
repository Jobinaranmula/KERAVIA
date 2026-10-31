"use client";

import Link from "next/link";

export default function EnterButton() {
  return (
    <Link
      href="/about"
      className="btn"
      onClick={() => {
        try {
          sessionStorage.setItem("k", "1");
        } catch {}
      }}
    >
      Enter Website
    </Link>
  );
}
