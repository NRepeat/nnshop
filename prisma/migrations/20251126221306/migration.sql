-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shopifyOrderId" DROP NOT NULL,
ALTER COLUMN "shopifyDruftOrderId" DROP NOT NULL;
