import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://utoukqzikoldefjvzzhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3VrcXppa29sZGVmanZ6emh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDU1NjUsImV4cCI6MjA4NjY4MTU2NX0.y1MZG7gJ71KOU3B5o7jfbzTXh__-AbtWJdfU9UsSJ4g';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const slides = [
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 0,
    is_active: true,
    layout_type: "split"
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 1,
    is_active: true,
    layout_type: "split"
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 2,
    is_active: true,
    layout_type: "split"
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 3,
    is_active: true,
    layout_type: "split"
  }
];

async function seed() {
  console.log('Seeding hero_slides...');
  
  // First clear existing
  const { error: deleteError } = await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }
  
  // Insert new
  const { data, error } = await supabase.from('hero_slides').insert(slides);
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Successfully seeded slides!');
  }
}

seed();
