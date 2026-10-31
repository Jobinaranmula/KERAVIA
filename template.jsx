// A template remounts on every navigation, which replays the page-transition animation.
export default function Template({ children }) {
  return <div className="pg-wrap">{children}</div>;
}
