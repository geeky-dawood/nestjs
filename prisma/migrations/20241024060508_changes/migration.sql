/*
  Warnings:

  - You are about to drop the column `is_eleted` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_eleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
