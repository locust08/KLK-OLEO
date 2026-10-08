import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/generated/ContentPage";
import { generatedPage, generatedPages } from "@/lib/generated/pages";

export function generateStaticParams() {
  return generatedPages.map(page => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const page = generatedPage((await params).slug.join("/"));
  return { title: page ? `${page.title} | KLK OLEO` : "Page Not Found | KLK OLEO" };
}

export default async function AdditionalPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const page = generatedPage((await params).slug.join("/"));
  if (!page) notFound();
  return <ContentPage page={page} />;
}
