'use client';

/**
 * Global Breadcrumbs with Schema.org BreadcrumbList micro-data
 *
 * Example: Home / USA / New York / Back Pain
 * Generates JSON-LD structured data for Google rich results.
 */

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href: string;
}

interface Props {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
    const allItems = [{ label: 'Home', href: '/' }, ...items];

    // Schema.org BreadcrumbList JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: allItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-surface-100/40 py-3">
                {allItems.map((item, i) => (
                    <span key={item.href} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight size={11} className="opacity-30" />}
                        {i === 0 && <Home size={11} className="opacity-50" />}
                        {i < allItems.length - 1 ? (
                            <Link
                                href={item.href}
                                className="hover:text-primary-300 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-surface-100/60 font-medium">{item.label}</span>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
}
