"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingFormProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

const industries = [
  { value: "banking", label: "Banking & Payments" },
  { value: "lending", label: "Lending & Credit" },
  { value: "insurance", label: "Insurance" },
  { value: "wealth", label: "Wealth Management" },
  { value: "crypto", label: "Crypto & Web3" },
  { value: "other", label: "Other Financial Services" },
];

const teamSizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

const useCases = [
  { value: "customer-service", label: "AI Customer Service Agents" },
  { value: "fraud-detection", label: "Fraud Detection & Prevention" },
  { value: "trading", label: "Automated Trading Systems" },
  { value: "underwriting", label: "AI Underwriting" },
  { value: "advisory", label: "Financial Advisory Bots" },
  { value: "other", label: "Other" },
];

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companySlug: "",
    industry: "",
    teamSize: "",
    useCase: "",
  });

  const handleCompanyNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, companyName: name, companySlug: slug }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Simulate API call to create company
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would create the company and update the user's companyId
    // For now, we'll just redirect to the dashboard
    router.push("/overview");
  };

  const canProceedStep1 = formData.companyName.length >= 2;
  const canProceedStep2 = formData.industry && formData.teamSize;
  const canSubmit = canProceedStep1 && canProceedStep2 && formData.useCase;

  return (
    <div className="w-full max-w-lg">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < 3 ? "flex-1" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step
                  ? "bg-[var(--primary)] text-white"
                  : s === step
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-alt)] text-[var(--foreground-muted)]"
              }`}
            >
              {s < step ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  s < step ? "bg-[var(--primary)]" : "bg-[var(--card-border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Welcome header */}
      <div className="text-center mb-8">
        {user.image && (
          <img
            src={user.image}
            alt={user.name}
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-[var(--card-border)]"
          />
        )}
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {step === 1 && `Welcome, ${user.name?.split(" ")[0] || "there"}!`}
          {step === 2 && "Tell us about your company"}
          {step === 3 && "How will you use Shield?"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          {step === 1 && "Let's set up your organization"}
          {step === 2 && "This helps us customize your experience"}
          {step === 3 && "We'll configure the best defaults for you"}
        </p>
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {/* Step 1: Company Name */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="Acme Financial"
                className="input text-lg py-3"
                autoFocus
              />
            </div>

            {formData.companySlug && (
              <div className="p-3 bg-[var(--background-alt)] rounded-lg">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Your workspace URL will be:
                </p>
                <p className="text-sm font-mono text-[var(--foreground)]">
                  {formData.companySlug}.shield.lat
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Industry & Team Size */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-3">
                What industry are you in?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: industry.value,
                      }))
                    }
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.industry === industry.value
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {industry.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-3">
                How large is your team?
              </label>
              <div className="space-y-2">
                {teamSizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, teamSize: size.value }))
                    }
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      formData.teamSize === size.value
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {size.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Use Case */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-3">
              What will you primarily use Shield for?
            </label>
            <div className="space-y-3">
              {useCases.map((useCase) => (
                <button
                  key={useCase.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, useCase: useCase.value }))
                  }
                  className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                    formData.useCase === useCase.value
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.useCase === useCase.value
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[var(--card-border)]"
                    }`}
                  >
                    {formData.useCase === useCase.value && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {useCase.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="btn btn-secondary flex-1 py-3"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2)
            }
            className="btn btn-primary flex-1 py-3 disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="btn btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating workspace...
              </span>
            ) : (
              "Launch Shield Console"
            )}
          </button>
        )}
      </div>

      {/* Skip for now */}
      {step === 1 && (
        <p className="text-center text-sm text-[var(--foreground-muted)] mt-4">
          Need help?{" "}
          <a
            href="mailto:support@shield.lat"
            className="text-[var(--primary)] hover:underline"
          >
            Contact support
          </a>
        </p>
      )}
    </div>
  );
}

