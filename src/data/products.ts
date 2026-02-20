import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    images: string[];
    description: string;
    details: string[];
    rating: number;
    reviews: number;
    badge?: "Sale" | "New" | null;
    sizes?: string[];
    colors?: string[];
    category: string;
    featured?: boolean;
}

export const productsData: Product[] = [
    {
        id: 1,
        name: "Cashmere Crew Sweater",
        price: 15999,
        originalPrice: 21999,
        image: product1,
        images: [product1, product1, product1], // Placeholders for now
        description: "Indulge in the ultimate luxury with our signature Cashmere Crew Sweater. Crafted from 100% sustainably sourced Mongolian cashmere, this piece offers unparalleled softness and warmth without the weight. The classic crew neckline and relaxed fit make it a versatile staple for any wardrobe.",
        details: ["100% Cashmere", "Ethically sourced", "Hand wash cold", "True to size"],
        rating: 4.8,
        reviews: 124,
        badge: "Sale",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Beige", "Charcoal", "Navy"],
        category: "Men"
    },
    {
        id: 2,
        name: "Tailored Wool Overcoat",
        price: 36500,
        image: product3,
        images: [product3, product3, product3],
        description: "Exude sophistication in our meticulously tailored wool overcoat. Designed with a clean silhouette and sharp lapels, this coat is constructed from a premium wool blend that provides exceptional structure and insulation. Finished with horn buttons and a silk-blend lining.",
        details: ["Premium Wool Blend", "Satin Lining", "Dry clean only", "Classic Fit"],
        rating: 4.9,
        reviews: 86,
        badge: "New",
        sizes: ["46", "48", "50", "52", "54"],
        colors: ["Camel", "Black", "Grey"],
        category: "Men"
    },
    {
        id: 3,
        name: "Minimal Leather Sneakers",
        price: 12999,
        image: product4,
        images: [product4, product4, product4],
        description: "The epitome of understated elegance. These minimal sneakers are handcrafted in Italy from buttery-soft Nappa leather. Featuring a clean monochrome design and a durable margom rubber sole, they transition seamlessly from formal trousers to casual denim.",
        details: ["Nappa Leather", "Italian Craftsmanship", "Rubber Sole", "Lace-up"],
        rating: 4.7,
        reviews: 215,
        badge: null,
        sizes: ["39", "40", "41", "42", "43", "44", "45"],
        colors: ["White", "Black"],
        category: "Footwear"
    },
    {
        id: 4,
        name: "Linen Oxford Shirt",
        price: 7500,
        image: product5,
        images: [product5, product5, product5],
        description: "Stay cool and composed in our breathable linen Oxford shirt. Pre-washed for a soft, lived-in feel from the first wear. The natural texture of the linen provides a relaxed yet refined aesthetic, perfect for warm-weather tailoring or weekend escapes.",
        details: ["100% Linen", "Button-down Collar", "Garment Dyed", "Breathable"],
        rating: 4.6,
        reviews: 142,
        badge: "New",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Blue", "Olive"],
        category: "Men"
    },
    {
        id: 5,
        name: "Classic Silk Scarf",
        price: 4999,
        originalPrice: 6999,
        image: product1,
        images: [product1, product1, product1],
        description: "Add a touch of timeless elegance with our classic silk scarf. Printed on heavyweight mulberry silk, this piece features an archival-inspired motif and hand-rolled edges. A versatile accessory that elevates any ensemble.",
        details: ["100% Mulberry Silk", "Hand-rolled Edges", "Archival Print", "50x50cm"],
        rating: 4.8,
        reviews: 98,
        badge: "Sale",
        colors: ["Multi"],
        category: "Accessories"
    },
    {
        id: 6,
        name: "Structured Wool Blazer",
        price: 18500,
        image: product3,
        images: [product3, product3, product3],
        description: "A modern essential, this structured wool blazer is tailored for a sharp, feminine silhouette. Featuring a single-button closure and peaked lapels, it's crafted from premium Italian wool capable of transitioning from boardroom to evening effortlessly.",
        details: ["Italian Wool", "Structured Fit", "Single Button", "Lined"],
        rating: 4.9,
        reviews: 45,
        badge: "New",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Cream", "Navy"],
        category: "Women"
    },
    {
        id: 7,
        name: "Silk Slip Dress",
        price: 14200,
        image: product4,
        images: [product4, product4, product4],
        description: "Fluid and feminine, our silk slip dress drapes beautifully against the body. Cut on the bias for a flattering fit, it features delicate spaghetti straps and a midi length. An understated luxury piece perfect for layering or wearing solo.",
        details: ["100% Silk Satin", "Bias Cut", "Midi Length", "Adjustable Straps"],
        rating: 4.7,
        reviews: 112,
        badge: null,
        sizes: ["XS", "S", "M", "L"],
        colors: ["Champagne", "Black", "Red"],
        category: "Women"
    },
    {
        id: 8,
        name: "Leather Tote Bag",
        price: 22000,
        image: product5,
        images: [product5, product5, product5],
        description: "Function meets form in this spacious leather tote. Handcrafted from full-grain leather that ages beautifully, it features a minimalist design with ample room for your daily essentials, including a 13-inch laptop.",
        details: ["Full-grain Leather", "Magnetic Closure", "Interior Pocket", "Dust bag included"],
        rating: 4.9,
        reviews: 67,
        badge: null,
        colors: ["Tan", "Black", "Olive"],
        category: "Accessories"
    },
    {
        id: 9,
        name: "Pleated Midi Skirt",
        price: 8900,
        originalPrice: 11500,
        image: product1,
        images: [product1, product1, product1],
        description: "Elegant and versatile, this pleated midi skirt moves with you. Crafted from a high-quality crepe fabric, it sits high on the waist and falls to a sophisticated midi length. Pairs perfectly with our cashmere knits or silk blouses.",
        details: ["Crepe Fabric", "High Waisted", "Permanent Pleats", "Side Zip"],
        rating: 4.6,
        reviews: 89,
        badge: "Sale",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Navy", "Emerald", "Black"],
        category: "Women"
    }
];
