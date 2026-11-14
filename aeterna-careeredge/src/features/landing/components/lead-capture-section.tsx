
"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";

const cities = [
  "Bengaluru",
  "Mysuru",
  "Belagavi",
  "Other",
];

const statuses = [
  "Final-year student",
  "Graduate",
  "Working professional",
];

const interests = [
  "Study abroad",
  "Jobs",
  "Both",
];

export function LeadCaptureSection() {
  const [submitted, setSubmitted] = useState(false);
  const [requiredConsent, setRequiredConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Demo only: no backend or lead storage is connected yet.
    setSubmitted(true);
  }

  return (
    <section
      id="contact"
      className="bg-background py-20 sm:py-24"
    >
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Take your first step
            </p>

            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your next opportunity starts with one profile.
            </h2>

            <p className="mt-5 text-base leading-7 text-secondary-text">
              Tell us a little about yourself. Start exploring career
              preparation and study opportunities with CareerEdge.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={19} />
                <span className="text-sm text-secondary-text">
                  Free to get started
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={19} />
                <span className="text-sm text-secondary-text">
                  Career and study guidance
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={19} />
                <span className="text-sm text-secondary-text">
                  You choose whether to seek counselling
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-white p-4">
              <LockKeyhole
                size={19}
                className="mt-0.5 shrink-0 text-primary"
              />
              <p className="text-xs leading-5 text-secondary-text">
                Your information should be handled responsibly. We will
                connect this form to the platform's privacy and data
                handling process before collecting real submissions.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            {submitted ? (
              <div
                role="status"
                className="flex min-h-[400px] flex-col items-center justify-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-primary">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="mt-6 font-heading text-2xl font-bold text-foreground">
                  Form demo completed
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-secondary-text">
                  The form interaction works, but it is not connected to
                  a backend yet. No information has been sent or stored.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-background"
                >
                  Back to form
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Start your CareerEdge journey
                  </h3>
                  <p className="mt-2 text-sm text-secondary-text">
                    Share a few details to get started.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="lead-name"
                      className="mb-2 block text-sm font-semibold text-foreground"
                    >
                      Full name <span className="text-error">*</span>
                    </label>
                    <input
                      id="lead-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-mobile"
                      className="mb-2 block text-sm font-semibold text-foreground"
                    >
                      Mobile number <span className="text-error">*</span>
                    </label>

                    <div className="flex overflow-hidden rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <span className="flex items-center border-r border-border bg-surface-muted px-4 text-sm font-semibold text-foreground">
                        +91
                      </span>
                      <input
                        id="lead-mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="10-digit mobile number"
                        pattern="[6-9][0-9]{9}"
                        title="Enter a valid 10-digit Indian mobile number."
                        required
                        className="min-w-0 flex-1 bg-white px-4 py-3 text-sm outline-none placeholder:text-text-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-city"
                      className="mb-2 block text-sm font-semibold text-foreground"
                    >
                      City <span className="text-error">*</span>
                    </label>
                    <select
                      id="lead-city"
                      name="city"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="" disabled>
                        Select your city
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-status"
                      className="mb-2 block text-sm font-semibold text-foreground"
                    >
                      Current status <span className="text-error">*</span>
                    </label>
                    <select
                      id="lead-status"
                      name="status"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="" disabled>
                        Select your current status
                      </option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-interest"
                      className="mb-2 block text-sm font-semibold text-foreground"
                    >
                      What are you interested in?{" "}
                      <span className="text-error">*</span>
                    </label>
                    <select
                      id="lead-interest"
                      name="interest"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="" disabled>
                        Select your interest
                      </option>
                      {interests.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4 border-t border-border pt-5">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="requiredConsent"
                        checked={requiredConsent}
                        onChange={(event) =>
                          setRequiredConsent(event.target.checked)
                        }
                        required
                        className="mt-1 h-4 w-4 shrink-0 accent-[#7a0f1f]"
                      />
                      <span className="text-xs leading-5 text-secondary-text">
                        I agree to the processing of my information for
                        the purpose of responding to my enquiry, as
                        described in the Privacy Policy.{" "}
                        <span className="text-error">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="marketingConsent"
                        checked={marketingConsent}
                        onChange={(event) =>
                          setMarketingConsent(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 shrink-0 accent-[#7a0f1f]"
                      />
                      <span className="text-xs leading-5 text-secondary-text">
                        I would also like to receive optional updates
                        about CareerEdge, career opportunities and
                        events.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!requiredConsent}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Get Started
                    <ArrowRight size={17} />
                  </button>

                  <p className="text-center text-xs leading-5 text-text-muted">
                    Required fields are marked with an asterisk.
                    Optional updates are separate from your enquiry consent.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
