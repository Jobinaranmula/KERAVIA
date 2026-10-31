"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Gallery({ items }) {
  const [idx, setIdx] = useState(null);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);

  const close = useCallback(() => {
    setIdx(null);
    setZoom(false);
  }, []);
  const go = useCallback(
    (d) => {
      setZoom(false);
      setIdx((i) => (i === null ? i : (i + d + items.length) % items.length));
    },
    [items.length]
  );

  useEffect(() => {
    if (idx === null) return;
    const key = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [idx, close, go]);

  if (!items.length) return <p className="empty">ഫോട്ടോകളും വീഡിയോകളും ഉടൻ ചേർക്കും.</p>;

  const cur = idx !== null ? items[idx] : null;

  return (
    <>
      <div className="gal">
        {items.map((m, i) => (
          <figure
            key={m.id}
            className="rv"
            tabIndex={0}
            role="button"
            aria-label={m.caption || "Open"}
            onClick={() => setIdx(i)}
            onKeyDown={(e) => (e.key === "Enter" ? setIdx(i) : null)}
          >
            {m.kind === "video" ? (
              <>
                <video src={m.url} muted playsInline preload="metadata" />
                <span className="badge">▶ Video</span>
              </>
            ) : (
              <img src={m.url} alt={m.caption || "Photo"} loading="lazy" />
            )}
            {m.caption ? <figcaption>{m.caption}</figcaption> : null}
          </figure>
        ))}
      </div>

      {cur && (
        <div
          className={"lb" + (zoom ? " zoomed" : "")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => (e.target === e.currentTarget ? close() : null)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null || zoom) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <button className="lb-b lb-x" aria-label="Close" onClick={close}>✕</button>
          {items.length > 1 && (
            <>
              <button className="lb-b lb-p" aria-label="Previous" onClick={() => go(-1)}>‹</button>
              <button className="lb-b lb-n" aria-label="Next" onClick={() => go(1)}>›</button>
            </>
          )}
          <div className="lb-stage" onClick={(e) => (e.target === e.currentTarget ? close() : null)}>
            {cur.kind === "video" ? (
              <video key={cur.id} src={cur.url} controls autoPlay playsInline />
            ) : (
              <img key={cur.id} src={cur.url} alt={cur.caption || "Photo"} onClick={() => setZoom((z) => !z)} />
            )}
          </div>
          <div className="lb-c">
            {cur.caption ? <div>{cur.caption}</div> : null}
            <div style={{ opacity: 0.6, fontSize: 12 }}>{idx + 1} / {items.length}</div>
          </div>
        </div>
      )}
    </>
  );
}
