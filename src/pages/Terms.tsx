import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Terms = () => {
    return (
        <main className="min-h-screen bg-background">
            <SEO
                title="Terms and Conditions | Zero Fashion"
                description="Terms and Conditions for using the Zero Fashion website."
            />
            <Navbar />

            <div className="container mx-auto px-6 py-24 md:py-32 max-w-4xl">
                <div className="space-y-6 mb-16 text-center">
                    <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide uppercase">Terms and Conditions</h1>
                    <p className="font-body text-muted-foreground">Last updated: August 2026</p>
                </div>

                <div className="prose prose-zinc max-w-none font-body text-muted-foreground space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Website Use & Account Registration</h2>
                        <p>By accessing or using the Zero Fashion website, you agree to comply with these Terms and Conditions. You may need to register an account to use certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Product Listings, Pricing & Availability</h2>
                        <p>All product descriptions, prices, and availability are subject to change without notice. We make every effort to display accurate colors and details, but cannot guarantee your device's display will accurately reflect the actual product. Zero Fashion reserves the right to correct any errors in pricing or descriptions.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Orders, Payments & Cancellation</h2>
                        <p>By placing an order, you agree to provide accurate and complete information. Orders are confirmed only upon receipt of full payment. Zero Fashion reserves the right to cancel any order if the product is unavailable or if fraudulent activity is suspected. You may cancel your order before it has been processed for shipping.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Shipping & Delivery</h2>
                        <p>We strive to process and ship all orders promptly. Delivery timelines vary based on location and shipping method selected at checkout. Zero Fashion is not liable for delays caused by external logistics partners or unforeseen circumstances.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Returns, Refunds & Exchanges</h2>
                        <p>If you are not entirely satisfied with your purchase, you may request a return or exchange within the stipulated timeframe mentioned in our Returns Policy. Items must be unused, unwashed, and in their original condition with all tags attached. Refunds will be processed to the original payment method after inspection.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">6. Intellectual Property</h2>
                        <p>All content on this website, including but not limited to the Zero Fashion brand name, logo, images, text, and graphics, is the exclusive property of Zero Fashion and is protected by intellectual property laws. Unauthorized reproduction or use is strictly prohibited.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">7. Limitation of Liability</h2>
                        <p>To the fullest extent permitted by law, Zero Fashion shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the website or the purchase of our products.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">8. Governing Law & Jurisdiction</h2>
                        <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu.</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
};

export default Terms;
