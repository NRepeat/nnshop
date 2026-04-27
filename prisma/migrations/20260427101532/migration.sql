/*
  Warnings:

  - Changed the type of `type` on the `BonusMovements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BonusMovements" DROP COLUMN "type",
ADD COLUMN     "type" "BonusMoveType" NOT NULL;
