/*
  Warnings:

  - A unique constraint covering the columns `[readableOrderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `readableOrderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "readableOrderNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_readableOrderNumber_key" ON "public"."orders"("readableOrderNumber");
