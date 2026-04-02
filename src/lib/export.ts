// src/lib/export.ts
// Client-side CSV export utilities — no server data needed, just DashboardData

import type { DashboardData } from './types/analytics';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCSV(cols: (string | number | null | undefined)[]): string {
  return cols.map(escapeCSV).join(',');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDashboardSummaryCSV(data: DashboardData, surveyName = 'survey'): void {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  // Header
  lines.push('# Culture Survey Dashboard Summary Export');
  lines.push(`# Generated: ${timestamp}`);
  lines.push('');

  // Core metrics
  lines.push('## CORE METRICS');
  lines.push(rowToCSV(['Metric', 'Value']));
  lines.push(rowToCSV(['Employee Engagement Score', data.eesScore + '%']));
  lines.push(rowToCSV(['GPTW Score (UNC-47)', data.gptwScore + '%']));
  lines.push(rowToCSV(['Response Rate', data.responseRate + '%']));
  lines.push(rowToCSV(['Total Responses', data.totalResponses]));
  lines.push(rowToCSV(['ENPS (legacy UNC-47)', data.enps.score]));
  lines.push(rowToCSV(['eNPS (PRI-31 + PRI-35)', data.enpsDetail.score]));
  lines.push('');

  // Pillar scores
  lines.push('## PILLAR SCORES');
  lines.push(rowToCSV(['Pillar', '% Favorable']));
  for (const d of data.dimensions) {
    lines.push(rowToCSV([d.dimension, d.score + '%']));
  }
  lines.push('');

  // Relationship scores
  lines.push('## RELATIONSHIP AXIS SCORES');
  lines.push(rowToCSV(['Relationship', '% Favorable']));
  for (const r of data.relationshipScores.scores) {
    lines.push(rowToCSV([r.relationship, r.score + '%']));
  }
  lines.push('');

  // eNPS detail
  lines.push('## eNPS DETAIL (PRI-31 + PRI-35)');
  lines.push(rowToCSV(['Metric', 'Value']));
  lines.push(rowToCSV(['Score', data.enpsDetail.score]));
  lines.push(rowToCSV(['Promoters', data.enpsDetail.promoters + '%']));
  lines.push(rowToCSV(['Passives', data.enpsDetail.passives + '%']));
  lines.push(rowToCSV(['Detractors', data.enpsDetail.detractors + '%']));
  lines.push('');

  // Department heatmap
  lines.push('## DEPARTMENT PILLAR HEATMAP');
  const pillarCols = data.pillarHeatmap.pillars;
  lines.push(rowToCSV(['Department', ...pillarCols]));
  lines.push(rowToCSV(['Overall Average', ...pillarCols.map(p => (data.pillarHeatmap.overallAverages[p] ?? '') + '%')]));
  for (const dept of data.pillarHeatmap.departments) {
    const row = pillarCols.map(p => {
      const cell = data.pillarHeatmap.cells.find(c => c.department === dept && c.pillar === p);
      return cell?.score !== null && cell?.score !== undefined ? cell.score + '%' : 'n/a';
    });
    lines.push(rowToCSV([dept, ...row]));
  }
  lines.push('');

  // Leadership comparison
  lines.push('## LEADERSHIP COMPARISON');
  lines.push(rowToCSV(['Pillar', 'People Manager', 'Individual Contributor']));
  data.leadershipComparison.pillars.forEach((p, i) => {
    const m = data.leadershipComparison.manager[i];
    const ic = data.leadershipComparison.ic[i];
    lines.push(rowToCSV([
      p,
      m !== null && m !== undefined ? m + '%' : 'n/a',
      ic !== null && ic !== undefined ? ic + '%' : 'n/a',
    ]));
  });
  lines.push('');

  // Tenure journey
  lines.push('## TENURE JOURNEY');
  lines.push(rowToCSV(['Tenure Band', 'Responses', ...data.tenureJourney.dimensions]));
  for (const band of data.tenureJourney.bands) {
    const scores = data.tenureJourney.dimensions.map(dim => {
      const s = band.scores.find(sc => sc.dimension === dim);
      return s?.score !== null && s?.score !== undefined ? s.score + '%' : 'n/a';
    });
    lines.push(rowToCSV([band.band, band.responseCount, ...scores]));
  }
  lines.push('');

  // Tenure insights
  lines.push('## TENURE INSIGHTS (CARING + SUPPORT)');
  lines.push(rowToCSV(['Tenure Band', 'Responses', 'Caring %', 'Support %']));
  for (const band of data.tenureInsights.bands) {
    lines.push(rowToCSV([
      band.band,
      band.responseCount,
      band.caring !== null ? band.caring + '%' : 'n/a',
      band.support !== null ? band.support + '%' : 'n/a',
    ]));
  }
  lines.push('');

  // Early warning alerts
  lines.push('## EARLY WARNING ALERTS');
  if (data.earlyWarningAlerts.length === 0) {
    lines.push('No departments flagged');
  } else {
    lines.push(rowToCSV(['Department', 'Their Job %', 'Overall Job Avg %', 'Credibility %', 'Overall Credibility Avg %', 'Responses']));
    for (const alert of data.earlyWarningAlerts) {
      lines.push(rowToCSV([
        alert.department,
        alert.jobScore + '%',
        alert.overallJobAvg + '%',
        alert.credibilityScore + '%',
        alert.overallCredibilityAvg + '%',
        alert.responseCount,
      ]));
    }
  }
  lines.push('');

  // Sentiment
  lines.push('## OPEN-ENDED SENTIMENT');
  lines.push(rowToCSV(['Question', 'Total Responses', 'Frustrated Count', 'Frustrated %', 'Constructive Count', 'Constructive %', 'Positive Count', 'Positive %', 'Unclassified Count', 'Unclassified %']));
  for (const [key, oe] of [['OE-01', data.sentimentAnalysis.oe01], ['OE-02', data.sentimentAnalysis.oe02]] as const) {
    lines.push(rowToCSV([
      key,
      oe.totalResponses,
      oe.frustrated.count,
      oe.frustrated.percentage + '%',
      oe.constructive.count,
      oe.constructive.percentage + '%',
      oe.positive.count,
      oe.positive.percentage + '%',
      oe.unclassified.count,
      oe.unclassified.percentage + '%',
    ]));
  }

  downloadCSV(lines.join('\n'), `survey-yoma-dashboard-${surveyName}-${timestamp}.csv`);
}

export function exportStrengthsOpportunitiesCSV(data: DashboardData, surveyName = 'survey'): void {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  lines.push('## TOP STRENGTHS');
  lines.push(rowToCSV(['Rank', 'Statement', '% Favorable']));
  data.strengths.forEach((s, i) => {
    lines.push(rowToCSV([i + 1, s.label, s.score + '%']));
  });
  lines.push('');

  lines.push('## TOP OPPORTUNITIES');
  lines.push(rowToCSV(['Rank', 'Statement', '% Favorable']));
  data.opportunities.forEach((s, i) => {
    lines.push(rowToCSV([i + 1, s.label, s.score + '%']));
  });

  downloadCSV(lines.join('\n'), `survey-yoma-rankings-${surveyName}-${timestamp}.csv`);
}
