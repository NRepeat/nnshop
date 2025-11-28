-- CreateTable
CREATE TABLE "FavoriteProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FavoriteProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteProduct_userId_idx" ON "FavoriteProduct"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProduct_userId_productId_key" ON "FavoriteProduct"("userId", "productId");

-- AddForeignKey
ALTER TABLE "FavoriteProduct" ADD CONSTRAINT "FavoriteProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
