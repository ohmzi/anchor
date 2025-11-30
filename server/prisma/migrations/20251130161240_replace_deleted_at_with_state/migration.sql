/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Note` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NoteState" AS ENUM ('active', 'trashed', 'deleted');

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "deletedAt",
ADD COLUMN     "state" "NoteState" NOT NULL DEFAULT 'active';
