-- CreateTable
CREATE TABLE "PaymentInformation" (
    "id" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInformation_userId_key" ON "PaymentInformation"("userId");

-- AddForeignKey
ALTER TABLE "PaymentInformation" ADD CONSTRAINT "PaymentInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
