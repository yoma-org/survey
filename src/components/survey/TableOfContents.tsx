'use client';

import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface TocSection {
  id: string;
  title: string;
  answeredCount: number;
  totalCount: number;
}

interface TableOfContentsProps {
  sections: TocSection[];
  totalProgress: number;
}

export function TableOfContents({ sections, totalProgress }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const activeSectionRef = useRef(activeSection);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  const handleScrollTo = (sectionId: string) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="w-60 sticky top-24 hidden lg:block">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Survey Progress</p>
      <Progress value={totalProgress} className="h-1.5 mb-4" />

      <ul className="space-y-1">
        {sections.map(section => {
          const isComplete = section.totalCount > 0 && section.answeredCount === section.totalCount;
          const isActive = activeSection === section.id;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(section.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors ${
                  isActive
                    ? 'text-blue-700 font-medium bg-blue-50'
                    : isComplete
                    ? 'text-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                ) : isActive ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                )}
                <span className="truncate">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
