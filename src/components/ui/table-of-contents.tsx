'use client';

import { useEffect, useState } from 'react';

interface TocItem {
    id: string;
    label: string;
    icon: string;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );

        for (const item of items) {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [items]);

    return (
        <nav className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">On this page</h4>
            <ul className="space-y-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeId === item.id
                                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-400'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
