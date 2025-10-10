/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `photo_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `photo_tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "photo_categories_name_key" ON "public"."photo_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "photo_tags_name_key" ON "public"."photo_tags"("name");
