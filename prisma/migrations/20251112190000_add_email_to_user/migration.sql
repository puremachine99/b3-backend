/*
  Warnings:

  - Added required column `email` to the `User` table without a default value. If the table is not empty, existing rows are backfilled below before applying the NOT NULL constraint.
*/

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT;

-- Backfill existing rows with a unique placeholder based on username and id
UPDATE "User"
SET "email" = "username" || '+' || "id" || '@example.com'
WHERE "email" IS NULL;

-- Enforce NOT NULL and uniqueness
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
