-- CreateTable
CREATE TABLE "AlertRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetDate" TEXT NOT NULL,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
