/*
  Warnings:

  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isVerify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isdeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastname" TEXT;
