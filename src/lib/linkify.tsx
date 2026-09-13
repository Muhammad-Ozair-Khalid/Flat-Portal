import { Fragment } from "react";

// Split on http/https URLs. React escapes all text nodes, so user content is
// never rendered as HTML — this only turns real URLs into safe external links.
const URL_RE = /(https?:\/\/[^\s<]+)/g;
const isUrl = (s: string) => /^https?:\/\//i.test(s);

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
