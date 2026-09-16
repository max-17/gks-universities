import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

const ROOT_DIR = path.join(process.cwd(), 'root');

async function getExcelFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return getExcelFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith('.xlsx') && !entry.name.startsWith('~$')) {
        return fullPath;
      }
      return [];
    })
  );
  return files.flat();
}

async function extractUniversityData() {
  const excelFiles = await getExcelFiles(ROOT_DIR);
  const records = [];

  for (const filePath of excelFiles) {
    // Extract folder name (e.g. "university1") from root/university1/file.xlsx
    const pathSegments = filePath.split(path.sep);
    const universitySlug = pathSegments[pathSegments.indexOf('root') + 1];

    // Read the file buffer directly with xlsx
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON directly using row 1 as object keys
      const rawRows = XLSX.utils.sheet_to_json(sheet, {
        defval: null, // Keep empty cells as null instead of omitting the key
        raw: false,   // Parse formatted text strings (dates, currency, numbers)
      });

      for (const row of rawRows) {
        // Normalize headers to snake_case for DB compatibility
        const normalizedRow = {
          university_slug: universitySlug,
          source_file: path.basename(filePath),
          sheet_name: sheetName,
        };

        for (const [key, value] of Object.entries(row)) {
          const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
          normalizedRow[cleanKey] = value;
        }

        records.push(normalizedRow);
      }
    }
  }

  return records;
}

// Write to JSON payload ready for DB bulk insert / seed script
extractUniversityData()
  .then(async (data) => {
    await fs.writeFile('db_seed_payload.json', JSON.stringify(data, null, 2));
    console.log(`Processed ${data.length} records into db_seed_payload.json`);
  })
  .catch(console.error);