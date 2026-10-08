-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "originName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "flexibility" INTEGER NOT NULL DEFAULT 0,
    "maxPrice" DOUBLE PRECISION,
    "maxStops" INTEGER,
    "maxDurationHours" INTEGER,
    "preferredAirlines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredAggregators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timePreference" TEXT NOT NULL DEFAULT 'any',
    "cabinClass" TEXT NOT NULL DEFAULT 'economy',
    "tripType" TEXT NOT NULL DEFAULT 'round_trip',
    "currency" TEXT,
    "groupId" TEXT,
    "deleteToken" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isSeed" BOOLEAN NOT NULL DEFAULT false,
    "lookAheadDays" INTEGER NOT NULL DEFAULT 14,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "firstViewedAt" TIMESTAMP(3),
    "vpnCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "label" TEXT,
    "scrapeInterval" INTEGER,
    "lastNotifiedLowPrice" DOUBLE PRECISION,
    "lastNotifiedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryEditEvent" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "summary" TEXT NOT NULL,
    "changes" JSONB NOT NULL,

    CONSTRAINT "QueryEditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "airline" TEXT NOT NULL,
    "bookingUrl" TEXT,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT,
    "flightId" TEXT,
    "flightNumber" TEXT,
    "departureTime" TEXT,
    "arrivalTime" TEXT,
    "seatsLeft" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'available',
    "airlineDirectPrice" DOUBLE PRECISION,
    "vpnCountry" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchRunId" TEXT,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchRun" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google_flights',
    "snapshotsCount" INTEGER NOT NULL DEFAULT 0,
    "extractionCost" DOUBLE PRECISION,
    "vpnCountry" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "FetchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractionConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "provider" TEXT NOT NULL DEFAULT 'anthropic',
    "model" TEXT NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
    "theme" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "scrapeInterval" INTEGER NOT NULL DEFAULT 3,
    "defaultSearchMethod" TEXT NOT NULL DEFAULT 'ai',
    "adminPasswordHash" TEXT,
    "communitySharing" BOOLEAN NOT NULL DEFAULT false,
    "communityRegistrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "communityApiKey" TEXT,
    "lastCommunitySyncAt" TIMESTAMP(3),
    "defaultCurrency" TEXT,
    "defaultCountry" TEXT,
    "customBaseUrl" TEXT,
    "anthropicApiKey" TEXT,
    "openaiApiKey" TEXT,
    "googleApiKey" TEXT,
    "vpnProvider" TEXT,
    "vpnCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vpnActivationCode" TEXT,
    "multiUserMode" BOOLEAN NOT NULL DEFAULT false,
    "adminSessionsValidFrom" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extractTimeoutSeconds" INTEGER NOT NULL DEFAULT 90,
    "maxFlightsPerDate" INTEGER NOT NULL DEFAULT 10,
    "maxTrackedPerRoute" INTEGER NOT NULL DEFAULT 10,
    "previewMaxCombos" INTEGER NOT NULL DEFAULT 24,
    "aggregatorsEnabled" TEXT[] DEFAULT ARRAY['google_flights', 'airline_direct']::TEXT[],
    "notifyMinDropAbs" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "notifyMinDropPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publicBaseUrl" TEXT,
    "anthropicRpm" INTEGER,
    "googleRpm" INTEGER,
    "openaiRpm" INTEGER,
    "groqRpm" INTEGER,
    "previewConcurrency" INTEGER,
    "previewAdmissionCap" INTEGER,

    CONSTRAINT "ExtractionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT,
    "sessionsValidFrom" TIMESTAMP(3),
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "theme" TEXT,
    "defaultCurrency" TEXT,
    "defaultCountry" TEXT,
    "preferredAirlines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredAggregators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cabinClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwardSearch" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "cabin" TEXT NOT NULL DEFAULT 'economy',
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scrapeInterval" INTEGER,
    "lastCheckedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwardSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwardSnapshot" (
    "id" TEXT NOT NULL,
    "awardSearchId" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "cabin" TEXT NOT NULL,
    "seatsAvailable" INTEGER,
    "mileageCost" INTEGER,
    "taxesFees" TEXT,
    "lastSeen" TIMESTAMP(3),
    "bookingProgram" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AwardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "queryId" TEXT,
    "awardSearchId" TEXT,
    "threshold" DOUBLE PRECISION,
    "program" TEXT,
    "cabin" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" TIMESTAMP(3),
    "lastConditionKey" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "operation" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewRun" (
    "id" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestPayload" JSONB NOT NULL,
    "resultPayload" JSONB,
    "error" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientIp" TEXT,

    CONSTRAINT "PreviewRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityApiKey" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "snapshotCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunitySnapshot" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "airline" TEXT NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "cabinClass" TEXT NOT NULL DEFAULT 'economy',
    "scrapedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT NOT NULL,

    CONSTRAINT "CommunitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Query_active_idx" ON "Query"("active");

-- CreateIndex
CREATE INDEX "Query_expiresAt_idx" ON "Query"("expiresAt");

-- CreateIndex
CREATE INDEX "Query_isSeed_idx" ON "Query"("isSeed");

-- CreateIndex
CREATE INDEX "Query_groupId_idx" ON "Query"("groupId");

-- CreateIndex
CREATE INDEX "Query_userId_idx" ON "Query"("userId");

-- CreateIndex
CREATE INDEX "QueryEditEvent_queryId_editedAt_idx" ON "QueryEditEvent"("queryId", "editedAt");

-- CreateIndex
CREATE INDEX "QueryEditEvent_userId_idx" ON "QueryEditEvent"("userId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_queryId_scrapedAt_idx" ON "PriceSnapshot"("queryId", "scrapedAt");

-- CreateIndex
CREATE INDEX "PriceSnapshot_queryId_airline_idx" ON "PriceSnapshot"("queryId", "airline");

-- CreateIndex
CREATE INDEX "PriceSnapshot_queryId_flightId_idx" ON "PriceSnapshot"("queryId", "flightId");

-- CreateIndex
CREATE INDEX "FetchRun_queryId_startedAt_idx" ON "FetchRun"("queryId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_isAdmin_idx" ON "User"("isAdmin");

-- CreateIndex
CREATE INDEX "NotificationChannel_userId_idx" ON "NotificationChannel"("userId");

-- CreateIndex
CREATE INDEX "NotificationChannel_enabled_idx" ON "NotificationChannel"("enabled");

-- CreateIndex
CREATE INDEX "AwardSearch_active_idx" ON "AwardSearch"("active");

-- CreateIndex
CREATE INDEX "AwardSearch_lastCheckedAt_idx" ON "AwardSearch"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "AwardSearch_userId_idx" ON "AwardSearch"("userId");

-- CreateIndex
CREATE INDEX "AwardSnapshot_awardSearchId_scrapedAt_idx" ON "AwardSnapshot"("awardSearchId", "scrapedAt");

-- CreateIndex
CREATE INDEX "AwardSnapshot_awardSearchId_program_travelDate_idx" ON "AwardSnapshot"("awardSearchId", "program", "travelDate");

-- CreateIndex
CREATE INDEX "AlertRule_type_enabled_idx" ON "AlertRule"("type", "enabled");

-- CreateIndex
CREATE INDEX "AlertRule_queryId_idx" ON "AlertRule"("queryId");

-- CreateIndex
CREATE INDEX "AlertRule_awardSearchId_idx" ON "AlertRule"("awardSearchId");

-- CreateIndex
CREATE INDEX "AlertRule_userId_idx" ON "AlertRule"("userId");

-- CreateIndex
CREATE INDEX "ApiUsageLog_createdAt_idx" ON "ApiUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "ApiUsageLog_provider_idx" ON "ApiUsageLog"("provider");

-- CreateIndex
CREATE INDEX "PreviewRun_status_createdAt_idx" ON "PreviewRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PreviewRun_expiresAt_idx" ON "PreviewRun"("expiresAt");

-- CreateIndex
CREATE INDEX "PreviewRun_requestHash_status_expiresAt_idx" ON "PreviewRun"("requestHash", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "PreviewRun_clientIp_status_updatedAt_idx" ON "PreviewRun"("clientIp", "status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityApiKey_apiKey_key" ON "CommunityApiKey"("apiKey");

-- CreateIndex
CREATE INDEX "CommunityApiKey_active_idx" ON "CommunityApiKey"("active");

-- CreateIndex
CREATE INDEX "CommunitySnapshot_origin_destination_idx" ON "CommunitySnapshot"("origin", "destination");

-- CreateIndex
CREATE INDEX "CommunitySnapshot_travelDate_idx" ON "CommunitySnapshot"("travelDate");

-- CreateIndex
CREATE INDEX "CommunitySnapshot_airline_idx" ON "CommunitySnapshot"("airline");

-- CreateIndex
CREATE INDEX "CommunitySnapshot_apiKeyId_idx" ON "CommunitySnapshot"("apiKeyId");

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryEditEvent" ADD CONSTRAINT "QueryEditEvent_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_fetchRunId_fkey" FOREIGN KEY ("fetchRunId") REFERENCES "FetchRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FetchRun" ADD CONSTRAINT "FetchRun_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationChannel" ADD CONSTRAINT "NotificationChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardSearch" ADD CONSTRAINT "AwardSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardSnapshot" ADD CONSTRAINT "AwardSnapshot_awardSearchId_fkey" FOREIGN KEY ("awardSearchId") REFERENCES "AwardSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_awardSearchId_fkey" FOREIGN KEY ("awardSearchId") REFERENCES "AwardSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunitySnapshot" ADD CONSTRAINT "CommunitySnapshot_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "CommunityApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
