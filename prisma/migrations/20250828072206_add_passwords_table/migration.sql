-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "uppercase" BOOLEAN NOT NULL,
    "lowercase" BOOLEAN NOT NULL,
    "numbers" BOOLEAN NOT NULL,
    "symbols" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Password_userId_idx" ON "Password"("userId");

-- CreateIndex
CREATE INDEX "Password_createdAt_idx" ON "Password"("createdAt");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
