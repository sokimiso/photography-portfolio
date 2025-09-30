/*
  Warnings:

  - You are about to drop the column `active` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `CustomerPhoto` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "active",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."CustomerPhoto" DROP COLUMN "active",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Package" DROP COLUMN "active",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Tag" DROP COLUMN "active",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."Text" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'sk',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Text_key_key" ON "public"."Text"("key");
