export interface GeneratedSection {
  heading?: string;
  paragraphs: string[];
  image?: string;
  links?: Array<{ label: string; href: string }>;
}

export interface GeneratedPage {
  slug: string;
  title: string;
  source: string;
  category: string;
  date?: string;
  image?: string;
  sections: GeneratedSection[];
}
