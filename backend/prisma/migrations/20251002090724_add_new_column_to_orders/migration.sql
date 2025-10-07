/*
  Warnings:

  - You are about to drop the column `customerSelectedPostprocess` on the `order_photos` table. All the data in the column will be lost.
  - You are about to drop the column `customerSelectedPrint` on the `order_photos` table. All the data in the column will be lost.
  - Added the required column `transportPrice` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."order_photos" DROP COLUMN "customerSelectedPostprocess",
DROP COLUMN "customerSelectedPrint",
ADD COLUMN     "toPostprocess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "toPrint" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "transportPrice" DECIMAL(10,2) NOT NULL;
