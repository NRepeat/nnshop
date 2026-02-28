-- CreateTable
CREATE TABLE "recently_viewed_product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recently_viewed_product_userId_idx" ON "recently_viewed_product"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_product_viewedAt_idx" ON "recently_viewed_product"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_product_userId_productId_key" ON "recently_viewed_product"("userId", "productId");

-- CreateIndex
CREATE INDEX "DeliveryInformation_userId_idx" ON "DeliveryInformation"("userId");

-- AddForeignKey
ALTER TABLE "recently_viewed_product" ADD CONSTRAINT "recently_viewed_product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
