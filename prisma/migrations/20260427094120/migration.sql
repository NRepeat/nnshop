-- CreateTable
CREATE TABLE "BonusMovements" (
    "id" TEXT NOT NULL,
    "loyaltyCardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusMovements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyCards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bonusBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastAccrualDate" TIMESTAMP(3),
    "allExpireBy" TIMESTAMP(3),

    CONSTRAINT "LoyaltyCards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyCards_phone_key" ON "LoyaltyCards"("phone");

-- AddForeignKey
ALTER TABLE "BonusMovements" ADD CONSTRAINT "BonusMovements_loyaltyCardId_fkey" FOREIGN KEY ("loyaltyCardId") REFERENCES "LoyaltyCards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyCards" ADD CONSTRAINT "LoyaltyCards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
