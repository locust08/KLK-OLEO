const faqs = [
  {
    question: "How do I find the right ingredient for my formulation?",
    answer: "Start with our Product Finder to explore ingredients by function and application. If you need help narrowing down your options, contact our team with your formulation requirements.",
  },
  {
    question: "What information should I include in a product enquiry?",
    answer: "Tell us about your intended application, the ingredient function you need, and any performance requirements. Including your company and location helps us direct your enquiry to the appropriate team.",
  },
  {
    question: "Where can I find product information and resources?",
    answer: "Visit our Products section for product information and our Resources section for available supporting materials. Contact us if you cannot find the information you need.",
  },
  {
    question: "Can I enquire about samples or technical support?",
    answer: "Yes. Use the Contact Us page to share the product you are interested in and what you would like to evaluate. Our team can discuss your request and the available next steps.",
  },
  {
    question: "How can I contact the KLK OLEO Agrochemicals team?",
    answer: "Submit an enquiry through our Contact Us page. Include a brief description of your question so we can connect you with the appropriate team.",
  },
];

export function HomeFaq() {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <p className="eyebrow">FAQ</p>
      <h2 id="home-faq-title">Frequently Asked Questions</h2>
      <div className="home-faq__list">
        {faqs.map(({ question, answer }, index) => (
          <details className="home-faq__item" key={question} name="home-faq" open={index === 0}>
            <summary>
              <span>{question}</span>
              <span className="home-faq__icon" aria-hidden="true" />
            </summary>
            <p className="home-faq__answer">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
