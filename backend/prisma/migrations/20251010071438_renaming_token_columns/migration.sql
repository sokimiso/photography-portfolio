/*
  Warnings:

  - You are about to drop the column `confirmationToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "confirmationToken",
ADD COLUMN     "token" TEXT;
