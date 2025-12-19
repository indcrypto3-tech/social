import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border/40">
            <div className="container mx-auto px-4 py-12 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image src="/logo-icon-dark.svg" alt="Autopostr Logo" fill className="object-contain dark:hidden" />
                                <Image src="/logo-icon-light.svg" alt="Autopostr Logo" fill className="object-contain hidden dark:block" />
                            </div>
                            Autopostr
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                            The ultimate social media scheduling tool for creators and agencies. Automate your growth today with AI-powered insights.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Product</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
                            <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/40 gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Autopostr. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Link href="#" className="hover:text-foreground hover:bg-muted p-2 rounded-full transition-all"><Twitter size={18} /></Link>
                        <Link href="#" className="hover:text-foreground hover:bg-muted p-2 rounded-full transition-all"><Instagram size={18} /></Link>
                        <Link href="#" className="hover:text-foreground hover:bg-muted p-2 rounded-full transition-all"><Linkedin size={18} /></Link>
                        <Link href="#" className="hover:text-foreground hover:bg-muted p-2 rounded-full transition-all"><Github size={18} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
