import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/* ========== Enums ========== */

// "L" = Livre. Mostre "Livre" na tela e guarde "L" no banco.
export const ageRatingEnum = pgEnum("age_rating", [
  "L",
  "10",
  "12",
  "14",
  "16",
  "18",
]);

export const movieStatusEnum = pgEnum("movie_status", ["PENDING_REVIEW", "PUBLISHED","BANNED"]);

/* ========== Categorias (lista gerida pelo ADM) ========== */

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

/* ========== Filmes ========== */

export const movies = pgTable(
  "movies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    synopsis: text("synopsis").notNull(),
    videoUrl: text("video_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    status: movieStatusEnum("status").default("PENDING_REVIEW").notNull(),
    banReason: text("ban_reason"),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    ageRating: ageRatingEnum("age_rating").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    // RF04.2: filme banido exige justificativa
    check(
      "movies_ban_reason_required",
      sql`${t.status} <> 'BANNED' OR (
        ${t.banReason} IS NOT NULL
        AND length(trim(${t.banReason})) > 0
      )`,
    ),
    index("movies_status_idx").on(t.status),
    index("movies_creator_idx").on(t.creatorId),
  ],
);

/* ========== Filme <-> Categoria (N:N) ========== */

export const movieCategories = pgTable(
  "movie_categories",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      // restrict: o banco recusa remover categoria que ainda tem filmes
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.movieId, t.categoryId] }),
    index("movie_categories_category_idx").on(t.categoryId),
  ],
);

/* ========== Avaliações (nota + comentário opcional) ========== */

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    score: smallint("score").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    // RF03.3: uma avaliação por usuário e filme (use upsert para atualizar)
    unique("ratings_user_movie_unique").on(t.userId, t.movieId),
   // Escala armazenada de 1 a 10; equivale a notas de 0,5 a 5,0
    check("ratings_score_range", sql`${t.score} BETWEEN 1 AND 10`),
  ],
);

/* ========== Favoritos ========== */

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // Um usuário só pode favoritar um filme uma vez
    unique("favorites_user_movie_unique").on(t.userId, t.movieId),

    // Facilita buscar os favoritos de um usuário
    index("favorites_user_idx").on(t.userId),

    // Facilita encontrar usuários que favoritaram um filme
    index("favorites_movie_idx").on(t.movieId),
  ],
);

/* ========== Tipos ========== */

export type Favorite = typeof favorites.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
