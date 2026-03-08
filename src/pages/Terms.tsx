import Layout from "@/components/layout/Layout";

const Terms = () => {
    return (
        <Layout>
            <section className="bg-gradient-primary py-16 text-primary-foreground">
                <div className="container">
                    <h1 className="font-display text-4xl font-bold md:text-5xl">Terms of Service</h1>
                    <p className="mt-4 text-lg text-primary-foreground/90">Last updated: March 1, 2026</p>
                </div>
            </section>

            <section className="py-16">
                <div className="container max-w-4xl">
                    <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary">
                        <h2>1. Agreement to Terms</h2>
                        <p>
                            By accessing or using TripEase Ghana's platform, website, and services (collectively "Services"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
                        </p>

                        <h2>2. Use of Services</h2>
                        <p>
                            You must provide accurate and complete information when creating an account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                        </p>
                        <p>
                            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>

                        <h2>3. Bookings and Payments</h2>
                        <ul>
                            <li><strong>Pricing:</strong> All prices listed on the platform are subject to change without notice. Prices confirmed at the time of booking are final.</li>
                            <li><strong>Payments:</strong> Payments for bookings are processed securely through our payment partners. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the platform.</li>
                            <li><strong>Cancellations:</strong> Cancellation policies vary depending on the specific hotel, guide, or activity provider. Please review the cancellation policy associated with your specific booking before confirming.</li>
                        </ul>

                        <h2>4. Provider Obligations</h2>
                        <p>
                            If you register as a Provider (hotel, guide, transport), you agree to provide services as described in your listings. You are responsible for keeping your availability and pricing accurate and up to date. You must maintain appropriate licenses and insurance as required by Ghanaian law.
                        </p>

                        <h2>5. Reviews and Content</h2>
                        <p>
                            Our Service allows you to post reviews, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>

                        <h2>6. Intellectual Property</h2>
                        <p>
                            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of TripEase Ghana and its licensors. The Service is protected by copyright, trademark, and other laws of both the Republic of Ghana and foreign countries.
                        </p>

                        <h2>7. Limitation of Liability</h2>
                        <p>
                            In no event shall TripEase Ghana, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>

                        <h2>8. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us.</p>
                        <p>
                            <strong>Email:</strong> legal@tripease.gh<br />
                            <strong>Address:</strong> 12 Independence Avenue, Ridge, Accra, Ghana
                        </p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Terms;
