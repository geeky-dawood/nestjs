/*
  Warnings:

  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isdeleted` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isVerified",
DROP COLUMN "isdeleted",
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_eleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "social_id" TEXT,
ADD COLUMN     "social_prvider" TEXT;

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "address_userId_key" ON "address"("userId");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
