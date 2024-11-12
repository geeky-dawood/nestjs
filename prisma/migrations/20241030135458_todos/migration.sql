/*
  Warnings:

  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ToDoStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'NOT_STARTED');

-- CreateEnum
CREATE TYPE "ToDoPriority" AS ENUM ('EXTREME', 'HIGH', 'MODERATE', 'LOW');

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- DropTable
DROP TABLE "bookmarks";

-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "tittle" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "date_time" TIMESTAMP(3) NOT NULL,
    "is_vital" BOOLEAN NOT NULL DEFAULT false,
    "status" "ToDoStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "ToDoPriority" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "todos_userId_key" ON "todos"("userId");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
