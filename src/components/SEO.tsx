import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    keywords?: string[];
}

const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    keywords = []
}: SEOProps) => {
    const siteTitle = 'Zero Fashion';
    const siteDescription = 'Premium fashion for the modern individual. Timeless elegance meets modern sophistication.';
    const siteUrl = window.location.origin;
    const defaultImage = `${siteUrl}/og-image.png`; // Ensure you have a default OG image

    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || siteDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url ? `${siteUrl}${url}` : window.location.href;
    const metaKeywords = keywords.length > 0
        ? keywords.join(', ')
        : 'premium fashion brand India, online clothing store India, designer wear online India, elegant clothing for men and women, luxury casual wear India, stylish apparel online, Zero Fashion online store, men\'s formal shirts, women\'s dresses online, women\'s kurtis, men\'s premium cotton oversized t-shirt, women\'s ethnic wear, buy premium fashion online India, best elegant clothing brand India, premium fashion Tamil Nadu, online clothing store Madurai';

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
