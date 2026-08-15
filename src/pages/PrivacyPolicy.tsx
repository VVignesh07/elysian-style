import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
    return (
        <main className="min-h-screen bg-background">
            <SEO
                title="Privacy Policy | Zero Fashion"
                description="Learn about how Zero Fashion collects, uses, and protects your personal data."
            />
            <Navbar />

            <div className="container mx-auto px-6 py-24 md:py-32 max-w-4xl">
                <div className="space-y-6 mb-16 text-center">
                    <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide uppercase">Privacy Policy</h1>
                    <p className="font-body text-muted-foreground">Last updated: August 2026</p>
                </div>

                <div className="prose prose-zinc max-w-none font-body text-muted-foreground space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. What Personal Data is Collected</h2>
                        <p>At Zero Fashion, we collect information that helps us provide you with a premium shopping experience. This includes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Contact Information:</strong> Name, address, phone number, and email address.</li>
                            <li><strong>Payment Information:</strong> Secure payment details, billing address, and transaction history.</li>
                            <li><strong>Technical Data:</strong> Browsing behavior, IP address, device type, and cookies.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. How Data is Used</h2>
                        <p>We use your personal information strictly for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Order Processing:</strong> To fulfill and deliver your purchases, and provide order updates.</li>
                            <li><strong>Marketing:</strong> To send promotional offers and newsletters (only if you have opted in).</li>
                            <li><strong>Personalization:</strong> To tailor product recommendations and improve your shopping experience.</li>
                            <li><strong>Analytics:</strong> To understand website usage trends and improve our platform.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Third-Party Sharing</h2>
                        <p>We do not sell your personal data. We only share necessary information with trusted partners to operate our business:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Payment Gateways:</strong> For processing secure transactions (e.g., Razorpay, Stripe).</li>
                            <li><strong>Shipping Partners:</strong> To deliver your orders to your address.</li>
                            <li><strong>Analytics Tools:</strong> Such as Google Analytics and Meta Pixel to help us analyze traffic and ad performance.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Data Storage, Security, and Retention</h2>
                        <p>Your data is stored securely using industry-standard encryption and security measures. We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Your Rights (Under DPDP Act 2023)</h2>
                        <p>In accordance with the Digital Personal Data Protection Act of 2023, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                            <li><strong>Correction:</strong> Request corrections to any inaccurate or incomplete data.</li>
                            <li><strong>Deletion:</strong> Request the erasure of your personal data, subject to legal requirements.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">6. Grievance Officer</h2>
                        <p>If you have any questions or concerns regarding your privacy, please contact our Grievance Officer:</p>
                        <div className="bg-muted p-6 rounded-lg mt-4">
                            <p className="font-medium text-foreground">Grievance Officer</p>
                            <p>Email: privacy@zerofashions.in</p>
                            <p>Phone: +91 98765 43210</p>
                            <p>Address: Zero Fashion HQ, Chennai, Tamil Nadu, India</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">7. Policy Updates</h2>
                        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
};

export default PrivacyPolicy;
