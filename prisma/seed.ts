import { readdir } from "node:fs/promises";
import { join } from "node:path";
import * as xlsx from "xlsx";
import {
  PrismaClient,
  ApplicationTrack,
  TrackType,
  Degree,
} from "@/../generated/client";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// In-memory lookup caches to prevent redundant DB calls
const universityCache = new Map<string, string>();
const fieldCache = new Map<string, string>();

async function main() {
  const rootDir = process.cwd();
  console.log(`🔍 Scanning folder tree: ${rootDir}`);

  const excelFiles = await findExcelFiles(rootDir);
  console.log(`📁 Found ${excelFiles.length} Excel file(s).`);

  for (const filePath of excelFiles) {
    try {
      await processFile(filePath);
    } catch (err) {
      console.error(`❌ Failed to process ${filePath}:`, err);
    }
  }

  console.log("🚀 Import finished!");
}

async function findExcelFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      files.push(...(await findExcelFiles(fullPath)));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".xlsx") || entry.name.endsWith(".xls"))
    ) {
      if (!entry.name.startsWith("~$")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function processFile(filePath: string) {
  const workbook = xlsx.readFile(filePath);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[][] = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    // Step 1: Find the row where actual data begins (first column equals 1 or "1")
    let dataStartIdx = -1;
    for (let i = 0; i < rawRows.length; i++) {
      const col0 = String(rawRows[i][0] ?? "").trim();
      if (col0 === "1") {
        dataStartIdx = i;
        break;
      }
    }

    if (dataStartIdx === -1) {
      console.warn(
        `⚠️ Skipped ${sheetName} in ${filePath} (No row starting with '1' found).`,
      );
      continue;
    }

    // Step 2: Read headers dynamically from the row immediately above data start
    const headerRowIdx = dataStartIdx - 1;
    if (headerRowIdx < 0) continue;

    const headers = rawRows[headerRowIdx].map((h: any) =>
      cleanHeader(String(h)),
    );

    // Process data rows starting from row '1'
    for (let i = dataStartIdx; i < rawRows.length; i++) {
      const row = rawRows[i];
      const col0 = String(row[0] ?? "").trim();

      // Stop processing if we hit empty trailing rows
      if (!col0 || isNaN(Number(col0))) break;

      const rowObj = mapRow(headers, row);
      await importRow(rowObj);
    }
  }
}

async function importRow(data: Record<string, string>) {
  const univEn = (
    data["university"] ||
    data["university (대학알리미 공시 명칭)"] ||
    ""
  ).trim();
  const univKr = (data["대학명"] || "").trim();
  if (!univEn) return;

  // 1. Resolve University
  let universityId = universityCache.get(univEn);
  if (!universityId) {
    const existing = await prisma.university.findFirst({
      where: { nameEn: univEn },
    });
    const univ = await prisma.university.upsert({
      where: { id: existing?.id || "" },
      update: {
        nameKr: univKr || undefined,
        location: data["campus location"] || undefined,
        websiteUrl: data["website url for detailed information"] || undefined,
        phone: data["telephone for detailed information"] || undefined,
        remarks: data["remarks"] || undefined,
      },
      create: {
        nameEn: univEn,
        nameKr: univKr,
        location: data["campus location"],
        websiteUrl: data["website url for detailed information"],
        phone: data["telephone for detailed information"],
        remarks: data["remarks"],
      },
    });
    universityId = univ.id;
    universityCache.set(univEn, universityId);
  }

  // 2. Resolve Field of Study
  const fieldName = (
    data["field of study (division)"] ||
    data["field of study"] ||
    data["학과계열"] ||
    "General"
  ).trim();
  let fieldId = fieldCache.get(fieldName);
  if (!fieldId) {
    const field = await prisma.fieldOfStudy.upsert({
      where: { name: fieldName },
      update: {},
      create: { name: fieldName },
    });
    fieldId = field.id;
    fieldCache.set(fieldName, fieldId);
  }

  // Step 2 (Refined): Extract tracks dynamically from parsed row values
  const { appTrack, trackType } = determineTracks(data);
  const degree = parseDegree(data["degree program"] || data["degree"]);
  const department = (
    data["department (대학알리미 공시 명칭)"] ||
    data["department"] ||
    data["모집단위 (학과, 학부 등)"] ||
    data["학과명"] ||
    "N/A"
  ).trim();

  const durationYears =
    parseInt(data["period (years)"] || data["period"] || data["years"], 10) ||
    null;
  const requiredTopik =
    data["required topik for admission after language program"] || null;

  // 3. Write GksProgram to Database
  await prisma.gksProgram.create({
    data: {
      universityId,
      fieldOfStudyId: fieldId,
      applicationTrack: appTrack,
      trackType,
      degree,
      department,
      mediumOfInstruction: data["medium of instruction"] || null,
      durationYears,
      requiredTopik,
      programStart: data["program starts"] || null,
    },
  });
}

// Helpers
function cleanHeader(val: string): string {
  return val.replace(/\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function mapRow(headers: string[], row: any[]): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((h, idx) => {
    if (h) {
      obj[h] =
        row[idx] !== undefined && row[idx] !== null
          ? String(row[idx]).trim()
          : "";
    }
  });
  return obj;
}

function determineTracks(data: Record<string, string>): {
  appTrack: ApplicationTrack;
  trackType: TrackType;
} {
  const trackRaw = (data["application track"] || "").toLowerCase();
  const progRaw = (data["univ. track applicable programs"] || "").toLowerCase();
  const embassyTypeRaw = (data["embassy track type"] || "").toUpperCase();

  let appTrack: ApplicationTrack = ApplicationTrack.UNIVERSITY;
  let trackType: TrackType = TrackType.TYPE_A;

  if (trackRaw.includes("embassy")) {
    appTrack = ApplicationTrack.EMBASSY;
    if (embassyTypeRaw.includes("B")) trackType = TrackType.TYPE_B;
    else trackType = TrackType.TYPE_A;
  } else {
    appTrack = ApplicationTrack.UNIVERSITY;
    if (progRaw.includes("uic")) trackType = TrackType.UIC;
    else if (progRaw.includes("associate")) trackType = TrackType.ASSOCIATE;
    else trackType = TrackType.TYPE_A;
  }

  return { appTrack, trackType };
}

function parseDegree(val?: string): Degree {
  const v = (val || "").toLowerCase();
  if (v.includes("associate")) return Degree.ASSOCIATE;
  if (v.includes("master")) return Degree.MASTERS;
  return Degree.BACHELORS;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
