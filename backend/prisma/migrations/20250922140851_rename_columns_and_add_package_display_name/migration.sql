/*
  Warnings:

  - You are about to drop the column `published` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `SitePhoto` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "published",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."SitePhoto" DROP COLUMN "active",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Tag" DROP COLUMN "published",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Text" ALTER COLUMN "language" SET DEFAULT 'en';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "packageId" UUID;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
