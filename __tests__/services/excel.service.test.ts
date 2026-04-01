import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { parseExcelBuffer } from '@/lib/services/excel.service';

async function makeExcelBuffer(rows: (string | undefined)[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Questions');
  // Header row
  sheet.addRow(['questionId', 'type', 'englishText', 'burmeseText', 'dimension', 'subPillar', 'optionsJson']);
  // Data rows
  for (const row of rows) {
    sheet.addRow(row);
  }
  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

describe('excel.service', () => {
  it('parseExcelBuffer returns Question[] with correct id, en, my fields from a valid workbook', async () => {
    const buffer = await makeExcelBuffer([
      ['CAM-01', 'likert', 'I trust my manager', 'မန်နေဂျာကို ယုံကြည်သည်', 'camaraderie', 'Communication', ''],
    ]);

    const questions = await parseExcelBuffer(buffer);

    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe('CAM-01');
    expect(questions[0].type).toBe('likert');
    expect(questions[0].en).toBe('I trust my manager');
    expect(questions[0].my).toBe('မန်နေဂျာကို ယုံကြည်သည်');
    expect(questions[0].dimension).toBe('camaraderie');
    expect(questions[0].subPillar).toBe('Communication');
  });

  it('excludes rows with blank questionId from output', async () => {
    const buffer = await makeExcelBuffer([
      ['CAM-01', 'likert', 'I trust my manager', 'မန်နေဂျာကို ယုံကြည်သည်', 'camaraderie', '', ''],
      ['', 'likert', 'Blank id row', 'ဗလာ', '', '', ''],
      ['OE-01', 'open_ended', 'What do you think?', 'ဘာထင်သည်?', '', '', ''],
    ]);

    const questions = await parseExcelBuffer(buffer);

    expect(questions).toHaveLength(2);
    expect(questions.map(q => q.id)).toEqual(['CAM-01', 'OE-01']);
  });

  it('parses demographic question with options JSON', async () => {
    const options = JSON.stringify([{ en: 'Male', my: 'ကျား' }, { en: 'Female', my: 'မ' }]);
    const buffer = await makeExcelBuffer([
      ['DEM-GENDER', 'demographic', 'Gender', 'လိင်', '', '', options],
    ]);

    const questions = await parseExcelBuffer(buffer);

    expect(questions).toHaveLength(1);
    expect(questions[0].options).toEqual([{ en: 'Male', my: 'ကျား' }, { en: 'Female', my: 'မ' }]);
  });
});
