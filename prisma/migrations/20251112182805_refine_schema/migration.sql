/*
  Warnings:

  - You are about to drop the column `groupId` on the `Device` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'VIEWER';

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_groupId_fkey";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "groupId";

-- AlterTable
ALTER TABLE "DeviceCommand" ADD COLUMN     "error" TEXT,
ADD COLUMN     "executedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
