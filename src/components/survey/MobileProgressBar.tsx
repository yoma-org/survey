'use client';

import { useState } from 'react';
import { Menu, Check } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

interface MobileSection {
  id: string;
  title: string;
  answeredCount: number;
  totalCount: number;
}

interface MobileProgressBarProps {
  sections: MobileSection[];
  totalProgress: number;
  activeSection: string | null;
  progressLabel?: string;
}

export function MobileProgressBar({
  sections,
  totalProgress,
  activeSection,
  progressLabel,
}: MobileProgressBarProps) {
  const [open, setOpen] = useState(false);

  const handleScrollTo = (sectionId: string) => {
    setOpen(false);
    // Small delay to let the sheet close before scrolling
    setTimeout(() => {
      document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const activeTitle = sections.find(s => s.id === activeSection)?.title;

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border lg:hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="p-1.5 -ml-1.5 rounded-md hover:bg-muted/50 transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
              <SheetTitle className="text-sm font-medium">
                {progressLabel ?? 'Progress'}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{totalProgress}%</span>
              </div>
            </SheetHeader>

            <nav className="py-2" aria-label="Survey sections">
              <ul className="space-y-0.5">
                {sections.map(section => {
                  const isActive = activeSection === section.id;
                  const isComplete = section.totalCount > 0 && section.answeredCount === section.totalCount;
                  const progress = section.totalCount > 0
                    ? `${section.answeredCount}/${section.totalCount}`
                    : null;

                  return (
                    <li key={section.id}>
                      <SheetClose
                        render={<button type="button" />}
                        onClick={() => handleScrollTo(section.id)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-muted/50 text-foreground font-medium'
                            : isComplete
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        {isComplete ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                        ) : isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-shrink-0 ml-1 mr-0.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0 ml-1 mr-0.5" />
                        )}
                        <span className="flex-1 truncate">{section.title}</span>
                        {progress && (
                          <span className="text-[11px] text-muted-foreground/50 tabular-nums">{progress}</span>
                        )}
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Current section label + progress */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground truncate block">
            {activeTitle}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">{totalProgress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
      </div>
    </div>
  );
}
