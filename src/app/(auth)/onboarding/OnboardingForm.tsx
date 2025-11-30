"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";

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
  const [step, setStep] = useState(0); // 0 = company list, 1-3 = creation steps
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCompanies, setExistingCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState({
    companyName: "",
    companySlug: "",
    industry: "",
    teamSize: "",
    useCase: "",
  });

  // Fetch existing companies on load
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          setExistingCompanies(data.companies || []);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const handleCompanyNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, companyName: name, companySlug: slug }));
    setError(null);
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, companySlug: cleanSlug }));
    setError(null);
  };

  const handleSelectCompany = (company: Company) => {
    router.push(`/${company.slug}/overview`);
  };

  const handleCreateNewCompany = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          companySlug: formData.companySlug,
          industry: formData.industry,
          teamSize: formData.teamSize,
          useCase: formData.useCase,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create company");
        setIsSubmitting(false);
        return;
      }

      // Redirect to the new company's dashboard
      router.push(data.redirectUrl || `/${formData.companySlug}/overview`);
    } catch (err) {
      console.error("Error creating company:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 =
    formData.companyName.length >= 2 && formData.companySlug.length >= 2;
  const canProceedStep2 = formData.industry && formData.teamSize;
  const canSubmit = canProceedStep1 && canProceedStep2 && formData.useCase;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-lg flex flex-col items-center justify-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-[var(--primary)]"
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
        <p className="mt-4 text-[var(--foreground-muted)]">
          Loading your workspaces...
        </p>
      </div>
    );
  }

  // Step 0: Company Selection (if user has existing companies)
  if (step === 0) {
    return (
      <div className="w-full max-w-lg">
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
            Welcome back, {user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-[var(--foreground-muted)] mt-2">
            {existingCompanies.length > 0
              ? "Select a workspace or create a new one"
              : "Let's set up your first workspace"}
          </p>
        </div>

        {/* Existing companies list */}
        {existingCompanies.length > 0 && (
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-[var(--foreground-muted)]">
              Your workspaces
            </label>
            {existingCompanies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => handleSelectCompany(company)}
                className="w-full p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[var(--foreground)]">
                    {company.name}
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    console.shield.lat/{company.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      company.plan === "free"
                        ? "badge-status-degraded"
                        : "badge-status-healthy"
                    }`}
                  >
                    {company.plan}
                  </span>
                  <svg
                    className="w-5 h-5 text-[var(--foreground-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create new workspace button */}
        <button
          type="button"
          onClick={handleCreateNewCompany}
          className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-3 ${
            existingCompanies.length > 0
              ? "border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              : "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="font-medium">
            {existingCompanies.length > 0
              ? "Create new workspace"
              : "Create your first workspace"}
          </span>
        </button>

        {existingCompanies.length > 0 && (
          <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
            You're part of {existingCompanies.length} workspace
            {existingCompanies.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    );
  }

  // Steps 1-3: Company Creation Flow
  return (
    <div className="w-full max-w-lg">
      {/* Back to workspace list */}
      {existingCompanies.length > 0 && step > 0 && (
        <button
          type="button"
          onClick={() => setStep(0)}
          className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
        >
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to workspaces
        </button>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center ${s < 3 ? "flex-1" : ""}`}>
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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {step === 1 && "Create your workspace"}
          {step === 2 && "Tell us about your company"}
          {step === 3 && "How will you use Shield?"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          {step === 1 && "Choose a name and URL for your team"}
          {step === 2 && "This helps us customize your experience"}
          {step === 3 && "We'll configure the best defaults for you"}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 bg-[var(--risk-critical-bg)] border border-[var(--risk-critical)] rounded-lg">
          <p className="text-sm text-[var(--risk-critical-text)]">{error}</p>
        </div>
      )}

      {/* Step content */}
      <div className="space-y-6">
        {/* Step 1: Company Name & Slug */}
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

            <div>
              <label
                htmlFor="companySlug"
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Workspace URL
              </label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-3 bg-[var(--background-alt)] border border-r-0 border-[var(--card-border)] rounded-l-lg text-sm text-[var(--foreground-muted)]">
                  console.shield.lat/
                </span>
                <input
                  id="companySlug"
                  type="text"
                  value={formData.companySlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="acme"
                  className="input rounded-l-none flex-1"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>

            {formData.companySlug && (
              <div className="p-4 bg-[var(--background-alt)] rounded-lg border border-[var(--card-border)]">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">
                  Your workspace will be available at:
                </p>
                <p className="text-base font-mono text-[var(--primary)] font-medium">
                  console.shield.lat/{formData.companySlug}
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
            disabled={isSubmitting}
            className="btn btn-secondary flex-1 py-3 disabled:opacity-50"
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
            disabled={!canSubmit || isSubmitting}
            className="btn btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {isSubmitting ? (
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

      {/* Help link */}
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
