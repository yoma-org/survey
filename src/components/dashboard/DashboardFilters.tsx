'use client';

import { type ReactNode, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface DashboardFiltersProps {
  surveys: { id: string; name: string }[];
  activeSurveyId: string | undefined;
  orgOptions?: string[];
  deptOptions?: string[];
  exportButtons?: ReactNode;
}

const DEFAULT_ORG_OPTIONS = ['Wave Money', 'Yoma Bank'];

function DashboardFiltersInner({ surveys, activeSurveyId, orgOptions = DEFAULT_ORG_OPTIONS, deptOptions = [], exportButtons }: DashboardFiltersProps) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeOrg = searchParams.get('org') ?? '';
  const activeDept = searchParams.get('dept') ?? '';

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== '__all__') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 w-full" data-test-id="dashboard-filters">
      {/* Survey title */}
      <h2 className="text-xl font-semibold truncate">
        {surveys.find(s => s.id === activeSurveyId)?.name || t('selectSurvey')}
      </h2>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
      {/* Organization filter */}
      <Select value={activeOrg || '__all__'} onValueChange={(v) => updateParam('org', v)}>
        <SelectTrigger className="w-48" data-test-id="filter-organization">
          <span className="truncate">
            {activeOrg || t('allOrganizations')}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t('allOrganizations')}</SelectItem>
          {orgOptions.map(org => (
            <SelectItem key={org} value={org}>
              {org}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Department filter */}
      <Select value={activeDept || '__all__'} onValueChange={(v) => updateParam('dept', v)}>
        <SelectTrigger className="w-48" data-test-id="filter-department">
          <span className="truncate">
            {activeDept || t('allDepartments')}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t('allDepartments')}</SelectItem>
          {deptOptions.map(dept => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
        </div>
        {exportButtons}
      </div>
    </div>
  );
}

export function DashboardFilters(props: DashboardFiltersProps) {
  return (
    <Suspense fallback={<div className="h-8 w-96 animate-pulse rounded-lg bg-muted" />}>
      <DashboardFiltersInner {...props} />
    </Suspense>
  );
}
