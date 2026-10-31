import PageHead from "@/components/PageHead";

export const metadata = {
  title: "About Me",
};

export default function AboutPage() {
  return (
    <section className="pg">
      <PageHead
        title="About Me"
        intro="A little story about who I am."
      />

      <div className="about-content">
        <h2>MY ROOTS. MY WORLD.</h2>

        <p>
          Welcome to my personal space.
          This is where I share my journey,
          interests, projects and the things
          that inspire me.
        </p>

        <p>
          Every journey has a story.
          This is mine.
        </p>
      </div>
    </section>
  );
}
