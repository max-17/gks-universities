-- CreateEnum
CREATE TYPE "ApplicationTrack" AS ENUM ('EMBASSY', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('UIC', 'TYPE_A', 'TYPE_B', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('ASSOCIATE', 'BACHELORS', 'MASTERS');

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "nameKr" TEXT,
    "nameEn" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "phone" TEXT,
    "remarks" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldOfStudy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FieldOfStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GksProgram" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "fieldOfStudyId" TEXT NOT NULL,
    "applicationTrack" "ApplicationTrack" NOT NULL,
    "trackType" "TrackType" NOT NULL,
    "degree" "Degree" NOT NULL,
    "department" TEXT NOT NULL,
    "mediumOfInstruction" TEXT,
    "durationYears" INTEGER,
    "requiredTopik" TEXT,
    "programStart" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GksProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FieldOfStudy_name_key" ON "FieldOfStudy"("name");

-- CreateIndex
CREATE INDEX "GksProgram_universityId_idx" ON "GksProgram"("universityId");

-- CreateIndex
CREATE INDEX "GksProgram_fieldOfStudyId_idx" ON "GksProgram"("fieldOfStudyId");

-- CreateIndex
CREATE INDEX "GksProgram_applicationTrack_idx" ON "GksProgram"("applicationTrack");

-- CreateIndex
CREATE INDEX "GksProgram_trackType_idx" ON "GksProgram"("trackType");

-- CreateIndex
CREATE INDEX "GksProgram_degree_idx" ON "GksProgram"("degree");

-- CreateIndex
CREATE INDEX "GksProgram_department_idx" ON "GksProgram"("department");

-- CreateIndex
CREATE INDEX "GksProgram_mediumOfInstruction_idx" ON "GksProgram"("mediumOfInstruction");

-- AddForeignKey
ALTER TABLE "GksProgram" ADD CONSTRAINT "GksProgram_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GksProgram" ADD CONSTRAINT "GksProgram_fieldOfStudyId_fkey" FOREIGN KEY ("fieldOfStudyId") REFERENCES "FieldOfStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
