/*
  Warnings:

  - A unique constraint covering the columns `[friendlyName]` on the table `photo_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[friendlyName]` on the table `photo_tags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."photo_categories" ADD COLUMN     "friendlyName" TEXT,
ADD COLUMN     "isPublic" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "public"."photo_tags" ADD COLUMN     "friendlyName" TEXT,
ADD COLUMN     "isPublic" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "photo_categories_friendlyName_key" ON "public"."photo_categories"("friendlyName");

-- CreateIndex
CREATE UNIQUE INDEX "photo_tags_friendlyName_key" ON "public"."photo_tags"("friendlyName");
