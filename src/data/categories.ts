export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    color: string;
    productCount: number;
    status: "Active" | "Inactive";
    order: number;
    createdAt: string;
}

export const categoriesData: Category[] = [
    {
        id: "1",
        name: "Men",
        slug: "men",
        description: "Stylish and comfortable clothing for men",
        image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400",
        color: "#3B82F6",
        productCount: 45,
        status: "Active",
        order: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: "2",
        name: "Women",
        slug: "women",
        description: "Elegant fashion for modern women",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
        color: "#EC4899",
        productCount: 68,
        status: "Active",
        order: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: "3",
        name: "Kids",
        slug: "kids",
        description: "Fun and playful outfits for children",
        image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400",
        color: "#10B981",
        productCount: 24,
        status: "Active",
        order: 3,
        createdAt: new Date().toISOString()
    },
    {
        id: "4",
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with our accessories",
        image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400",
        color: "#F59E0B",
        productCount: 32,
        status: "Active",
        order: 4,
        createdAt: new Date().toISOString()
    },
    {
        id: "5",
        name: "Footwear",
        slug: "footwear",
        description: "Step out in style with our footwear collection",
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400",
        color: "#8B5CF6",
        productCount: 15,
        status: "Active",
        order: 5,
        createdAt: new Date().toISOString()
    }
];
