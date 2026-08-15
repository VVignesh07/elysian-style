import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const CookiePolicy = () => {
    return (
        <main className="min-h-screen bg-background">
            <SEO
                title="Cookie Policy | Zero Fashion"
                description="Learn about how Zero Fashion uses cookies to improve your browsing experience."
            />
            <Navbar />

            <div className="container mx-auto px-6 py-24 md:py-32 max-w-4xl">
                <div className="space-y-6 mb-16 text-center">
                    <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide uppercase">Cookie Policy</h1>
                    <p className="font-body text-muted-foreground">Last updated: August 2026</p>
                </div>

                <div className="prose prose-zinc max-w-none font-body text-muted-foreground space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies?</h2>
                        <p>Cookies are small text files placed on your device (computer, smartphone, or tablet) when you visit our website. They help us remember your preferences, understand how you interact with our site, and ensure our website functions correctly, providing you with a seamless and personalized shopping experience.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Categories of Cookies We Use</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong>Essential Cookies:</strong> Strictly necessary for the website to function. They enable core features like navigating pages, accessing secure areas, and managing your shopping cart. You cannot opt out of these cookies.</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance and design.</li>
                            <li><strong>Preference Cookies:</strong> Allow our website to remember choices you make, such as your preferred language or the region you are in, providing enhanced and personalized features.</li>
                            <li><strong>Marketing/Advertising Cookies:</strong> Used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user, making them more valuable for publishers and third-party advertisers.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Third-Party Cookies</h2>
                        <p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These third parties include:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Google Analytics:</strong> For tracking website traffic and user behavior.</li>
                            <li><strong>Meta/Facebook Pixel:</strong> For tracking ad conversions and building targeted audiences.</li>
                            <li><strong>Payment Gateways:</strong> To ensure secure and authenticated transactions during checkout.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Managing Your Cookies</h2>
                        <p>You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences through your web browser settings. Most browsers allow you to block or delete cookies entirely. However, please note that if you choose to disable essential cookies, some parts of our website may not function properly.</p>
                        <p>For more information on how to manage cookies, please visit the help pages of your specific web browser (e.g., Chrome, Safari, Firefox, Edge).</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Consent</h2>
                        <p>When you first visit our website, we present you with a cookie consent banner. By clicking "Accept" or continuing to use our website, you agree to our use of cookies as described in this policy.</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
};

export default CookiePolicy;
