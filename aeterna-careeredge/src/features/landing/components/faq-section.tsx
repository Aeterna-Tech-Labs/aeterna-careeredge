"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Aeterna CareerEdge?",
    answer:
      "Aeterna CareerEdge is an AI-powered career and employability platform designed to help students organise their professional profiles, prepare career documents and explore opportunities.",
  },
  {
    question: "Is CareerEdge free to use?",
    answer:
      "CareerEdge is designed to be free to get started. Any additional paid services or features should be clearly communicated before you choose to use them.",
  },
  {
    question: "Do I need to plan to study abroad to use CareerEdge?",
    answer:
      "No. CareerEdge's resume building, LinkedIn preparation, career discovery and employability tools are useful independently of whether you plan to study abroad.",
  },
  {
    question: "Can AI create my resume and personal statement?",
    answer:
      "CareerEdge can help you prepare and improve career documents using AI-assisted guidance. You should always review, edit and verify the content before using it.",
  },
  {
    question: "Will AI add experience or achievements to my profile?",
    answer:
      "CareerEdge is intended to help present your real education, skills and experience. It should not invent qualifications, grades, projects or professional achievements.",
  },
  {
    question: "Can I get help from a counsellor?",
    answer:
      "Additional counsellor guidance may be available if you choose to seek it. Counsellor contact should only happen with your consent.",
  },
  {
    question: "Who can use CareerEdge?",
    answer:
      "CareerEdge is designed for students, graduates and working professionals who want to prepare for career opportunities or explore further education.",
  },
  {
    question: "How do I get started?",
    answer:
      "Start by completing the CareerEdge enquiry form. You can then explore the platform and its career preparation tools as they become available.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Frequently asked questions
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Got questions? We've got answers.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Find out more about CareerEdge, its tools and how to begin your
              career preparation journey.
            </p>

            <p className="mt-7 text-sm text-secondary-text">
              Still have questions?
            </p>

            <a
              href="#contact"
              className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Get in touch
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${index}`;
              const buttonId = `faq-question-${index}`;

              return (
                <div key={faq.question} className="py-1">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className="font-heading text-sm font-semibold leading-6 text-foreground sm:text-base">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "rotate-180 bg-primary text-white"
                            : "bg-surface-muted text-primary"
                        }`}
                      >
                        <ChevronDown size={17} />
                      </span>
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="pb-5 pr-10"
                    >
                      <p className="text-sm leading-7 text-secondary-text">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
