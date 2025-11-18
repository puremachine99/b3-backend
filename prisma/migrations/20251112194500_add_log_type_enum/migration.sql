-- CreateEnum (guarded to avoid duplicate errors if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'LogType' AND n.nspname = current_schema()
  ) THEN
    CREATE TYPE "LogType" AS ENUM ('STATUS', 'COMMAND', 'SYSTEM', 'ERROR');
  END IF;
END
$$;

-- AlterTable
ALTER TABLE "DeviceLog" ALTER COLUMN "eventType" TYPE "LogType" USING "eventType"::"LogType";
