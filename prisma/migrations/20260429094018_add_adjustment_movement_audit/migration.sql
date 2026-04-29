-- AlterEnum
ALTER TYPE "BonusMoveType" ADD VALUE 'ADJUSTMENT';

-- AlterTable
ALTER TABLE "BonusMovements" ADD COLUMN     "actorUserId" TEXT,
ADD COLUMN     "note" TEXT;
