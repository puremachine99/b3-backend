/*
  Warnings:

  - Changed the type of `eventType` on the `DeviceLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('STATUS', 'COMMAND', 'SYSTEM', 'ERROR');

-- AlterTable
ALTER TABLE "DeviceLog" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "LogType" NOT NULL;
