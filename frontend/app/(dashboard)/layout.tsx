
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
            <div className="hidden border-r bg-muted/40 lg:block">
                <Sidebar />
            </div>
            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/5">
                    {children}
                </main>
            </div>
        </div>
    );
}
