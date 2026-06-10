import { parse } from 'csv-parse/sync';
import { readSheet } from 'read-excel-file/node';
import { ReferralSourceRow } from './import-types';

const MAX_ROWS = 20000;

const hasValue = (value: unknown) => String(value ?? '').trim().length > 0;

const stripEmptyRows = (rows: ReferralSourceRow[]) =>
  rows.filter((row) => Object.values(row).some(hasValue));

const getHeader = (value: unknown, index: number) =>
  String(value ?? '').trim() || `Column ${index + 1}`;

export const parseReferralFile = async (file: File) => {
  const fileName = file.name || 'referral-list';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const bytes = Buffer.from(await file.arrayBuffer());

  if (extension === 'csv') {
    const text = bytes.toString('utf8');
    const rows = parse(text, {
      bom: true,
      columns: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as ReferralSourceRow[];

    return stripEmptyRows(rows).slice(0, MAX_ROWS);
  }

  if (extension === 'xlsx') {
    const sheetRows = await readSheet(bytes);
    const [headerRow, ...dataRows] = sheetRows;
    if (!headerRow?.length) return [];
    const headers = headerRow.map(getHeader);
    const rows = dataRows.map<ReferralSourceRow>((row) =>
      headers.reduce<ReferralSourceRow>((acc, header, index) => {
        acc[header] = row[index] ?? '';
        return acc;
      }, {})
    );

    return stripEmptyRows(rows).slice(0, MAX_ROWS);
  }

  throw new Error('Upload a CSV or .xlsx Excel file.');
};
