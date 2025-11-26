/*
  Warnings:

  - You are about to drop the column `shopifyDruftOrderId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopifyDraftOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_shopifyDruftOrderId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shopifyDruftOrderId",
ADD COLUMN     "shopifyDraftOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopifyDraftOrderId_key" ON "Order"("shopifyDraftOrderId");
