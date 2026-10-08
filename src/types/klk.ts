export type Product = {
  id: string;
  name: string;
  category: string;
  functionality: string[];
  formulationType: string[];
  labels: string[];
  description: string;
  applications: string[];
};

export type NewsItem = {
  href: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
};
