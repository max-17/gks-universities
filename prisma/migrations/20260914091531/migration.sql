/*
  Warnings:

  - You are about to drop the `_DepartmentToProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DepartmentToTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `degree_program` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `field_of_study_en` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `field_of_study_kr` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `medium_of_instruction` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `period_years` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `program_starts` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `required_topik_level` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `sheet_name` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `source_file` on the `departments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_DepartmentToProgram_B_index";

-- DropIndex
DROP INDEX "_DepartmentToProgram_AB_unique";

-- DropIndex
DROP INDEX "_DepartmentToTrack_B_index";

-- DropIndex
DROP INDEX "_DepartmentToTrack_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DepartmentToProgram";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DepartmentToTrack";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "fields_of_study" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_kr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "majors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "field_of_study_id" TEXT NOT NULL,
    "degree_type" TEXT NOT NULL,
    "period_years" INTEGER,
    "medium_of_instruction" TEXT,
    "required_topik_level" TEXT,
    "program_starts" TEXT,
    "remarks" TEXT,
    "source_file" TEXT,
    "sheet_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "majors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "majors_field_of_study_id_fkey" FOREIGN KEY ("field_of_study_id") REFERENCES "fields_of_study" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MajorToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MajorToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "majors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MajorToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MajorToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MajorToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "majors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MajorToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "university_id" TEXT NOT NULL,
    "name_kr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "departments_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_departments" ("created_at", "id", "name_en", "name_kr", "university_id", "updated_at") SELECT "created_at", "id", "name_en", "name_kr", "university_id", "updated_at" FROM "departments";
DROP TABLE "departments";
ALTER TABLE "new_departments" RENAME TO "departments";
CREATE INDEX "departments_university_id_idx" ON "departments"("university_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "fields_of_study_name_en_key" ON "fields_of_study"("name_en");

-- CreateIndex
CREATE INDEX "majors_department_id_idx" ON "majors"("department_id");

-- CreateIndex
CREATE INDEX "majors_field_of_study_id_idx" ON "majors"("field_of_study_id");

-- CreateIndex
CREATE UNIQUE INDEX "_MajorToTrack_AB_unique" ON "_MajorToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_MajorToTrack_B_index" ON "_MajorToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MajorToProgram_AB_unique" ON "_MajorToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_MajorToProgram_B_index" ON "_MajorToProgram"("B");
