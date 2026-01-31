-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "profile_image" TEXT,
    "social_links" TEXT,
    "expertise" TEXT,
    "phone" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("bio", "created_at", "email", "expertise", "id", "is_approved", "is_verified", "name", "password_hash", "phone", "profile_image", "role", "social_links", "updated_at") SELECT "bio", "created_at", "email", "expertise", "id", "is_approved", "is_verified", "name", "password_hash", "phone", "profile_image", "role", "social_links", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
