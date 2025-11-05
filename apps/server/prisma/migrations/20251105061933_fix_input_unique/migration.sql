/*
  Warnings:

  - A unique constraint covering the columns `[txHash,previousTxHash,previousIndex]` on the table `Input` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Input_previousTxHash_previousIndex_key";

-- CreateIndex
CREATE UNIQUE INDEX "Input_txHash_previousTxHash_previousIndex_key" ON "Input"("txHash", "previousTxHash", "previousIndex");
