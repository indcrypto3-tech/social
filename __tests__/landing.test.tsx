import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSummary } from "@/components/landing/PricingSummary";
import { Integrations } from "@/components/landing/Integrations";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Mock Framer Motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Landing Page Components", () => {
    it("Hero renders main headline", () => {
        render(<Hero />);
        expect(screen.getByText(/Master Your Social Media/i)).toBeInTheDocument();
        expect(screen.getByText(/Start Free Trial/i)).toBeInTheDocument();
    });

    it("Features section renders feature titles", () => {
        render(<Features />);
        expect(screen.getByText("AI-Powered Scheduling")).toBeInTheDocument();
        expect(screen.getByText("Advanced Analytics")).toBeInTheDocument();
    });

    it("HowItWorks renders steps", () => {
        render(<HowItWorks />);
        expect(screen.getByText("Connect Your Accounts")).toBeInTheDocument();
        expect(screen.getByText("Plan Your Content")).toBeInTheDocument();
    });

    it("Integrations renders brand placeholders", () => {
        render(<Integrations />);
        expect(screen.getByText("Instagram")).toBeInTheDocument();
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("PricingSummary renders plan highlights", () => {
        render(<PricingSummary />);
        expect(screen.getByText("Simple, transparent pricing")).toBeInTheDocument();
        expect(screen.getByText("Starter")).toBeInTheDocument();
    });

    it("Navbar renders logo and links", () => {
        render(<Navbar />);
        expect(screen.getByText("SocialScheduler")).toBeInTheDocument();
        expect(screen.getByText("Pricing")).toBeInTheDocument();
    });

    it("Footer renders copyright and links", () => {
        render(<Footer />);
        expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
        expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
});
