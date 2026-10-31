import PageHead from "@/components/PageHead";

export const metadata = {
  title: "Contact Me",
};

export default function ContactPage() {
  return (
    <section className="pg">
      <PageHead
        title="Get In Touch"
        intro="Let's connect and share ideas."
      />

      <div className="contact-content">
        <p>
          Have a project in mind or just want to say hello?
          Feel free to connect with me.
        </p>

        <div className="contact-links">
          <a
            href="https://www.instagram.com/jobin_skariah/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://github.com/Jobinaranmula"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
