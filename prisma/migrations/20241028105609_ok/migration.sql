/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_key" ON "bookmarks"("userId");
