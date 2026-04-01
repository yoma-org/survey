// src/app/[locale]/(admin)/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

export default function AdminDashboardPage() {
  // Phase 1: static onboarding checklist (no data yet)
  const checklist = [
    { label: 'Configure SMTP email settings', done: false, href: './admin/settings' },
    { label: 'Create your first survey', done: false, href: './admin/surveys' },
    { label: 'Import employee email list and send invitations', done: false, href: './admin/surveys' },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Surey Yoma</h1>
        <p className="text-gray-500 mt-1">Your employee engagement survey platform</p>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Getting Started</CardTitle>
          <CardDescription>Complete these steps to run your first survey</CardDescription>
        </CardHeader>
        <CardContent>
          {/* onboarding checklist — static for Phase 1 */}
          <ol className="space-y-3">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={
                    item.done ? 'text-gray-400 line-through text-sm' : 'text-gray-700 text-sm'
                  }
                >
                  {i + 1}. {item.label}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
