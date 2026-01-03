import { Project, Service, Testimonial, Stat } from './types';

export const TECH_STACK = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vite', 
  'Tailwind CSS', 'Node JS', 'Python', 'PHP', 'C', 'MySQL', 'MongoDB', 
  'Firebase', 'Git', 'Figma', 'Flutter', 'Adobe Photoshop', 'AI/ML'
];

export const STATS: Stat[] = [
  { value: '2+', label: 'Years Exp.' },
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

export const PROJECTS: Project[] = [];

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