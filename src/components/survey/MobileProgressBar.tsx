'use client';

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
}

export function MobileProgressBar({
  sections,
  totalProgress,
  activeSection,
}: MobileProgressBarProps) {
  const handleScrollTo = (sectionId: string) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm lg:hidden">
      <div className="h-14 flex flex-col justify-center">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-2 px-4 py-2 w-max">
            {sections.map(section => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleScrollTo(section.id)}
                  className={`whitespace-nowrap text-xs px-3 py-1 rounded-full transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* 4px progress bar */}
      <div
        className="h-1 bg-blue-600 transition-all duration-300"
        style={{ width: `${totalProgress}%` }}
      />
    </div>
  );
}
