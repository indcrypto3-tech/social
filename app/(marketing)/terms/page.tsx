export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen pt-32 pb-24">
            <div className="container px-4 mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="lead text-lg text-muted-foreground mb-8">
                        Last updated: October 27, 2023
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground mb-4">
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground mb-4">
                            SocialScheduler provides users with tools for scheduling and managing social media content. You are responsible for obtaining access to the Service and that access may involve third party fees (such as Internet service provider or airtime charges).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Registration and Account Security</h2>
                        <p className="text-muted-foreground mb-4">
                            In consideration of your use of the Service, you agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the Service's registration form; and (b) maintain and promptly update the Registration Data to keep it true, accurate, current and complete.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
                        <p className="text-muted-foreground mb-4">
                            You agree to not use the Service to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable;</li>
                            <li>Harm minors in any way;</li>
                            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity;</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
                        <p className="text-muted-foreground mb-4">
                            You agree that SocialScheduler may, under certain circumstances and without prior notice, immediately terminate your account and access to the Service. Cause for such termination shall include, but not be limited to, (a) breaches or violations of the Terms or other incorporated agreements or guidelines, (b) requests by law enforcement or other government agencies, (c) a request by you (self-initiated account deletions).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
                        <p className="text-muted-foreground">
                            YOU EXPRESSLY UNDERSTAND AND AGREE THAT YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. SOCIALSCHEDULER EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
