// src/lib/services/excel.service.ts
import ExcelJS from 'exceljs';
import type { Question } from '@/lib/types';

/**
 * Parse an Excel (.xlsx) file buffer into a Question array.
 * Expects worksheets[0] with columns:
 *   [0]=questionId, [1]=type, [2]=englishText, [3]=burmeseText,
 *   [4]=dimension, [5]=subPillar, [6]=optionsJson
 * Skips the header row (rowNumber === 1) and rows with blank questionId.
 */
export async function parseExcelBuffer(buffer: Buffer): Promise<Question[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS types expect its own Buffer type; cast via unknown for Node 22 compatibility
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const sheet = workbook.worksheets[0];
  const questions: Question[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    // row.values is 1-indexed — slice(1) to get 0-indexed columns
    const vals = (row.values as (string | number | undefined)[]).slice(1);
    const questionId = (vals[0] ?? '').toString().trim();
    if (!questionId) return; // skip blank rows

    questions.push({
      id: questionId,
      type: (vals[1] ?? 'likert') as Question['type'],
      en: (vals[2] ?? '').toString(),
      my: (vals[3] ?? '').toString(),
      dimension: vals[4] ? (vals[4] as Question['dimension']) : undefined,
      subPillar: vals[5] ? vals[5].toString() : undefined,
      options: vals[6] ? JSON.parse(vals[6].toString()) : undefined,
    });
  });

  return questions;
}
