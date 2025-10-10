/*
  Warnings:

  - You are about to drop the column `token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "token",
DROP COLUMN "tokenExpiresAt",
ADD COLUMN     "emailConfirmationToken" TEXT,
ADD COLUMN     "emailConfirmationTokenExpiresAt" TIMESTAMP(3);
