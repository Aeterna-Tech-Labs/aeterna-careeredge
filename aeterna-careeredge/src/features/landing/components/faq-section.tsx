"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react";

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

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="page-container">
          <div className="grid gap-8 sm:gap-12 lg:gap-16 lg:grid-cols-[0.75fr_1.25fr]">
            <motion.div
              variants={headerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Frequently asked questions
              </p>

              <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground min-[375px]:text-3xl sm:text-4xl">
                Got questions? We&apos;ve got answers.
              </h2>

              <p className="mt-5 text-sm leading-7 text-secondary-text sm:text-base">
                Find out more about CareerEdge, its tools and how to begin your
                career preparation journey.
              </p>

              <p className="mt-7 text-sm text-secondary-text">
                Still have questions?
              </p>

              <a
                href="#contact"
                className="group mt-2 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Get in touch
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </a>
            </motion.div>

            <motion.div
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="divide-y divide-border border-y border-border"
            >
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const answerId = `faq-answer-${index}`;
                const buttonId = `faq-question-${index}`;

                return (
                  <motion.div
                    key={faq.question}
                    variants={itemVariants}
                    className="py-1"
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="group flex w-full items-center justify-between gap-3 rounded-lg py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-5 sm:py-5"
                      >
                        <span
                          className={`font-heading text-sm font-semibold leading-6 transition-colors duration-200 group-hover:text-primary sm:text-base ${
                            isOpen ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {faq.question}
                        </span>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                            isOpen
                              ? "bg-primary text-white"
                              : "bg-surface-muted text-primary"
                          }`}
                        >
                          <ChevronDown size={17} />
                        </motion.span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={answerId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 pr-6 text-xs leading-6 text-secondary-text sm:pb-5 sm:pr-10 sm:text-sm sm:leading-7">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
