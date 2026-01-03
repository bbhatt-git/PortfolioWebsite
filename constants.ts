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
    desc: 'Crafting responsive, interactive, and accessible user interfaces using React and modern CSS.',
    details: 'I specialize in building performant, accessible, and beautiful web applications. Using modern frameworks like React and Next.js, I ensure your frontend is not just a pretty face but a robust interface that converts visitors into customers.',
    features: ['React & Next.js Expert', 'Responsive Design', 'Performance Optimization', 'WCAG Accessibility']
  },
  {
    icon: 'fa-server',
    title: 'Backend Development',
    desc: 'Building robust APIs, database architectures, and server-side logic for scalable applications.',
    details: 'Powering your applications with secure and scalable backend solutions. Whether it is RESTful APIs with Node.js or serverless functions with Firebase, I architect systems that handle growth effortlessly.',
    features: ['Node.js & Python', 'REST & GraphQL APIs', 'Database Design (SQL/NoSQL)', 'Cloud Integration']
  },
  {
    icon: 'fa-layer-group',
    title: 'UI/UX Designing',
    desc: 'Designing intuitive user journeys and high-fidelity wireframes that look impactful.',
    details: 'Great software starts with great design. I create user-centric designs that are intuitive and engaging, bridging the gap between functional requirements and user expectations.',
    features: ['User Research', 'Wireframing & Prototyping', 'Design Systems', 'Figma Mastery']
  },
  {
    icon: 'fa-palette',
    title: 'Graphics Designing',
    desc: 'Creating visual brand identities, logos, and marketing assets using Adobe Creative Suite.',
    details: 'Visual storytelling is key to brand identity. I craft logos, social media assets, and marketing materials that resonate with your audience and communicate your brand values effectively.',
    features: ['Logo Design', 'Brand Identity', 'Marketing Assets', 'Adobe Creative Suite']
  },
  {
    icon: 'fa-mobile-alt',
    title: 'App Development',
    desc: 'Developing cross-platform mobile applications for iOS and Android using Flutter/React Native.',
    details: 'Reach users on their favorite devices with high-quality mobile apps. I build cross-platform applications that offer a native feel and smooth performance on both iOS and Android.',
    features: ['Cross-Platform (Flutter)', 'Native Performance', 'App Store Deployment', 'Mobile UI/UX']
  },
  {
    icon: 'fa-pen-nib',
    title: 'Content Writing',
    desc: 'Writing technical blogs, SEO-optimized copy, and documentation that engages readers.',
    details: 'Words matter. I provide technical writing and copywriting services that help you communicate complex ideas clearly and improve your search engine rankings.',
    features: ['Technical Documentation', 'SEO Copywriting', 'Blog Writing', 'Content Strategy']
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
    text: '"I hired him for a quick UI fix, but his insights on UX were so valuable that we redesigned our entire app. He truly understands users."',
    name: 'Raysum Giri',
    role: 'Founder, Aglo Yatri',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 4,
    text: '"The backend architecture he designed for our e-commerce platform handled our Black Friday traffic without a hiccup. Rock solid engineering."',
    name: 'Priya Sharma',
    role: 'CTO, TechStore',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 5,
    text: '"Bhupesh is a rare breed of developer who has a keen eye for design. The animations he added to our landing page increased engagement by 40%."',
    name: 'Liam Chen',
    role: 'Product Designer',
    image: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: 6,
    text: '"Outstanding communication throughout the project. He delivered ahead of schedule and the code quality was exceptional."',
    name: 'Sarah Jenkins',
    role: 'Project Manager',
    image: 'https://randomuser.me/api/portraits/women/29.jpg'
  }
];

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyba49ZLsyk5C2e8zKBevq3k_DbCBPUK_ebgbHEQIy_l2TG_rFVqniBB9TQ4aebxnw5/exec';