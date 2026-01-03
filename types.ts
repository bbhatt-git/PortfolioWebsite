
export interface Project {
  id: string;
  title: string;
  stack: string;
  desc: string;
  liveUrl?: string;
  codeUrl?: string;
  image: string;
  category?: string;
  highlights?: string[];
  /**
   * Defines the display sequence of the project.
   */
  order: number;
  caseStudy?: {
    challenge: string;
    solution: string;
    results: string;
  };
}

export interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  image: string;
}

export interface Service {
  icon: string;
  title: string;
  desc: string;
  details?: string;
  features?: string[];
}

export interface Stat {
  value: string;
  label: string;
}