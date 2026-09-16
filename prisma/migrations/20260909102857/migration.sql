-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_kr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "campus_location" TEXT,
    "website_url" TEXT,
    "telephone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "university_id" TEXT NOT NULL,
    "name_kr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "field_of_study_kr" TEXT,
    "field_of_study_en" TEXT,
    "degree_program" TEXT,
    "period_years" INTEGER,
    "medium_of_instruction" TEXT,
    "required_topik_level" TEXT,
    "program_starts" TEXT,
    "remarks" TEXT,
    "source_file" TEXT,
    "sheet_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "departments_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DepartmentToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DepartmentToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DepartmentToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DepartmentToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DepartmentToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DepartmentToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_en_campus_location_key" ON "universities"("name_en", "campus_location");

-- CreateIndex
CREATE INDEX "departments_university_id_idx" ON "departments"("university_id");

-- CreateIndex
CREATE INDEX "departments_field_of_study_en_idx" ON "departments"("field_of_study_en");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_type_key" ON "tracks"("type");

-- CreateIndex
CREATE UNIQUE INDEX "programs_type_key" ON "programs"("type");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentToTrack_AB_unique" ON "_DepartmentToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentToTrack_B_index" ON "_DepartmentToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentToProgram_AB_unique" ON "_DepartmentToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentToProgram_B_index" ON "_DepartmentToProgram"("B");
