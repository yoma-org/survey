'use client';

import { Suspense } from 'react';
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
}

const DEFAULT_ORG_OPTIONS = ['Wave Money', 'Yoma Bank'];

function DashboardFiltersInner({ surveys, activeSurveyId, orgOptions = DEFAULT_ORG_OPTIONS, deptOptions = [] }: DashboardFiltersProps) {
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
    <div className="flex items-center gap-2 flex-wrap">
      {/* Survey selector */}
      <Select value={activeSurveyId ?? ''} onValueChange={(v) => v && updateParam('survey', v)}>
        <SelectTrigger className="w-64">
          <span className="truncate">
            {surveys.find(s => s.id === activeSurveyId)?.name || 'Select survey'}
          </span>
        </SelectTrigger>
        <SelectContent>
          {surveys.map(s => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Organization filter */}
      <Select value={activeOrg || '__all__'} onValueChange={(v) => updateParam('org', v)}>
        <SelectTrigger className="w-48">
          <span className="truncate">
            {activeOrg || 'All Organizations'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Organizations</SelectItem>
          {orgOptions.map(org => (
            <SelectItem key={org} value={org}>
              {org}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Department filter */}
      <Select value={activeDept || '__all__'} onValueChange={(v) => updateParam('dept', v)}>
        <SelectTrigger className="w-48">
          <span className="truncate">
            {activeDept || 'All Departments'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Departments</SelectItem>
          {deptOptions.map(dept => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
