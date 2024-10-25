/*
  Warnings:

  - You are about to drop the column `social_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `social_prvider` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "social_id",
DROP COLUMN "social_prvider",
ADD COLUMN     "apple_id" TEXT,
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT;
