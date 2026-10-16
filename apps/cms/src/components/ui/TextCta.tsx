import Link from "next/link";
import type { ReactNode } from "react";
import { FaArrowRight } from "react-icons/fa6";

export function TextCta({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-cta"><span>{children}</span><FaArrowRight aria-hidden="true" /></Link>;
}
