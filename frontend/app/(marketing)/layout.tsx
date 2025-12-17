import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isWaitlistMode = process.env.LAUNCH === 'OFF';

    return (
        <>
            <Navbar inWaitlistMode={isWaitlistMode} />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
