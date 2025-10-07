/*
  Warnings:

  - You are about to drop the column `published` on the `Package` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Package" DROP COLUMN "published",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "displayName" TEXT NOT NULL;
