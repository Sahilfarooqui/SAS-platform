-- AlterTable
ALTER TABLE "ScheduledPost" ADD COLUMN "deliveryStatus" TEXT;
ALTER TABLE "ScheduledPost" ADD COLUMN "engagementMetrics" JSONB;
ALTER TABLE "ScheduledPost" ADD COLUMN "errorMessage" TEXT;
ALTER TABLE "ScheduledPost" ADD COLUMN "socialPostId" TEXT;
