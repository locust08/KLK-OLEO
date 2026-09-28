import Link from "next/link";
import type { ReactNode } from "react";
export function PrimaryButton({ href, children, inverse = false }: { href: string; children: ReactNode; inverse?: boolean }) { return <Link href={href} className={`primary-button${inverse ? " primary-button--inverse" : ""}`}>{children}</Link>; }
