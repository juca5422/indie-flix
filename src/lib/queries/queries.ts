
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { categories, favorites, movieCategories, movies } from "@/db/schema/catalog";



/* ========== Pega os Favoritos de um usuário ========== */
export async function getUserFavorites(userId: string) {
  return db
    .select({
      favoriteId: favorites.id,
      favoritedAt: favorites.createdAt,
      movieId: movies.id,
      title: movies.title,
      synopsis: movies.synopsis,
      thumbnailUrl: movies.thumbnailUrl,
      ageRating: movies.ageRating,
    })
    .from(favorites)
    .innerJoin(movies, eq(favorites.movieId, movies.id))
    .where(
      and(
        eq(favorites.userId, userId),
        eq(movies.status, "PUBLISHED"),
      ),
    )
    .orderBy(favorites.createdAt);
}

/* ========== Verifica se um filme está favoritado por um usuário ========== */
export async function isMovieFavorited(
  userId: string,
  movieId: string,
) {
  const result = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.movieId, movieId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

/* ========== Pega os IDs dos filmes favoritados por um usuário ========== */
export async function getFavoriteMovieIds(userId: string) {
  const result = await db
    .select({ movieId: favorites.movieId })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return result.map((favorite) => favorite.movieId);
}

/* ========== Pega os filmes publicados ========== */
export async function getMovies(search?: string) {
    const filters = [eq(movies.status, "PUBLISHED")];
  
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
  
      filters.push(
        or(
          ilike(movies.title, term),
          ilike(movies.synopsis, term),
        )!,
      );
    }
  
    return db
      .select()
      .from(movies)
      .where(and(...filters))
      .orderBy(desc(movies.createdAt));
  }

  /* ========== Pega um filme pelo ID ========== */
  export async function getMovieById(movieId: string) {
    const [movie] = await db
      .select()
      .from(movies)
      .where(
        and(
          eq(movies.id, movieId),
          eq(movies.status, "PUBLISHED"),
        ),
      )
      .limit(1);
  
    return movie ?? null;
  }

  /* ========== Pega os filmes de um criador ========== */
  export async function getMoviesByCreator(creatorId: string) {
    return db
      .select()
      .from(movies)
      .where(eq(movies.creatorId, creatorId))
      .orderBy(desc(movies.createdAt));
  }

  /* ========== Pega os filmes para moderação ========== */
  export async function getMoviesForModeration() {
    return db
      .select()
      .from(movies)
      .orderBy(desc(movies.createdAt));
  }

  /* ========== Banir um filme ========== */
  export async function banMovie(
    movieId: string,
    reason: string,
  ) {
    const [movie] = await db
      .update(movies)
      .set({
        status: "BANNED",
        banReason: reason.trim(),
      })
      .where(
        and(
          eq(movies.id, movieId),
          eq(movies.status, "PUBLISHED"),
        ),
      )
      .returning();
  
    return movie ?? null;
  }

  /* ========== Reenviar um filme para revisão ========== */
  export async function resubmitMovieForReview(
    movieId: string,
    creatorId: string,
  ) {
    const [movie] = await db
      .update(movies)
      .set({
        status: "PENDING_REVIEW",
        banReason: null,
      })
      .where(
        and(
          eq(movies.id, movieId),
          eq(movies.creatorId, creatorId),
          eq(movies.status, "BANNED"),
        ),
      )
      .returning();
  
    return movie ?? null;
  }

  /* ========== Publicar um filme ========== */
  export async function publishMovie(movieId: string) {
    const [movie] = await db
      .update(movies)
      .set({
        status: "PUBLISHED",
        banReason: null,
      })
      .where(
        and(
          eq(movies.id, movieId),
          eq(movies.status, "PENDING_REVIEW"),
        ),
      )
      .returning();
  
    return movie ?? null;
  }