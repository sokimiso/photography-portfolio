/*
  Warnings:

  - You are about to drop the column `isPublic` on the `photos` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `order_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `order_photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."order_photos" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedBy" TEXT NOT NULL,
ALTER COLUMN "isFinalDelivery" DROP NOT NULL,
ALTER COLUMN "toPostprocess" DROP NOT NULL,
ALTER COLUMN "toPrint" DROP NOT NULL,
ALTER COLUMN "isVisible" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."photos" DROP COLUMN "isPublic",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
