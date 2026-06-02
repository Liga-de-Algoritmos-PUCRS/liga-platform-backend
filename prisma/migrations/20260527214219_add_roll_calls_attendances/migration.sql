-- CreateTable
CREATE TABLE "roll_calls" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "current_qr_code" TEXT,
    "qr_code_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roll_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "roll_call_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roll_calls_current_qr_code_key" ON "roll_calls"("current_qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_user_id_roll_call_id_key" ON "attendances"("user_id", "roll_call_id");

-- CreateIndex
CREATE INDEX "attendances_roll_call_id_idx" ON "attendances"("roll_call_id");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_roll_call_id_fkey" FOREIGN KEY ("roll_call_id") REFERENCES "roll_calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
