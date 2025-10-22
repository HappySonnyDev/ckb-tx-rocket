-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "number" BIGINT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "miner" TEXT NOT NULL,
    "reward" BIGINT NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "proposalsCount" INTEGER NOT NULL,
    "unclesCount" INTEGER NOT NULL,
    "size" BIGINT NOT NULL,
    "proposals" JSONB NOT NULL,
    "uncles" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "parentHash" TEXT NOT NULL,
    "compactTarget" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "epoch" TEXT NOT NULL,
    "dao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "blockId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fee" BIGINT NOT NULL,
    "size" BIGINT NOT NULL,
    "cycles" BIGINT NOT NULL,
    "version" INTEGER NOT NULL,
    "witnesses" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CellDep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txHash" TEXT NOT NULL,
    "outPointTxHash" TEXT NOT NULL,
    "outPointIndex" INTEGER NOT NULL,
    "depType" TEXT NOT NULL,
    CONSTRAINT "CellDep_txHash_fkey" FOREIGN KEY ("txHash") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeaderDep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txHash" TEXT NOT NULL,
    "blockHash" TEXT NOT NULL,
    CONSTRAINT "HeaderDep_txHash_fkey" FOREIGN KEY ("txHash") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Input" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txHash" TEXT NOT NULL,
    "previousTxHash" TEXT NOT NULL,
    "previousIndex" BIGINT NOT NULL,
    "since" TEXT NOT NULL,
    CONSTRAINT "Input_txHash_fkey" FOREIGN KEY ("txHash") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Output" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txHash" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "capacity" BIGINT NOT NULL,
    "lockScriptId" INTEGER NOT NULL,
    "typeScriptId" INTEGER,
    "data" TEXT,
    CONSTRAINT "Output_txHash_fkey" FOREIGN KEY ("txHash") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Output_lockScriptId_fkey" FOREIGN KEY ("lockScriptId") REFERENCES "Script" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Output_typeScriptId_fkey" FOREIGN KEY ("typeScriptId") REFERENCES "Script" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Script" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codeHash" TEXT NOT NULL,
    "hashType" TEXT NOT NULL,
    "args" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Block_number_key" ON "Block"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE INDEX "Transaction_blockId_idx" ON "Transaction"("blockId");

-- CreateIndex
CREATE INDEX "CellDep_txHash_idx" ON "CellDep"("txHash");

-- CreateIndex
CREATE INDEX "HeaderDep_txHash_idx" ON "HeaderDep"("txHash");

-- CreateIndex
CREATE INDEX "Input_txHash_idx" ON "Input"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Input_previousTxHash_previousIndex_key" ON "Input"("previousTxHash", "previousIndex");

-- CreateIndex
CREATE INDEX "Output_txHash_idx" ON "Output"("txHash");

-- CreateIndex
CREATE INDEX "Output_lockScriptId_idx" ON "Output"("lockScriptId");

-- CreateIndex
CREATE INDEX "Output_typeScriptId_idx" ON "Output"("typeScriptId");

-- CreateIndex
CREATE UNIQUE INDEX "Output_txHash_index_key" ON "Output"("txHash", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Script_codeHash_hashType_args_key" ON "Script"("codeHash", "hashType", "args");
