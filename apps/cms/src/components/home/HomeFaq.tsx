import type { EditorialSection } from "@/lib/content/model";
export function HomeFaq({ section }: { section: EditorialSection }) {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <p className="eyebrow">{section.eyebrow}</p>
      <h2 id="home-faq-title">{section.heading}</h2>
      <div className="home-faq__list">
        {(section.items ?? []).map(
          ({ heading: question, body: answer }, index) => (
            <details
              className="home-faq__item"
              key={question}
              name="home-faq"
              open={index === 0}
            >
              <summary>
                <span>{question}</span>
                <span className="home-faq__icon" aria-hidden="true" />
              </summary>
              <p className="home-faq__answer">{answer}</p>
            </details>
          ),
        )}
      </div>
    </section>
  );
}
