'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileText } from 'lucide-react';
import { exportDashboardSummaryCSV, exportStrengthsOpportunitiesCSV } from '@/lib/export';
import type { DashboardData } from '@/lib/types/analytics';

interface ExportButtonsProps {
  data: DashboardData;
  surveyName?: string;
}

export function ExportButtons({ data, surveyName = 'survey' }: ExportButtonsProps) {
  const t = useTranslations('dashboard');
  const [exportingDashboard, setExportingDashboard] = useState(false);
  const [exportingRaw, setExportingRaw] = useState(false);

  function handleExportDashboard() {
    setExportingDashboard(true);
    try {
      exportDashboardSummaryCSV(data, surveyName);
    } finally {
      setTimeout(() => setExportingDashboard(false), 800);
    }
  }

  function handleExportRaw() {
    setExportingRaw(true);
    try {
      exportStrengthsOpportunitiesCSV(data, surveyName);
    } finally {
      setTimeout(() => setExportingRaw(false), 800);
    }
  }

  return (
    <div className="flex items-center gap-2" data-test-id="export-buttons">
      <button
        onClick={handleExportDashboard}
        disabled={exportingDashboard}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/60 hover:border-border hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('exportDashboardAria')}
        data-test-id="export-dashboard-csv"
      >
        <Download className="w-3.5 h-3.5" />
        {exportingDashboard ? t('exporting') : t('exportDashboard')}
      </button>
      <button
        onClick={handleExportRaw}
        disabled={exportingRaw}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/60 hover:border-border hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('exportRankingsAria')}
        data-test-id="export-rankings-csv"
      >
        <FileText className="w-3.5 h-3.5" />
        {exportingRaw ? t('exporting') : t('exportRankings')}
      </button>
    </div>
  );
}
