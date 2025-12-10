import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PricingPage from "@/app/(marketing)/pricing/page";
import AboutPage from "@/app/(marketing)/about/page";
import ContactPage from "@/app/(marketing)/contact/page";

// Mock Framer Motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>,
    },
}));

describe("Main Pages", () => {
    describe("Pricing Page", () => {
        it("renders pricing plans", () => {
            render(<PricingPage />);
            expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
            expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
            expect(screen.getByRole("heading", { name: "Agency" })).toBeInTheDocument();
        });

        it("toggles between monthly and yearly billing", () => {
            render(<PricingPage />);
            const yearlyBtn = screen.getByText(/Yearly/i);

            // Initial state (Monthly)
            expect(screen.getAllByText("$29")[0]).toBeInTheDocument(); // Pro monthly is $29

            // Click Yearly
            fireEvent.click(yearlyBtn);

            // Pro yearly / 12 ~ $24 (290/12 = 24.16) - Logic in component is Math.round(290/12) = 24
            // We check for the yearly billing text which appears only when yearly is selected
            expect(screen.getByText(/Billed \$290 yearly/i)).toBeInTheDocument();
        });
    });

    describe("About Page", () => {
        it("renders team members and story", () => {
            render(<AboutPage />);
            expect(screen.getByText("Our Story")).toBeInTheDocument();
            expect(screen.getByText("Meet the Team")).toBeInTheDocument();
            expect(screen.getByText("Alex Chen")).toBeInTheDocument();
        });
    });

    describe("Contact Page", () => {
        it("renders contact form", () => {
            render(<ContactPage />);
            expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            expect(screen.getByText("Send Message")).toBeInTheDocument();
        });

        it("renders contact info", () => {
            render(<ContactPage />);
            expect(screen.getByText("support@socialscheduler.com")).toBeInTheDocument();
            expect(screen.getByText("San Francisco, CA 94103")).toBeInTheDocument();
        });
    });
});
