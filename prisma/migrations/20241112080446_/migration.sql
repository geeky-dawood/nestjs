/*
  Warnings:

  - The values [HIGH] on the enum `ToDoPriority` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tittle` on the `todos` table. All the data in the column will be lost.
  - Added the required column `title` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ToDoPriority_new" AS ENUM ('EXTREME', 'MODERATE', 'LOW');
ALTER TABLE "todos" ALTER COLUMN "priority" TYPE "ToDoPriority_new" USING ("priority"::text::"ToDoPriority_new");
ALTER TYPE "ToDoPriority" RENAME TO "ToDoPriority_old";
ALTER TYPE "ToDoPriority_new" RENAME TO "ToDoPriority";
DROP TYPE "ToDoPriority_old";
COMMIT;

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "tittle",
ADD COLUMN     "title" TEXT NOT NULL;
