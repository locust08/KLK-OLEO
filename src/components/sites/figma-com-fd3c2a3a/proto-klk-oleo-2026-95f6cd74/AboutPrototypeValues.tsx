"use client";

import { useState } from "react";

const letters = [
  { letter: "T", color: "text-klk-brand-blue", title: "Teamwork", body: "Going beyond geographical, divisional and functional boundaries to achieve common goals. Collaboration is at the heart of all we do." },
  { letter: "H", color: "text-[#f58220]", title: "Humility", body: "Having an open mind to recognise the strength of others and willingness to stretch ourselves and grow." },
  { letter: "R", color: "text-klk-lime", title: "Results", body: "Committed to exceptional execution and excellence to make a difference in everything we do." },
  { letter: "I", color: "text-klk-brand-pink", title: "Integrity", body: "Ethical leadership with a strong moral compass that inspires every individual to do the right thing." },
  { letter: "I", color: "text-klk-primary", title: "Innovation", body: "Levelling up through new ideas and continuous improvement to consistently exceed expectations." },
  { letter: "L", color: "text-klk-lime", title: "Loyalty", body: "Committed to building a better future together, with mutual trust and care while upholding the Company's interest as our own." },
];

export function AboutPrototypeValues() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <section id="core-values" className="klk-section scroll-mt-28 bg-klk-surface">
      <div className="klk-container">
        <h2 className="klk-h2 mb-8 text-klk-primary">Our Core Values</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {letters.map(({ letter, color, title, body }, index) => (
            <button key={title} type="button" aria-label={title} aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)} className="relative flex min-h-52 items-center justify-center overflow-hidden rounded-sm border border-klk-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-primary lg:min-h-64">
              <span aria-hidden="true" className={`text-[6.875rem] font-bold leading-none transition-opacity duration-150 motion-reduce:transition-none lg:text-[9rem] ${color} ${activeIndex === index ? "opacity-0" : "opacity-100"}`}>{letter}</span>
              <span aria-hidden={activeIndex !== index} className={`absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-klk-primary px-4 py-5 text-white transition-opacity duration-150 motion-reduce:transition-none ${activeIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                <span className="klk-h5 mb-3">{title}</span>
                <span className="klk-body-small">{body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
