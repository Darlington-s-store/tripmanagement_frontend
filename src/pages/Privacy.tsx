import Layout from "@/components/layout/Layout";

const Privacy = () => {
    return (
        <Layout>
            <section className="bg-gradient-primary py-16 text-primary-foreground">
                <div className="container">
                    <h1 className="font-display text-4xl font-bold md:text-5xl">Privacy Policy</h1>
                    <p className="mt-4 text-lg text-primary-foreground/90">Last updated: March 1, 2026</p>
                </div>
            </section>

            <section className="py-16">
                <div className="container max-w-4xl">
                    <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary">
                        <h2>1. Introduction</h2>
                        <p>
                            TripEase Ghana ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by TripEase Ghana.
                        </p>
                        <p>
                            This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, TripEase Ghana. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <p>We collect information from you when you visit our service, register, place an order, subscribe to our newsletter, respond to a survey or fill out a form.</p>
                        <ul>
                            <li><strong>Personal Data:</strong> Name / Username, Email address, Phone number, Password</li>
                            <li><strong>Billing Information:</strong> We use third-party payment processors like Paystack and Stripe. We do not store your full credit card details on our servers.</li>
                            <li><strong>Usage Data:</strong> We may collect information about how the Service is accessed and used.</li>
                        </ul>

                        <h2>3. How We Use the Information We Collect</h2>
                        <p>Any of the information we collect from you may be used in one of the following ways:</p>
                        <ul>
                            <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
                            <li>To improve our website in order to better serve you.</li>
                            <li>To allow us to better service you in responding to your customer service requests.</li>
                            <li>To quickly process your booking transactions.</li>
                            <li>To send periodic emails regarding your order or other products and services.</li>
                        </ul>

                        <h2>4. Information Sharing</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide you with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                        </p>

                        <h2>5. Data Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our payment gateway providers database.
                        </p>

                        <h2>6. Your Rights</h2>
                        <p>
                            If you are from certain territories (such as the EEA), you have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
                        </p>

                        <h2>7. Contact Us</h2>
                        <p>If there are any questions regarding this privacy policy, you may contact us using the information below.</p>
                        <p>
                            <strong>Email:</strong> privacy@tripease.gh<br />
                            <strong>Address:</strong> 12 Independence Avenue, Ridge, Accra, Ghana
                        </p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Privacy;
