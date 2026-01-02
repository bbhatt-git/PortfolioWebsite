import { Project, Service, Testimonial, Stat } from './types';

export const TECH_STACK = [
  'HTML', 'CSS', 'JavaScript', 'C', 'Python', 'PHP', 'MySQL', 'Node JS', 
  'Next.js', 'React', 'Tailwind CSS', 'AI/ML', 'Bootstrap', 'Firebase', 
  'Wordpress', 'Figma', 'Flutter', 'Adobe Photoshop'
];

export const STATS: Stat[] = [
  { value: '1+', label: 'Years Exp.' },
  { value: '10+', label: 'Projects' },
  { value: '15+', label: 'Clients' },
];

export const SERVICES: Service[] = [
  {
    icon: 'fa-code',
    title: 'Frontend Development',
    desc: 'Crafting responsive, interactive, and accessible user interfaces using React and modern CSS.'
  },
  {
    icon: 'fa-server',
    title: 'Backend Development',
    desc: 'Building robust APIs, database architectures, and server-side logic for scalable applications.'
  },
  {
    icon: 'fa-layer-group',
    title: 'UI/UX Designing',
    desc: 'Designing intuitive user journeys and high-fidelity wireframes that look impactful.'
  },
  {
    icon: 'fa-palette',
    title: 'Graphics Designing',
    desc: 'Creating visual brand identities, logos, and marketing assets using Adobe Creative Suite.'
  },
  {
    icon: 'fa-mobile-alt',
    title: 'App Development',
    desc: 'Developing cross-platform mobile applications for iOS and Android using Flutter/React Native.'
  },
  {
    icon: 'fa-pen-nib',
    title: 'Content Writing',
    desc: 'Writing technical blogs, SEO-optimized copy, and documentation that engages readers.'
  }
];

// Helper to generate thum.io url
const getScreenshotUrl = (url: string) => `https://image.thum.io/get/width/1200/crop/800/noanimate/${url}`;

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Clothing Store',
    stack: 'React • Next.js • Tailwind CSS • Firebase',
    desc: 'A performant, server-rendered e-commerce platform built on a modern tech stack. Features include a dynamic product catalog, shopping cart functionality, secure checkout, and a responsive design that works seamlessly across all devices.',
    liveUrl: 'https://clothing-store-xq4v.onrender.com/',
    codeUrl: 'https://github.com/bbhatt-git/clothing-store',
    image: getScreenshotUrl('https://clothing-store-xq4v.onrender.com/'),
    highlights: [
      'Real-time inventory management',
      'Secure Stripe payment integration',
      'Mobile-first responsive design',
      'Fast server-side rendering with Next.js'
    ],
    caseStudy: {
      challenge: 'Building a scalable e-commerce platform that handles high traffic while maintaining sub-second load times.',
      solution: 'Utilized Next.js for SSR, implemented Redis caching for products, and optimized images with Cloudinary.',
      results: 'Achieved a 98/100 Lighthouse performance score and increased conversion rates by 40%.'
    }
  },
  {
    id: 'p2',
    title: 'Academic Club Dashboard',
    stack: 'React • Next.js • Tailwind CSS • Firebase',
    desc: 'A comprehensive web dashboard for managing academic clubs. It enables event scheduling, member tracking, resource distribution, and real-time announcements. The intuitive interface ensures smooth administration for club leaders.',
    liveUrl: 'https://sarc-club.vercel.app/',
    codeUrl: 'https://github.com/bbhatt-git/studio/',
    image: getScreenshotUrl('https://sarc-club.vercel.app/'),
    highlights: [
      'Role-based access control (RBAC)',
      'Real-time event notifications',
      'Member attendance tracking',
      'Automated resource allocation'
    ],
    caseStudy: {
      challenge: 'The club struggled with fragmented communication and manual event tracking using spreadsheets.',
      solution: 'Developed a centralized dashboard with Firebase for real-time data sync and Next.js for a snappy UI.',
      results: 'Reduced administrative time by 60% and improved member engagement across all club activities.'
    }
  },
  {
    id: 'p3',
    title: 'QR Attendance System',
    stack: 'React • Next.js • GenkitAI • Firebase',
    desc: 'An automated student attendance system leveraging QR code technology. Students scan unique codes for instant verification. Features include admin panels, bulk data import, CSV export, and AI-powered insights.',
    liveUrl: 'https://qwickattend.vercel.app',
    codeUrl: 'https://github.com/bbhatt-git/qwickattend/',
    image: getScreenshotUrl('https://qwickattend.vercel.app'),
    highlights: [
      'Instant QR code generation & scanning',
      'Geo-fencing for location validation',
      'AI-powered attendance analytics',
      'Bulk CSV data export'
    ],
    caseStudy: {
      challenge: 'Manual attendance taking was time-consuming and prone to proxy attendance issues.',
      solution: 'Implemented a secure QR-based system with geo-location checks to ensure physical presence.',
      results: 'Streamlined the attendance process to under 5 seconds per student and eliminated proxy attendance.'
    }
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: '"Bhupesh transformed our vague vision into a stunning, high-performance website. His attention to detail is unmatched and the speed is incredible."',
    name: 'Arjun Pant',
    role: 'Managing Director',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    text: '"Professional, timely, and incredibly talented. The simple, clean design he implemented gave our brand a perfect modern mobile look."',
    name: 'Sanjay Thapa',
    role: 'Marketing Head',
    image: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: 3,
    text: '"I hired him for a quick UI fix, but his insights on UX were so valuable that we redesigned our entire app."',
    name: 'Raysum Giri',
    role: 'Founder, Aglo Yatri',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  }
];

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyba49ZLsyk5C2e8zKBevq3k_DbCBPUK_ebgbHEQIy_l2TG_rFVqniBB9TQ4aebxnw5/exec';