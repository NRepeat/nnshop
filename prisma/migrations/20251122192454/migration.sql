/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ContactInformation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContactInformation_userId_key" ON "ContactInformation"("userId");
