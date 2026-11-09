import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import {
  categories,
  favorites,
  movieCategories,
  movies,
  ratings,
  watchProgress,
} from "@/db/schema/catalog";

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
    .where(and(eq(favorites.userId, userId), eq(movies.status, "PUBLISHED")))
    .orderBy(favorites.createdAt);
}

/* ========== Atualiza filme e associa categorias ========== */
export async function updateMovieWithCategories(data: {
  movieId: string;
  creatorId: string;
  title: string;
  synopsis: string;
  videoUrl: string;
  thumbnailUrl: string;
  ageRating: "L" | "10" | "12" | "14" | "16" | "18";
  categoryIds: string[];
}) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: movies.status })
      .from(movies)
      .where(
        and(eq(movies.id, data.movieId), eq(movies.creatorId, data.creatorId)),
      )
      .limit(1);
    if (
      !current ||
      (current.status !== "PUBLISHED" && current.status !== "BANNED")
    ) {
      return null;
    }
    const [movie] = await tx
      .update(movies)
      .set({
        title: data.title,
        synopsis: data.synopsis,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        ageRating: data.ageRating,
        status: current.status === "BANNED" ? "PENDING_REVIEW" : "PUBLISHED",
        banReason: current.status === "BANNED" ? null : undefined,
      })
      .where(
        and(eq(movies.id, data.movieId), eq(movies.creatorId, data.creatorId)),
      )
      .returning({ id: movies.id, status: movies.status });
    if (!movie) {
      return null;
    }

    await tx
      .delete(movieCategories)
      .where(eq(movieCategories.movieId, movie.id));

    if (data.categoryIds.length > 0) {
      await tx.insert(movieCategories).values(
        data.categoryIds.map((categoryId) => ({
          movieId: movie.id,
          categoryId,
        })),
      );
    }

    return movie;
  });
}

/* ========== Cadastra filme e associa categorias ========== */
export async function insertMovieWithCategories(data: {
  title: string;
  synopsis: string;
  videoUrl: string;
  thumbnailUrl: string;
  creatorId: string;
  ageRating: "L" | "10" | "12" | "14" | "16" | "18";
  categoryIds: string[];
}) {
  return db.transaction(async (tx) => {
    const [movie] = await tx
      .insert(movies)
      .values({
        title: data.title,
        synopsis: data.synopsis,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        creatorId: data.creatorId,
        ageRating: data.ageRating,
        status: "PUBLISHED",
      })
      .returning();

    if (data.categoryIds.length > 0) {
      await tx.insert(movieCategories).values(
        data.categoryIds.map((categoryId) => ({
          movieId: movie.id,
          categoryId,
        })),
      );
    }

    return movie;
  });
}

/* ========== Verifica se um filme está favoritado por um usuário ========== */
export async function isMovieFavorited(userId: string, movieId: string) {
  const result = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)))
    .limit(1);

  return result.length > 0;
}

/* ========== Favorita ou remove o favorito deste usuário neste filme ========== */
export async function toggleMovieFavorite(userId: string, movieId: string) {
  const removed = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)))
    .returning({ id: favorites.id });

  if (removed.length > 0) {
    return false;
  }

  await db.insert(favorites).values({ userId, movieId });
  return true;
}

/* ========== Pega os IDs dos filmes favoritados por um usuário ========== */
export async function getFavoriteMovieIds(userId: string) {
  const result = await db
    .select({ movieId: favorites.movieId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return result.map((favorite) => favorite.movieId);
}

/* ========== Pega os filmes publicados ========== */
export async function getMovies(search?: string) {
  const filters = [eq(movies.status, "PUBLISHED")];

  if (search?.trim()) {
    const term = `%${search.trim()}%`;

    filters.push(or(ilike(movies.title, term), ilike(movies.synopsis, term))!);
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
    .where(and(eq(movies.id, movieId), eq(movies.status, "PUBLISHED")))
    .limit(1);

  return movie ?? null;
}

/* ========== Filme dono desta chave de vídeo ou thumbnail ========== */
export async function getMovieByMediaKey(mediaKey: string) {
  const [movie] = await db
    .select({
      id: movies.id,
      status: movies.status,
      creatorId: movies.creatorId,
    })
    .from(movies)
    .where(or(eq(movies.videoUrl, mediaKey), eq(movies.thumbnailUrl, mediaKey)))
    .limit(1);

  return movie ?? null;
}
/* ========== Média e quantidade de avaliações de um filme ========== */
export async function getMovieRatingSummary(movieId: string) {
  const [summary] = await db
    .select({
      averageRating: sql<number | null>`avg(${ratings.score}) / 2`,
      ratingsCount: sql<number>`count(*)::int`,
    })
    .from(ratings)
    .where(eq(ratings.movieId, movieId));

  return {
    averageRating: summary?.averageRating ?? null,
    ratingsCount: summary?.ratingsCount ?? 0,
  };
}
/* ========== Filme para a tela de reprodução, em qualquer status ========== */
export async function getMovieForPlayback(movieId: string) {
  const [movie] = await db
    .select()
    .from(movies)
    .where(eq(movies.id, movieId))
    .limit(1);
  return movie ?? null;
}
/* ========== Cria ou atualiza a avaliação deste usuário neste filme ========== */
export async function upsertUserMovieRating(data: {
  userId: string;
  movieId: string;
  score: number;
  comment: string | null;
}) {
  const storedScore = Math.round(data.score * 2);
  await db
    .insert(ratings)
    .values({
      movieId: data.movieId,
      userId: data.userId,
      score: storedScore,
      comment: data.comment,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.movieId],
      set: {
        score: storedScore,
        comment: data.comment,
        updatedAt: new Date(),
      },
    });
}
/* ========== Salva até onde este usuário assistiu o filme ========== */
export async function upsertWatchProgress(data: {
  userId: string;
  movieId: string;
  progressSeconds: number;
}) {
  await db
    .insert(watchProgress)
    .values({
      userId: data.userId,
      movieId: data.movieId,
      progressSeconds: data.progressSeconds,
    })
    .onConflictDoUpdate({
      target: [watchProgress.userId, watchProgress.movieId],
      set: {
        progressSeconds: data.progressSeconds,
        lastWatchedAt: new Date(),
      },
    });
}

/* ========== Até onde este usuário assistiu o filme (0 se nunca assistiu) ========== */
export async function getUserWatchProgress(userId: string, movieId: string) {
  const [row] = await db
    .select({ progressSeconds: watchProgress.progressSeconds })
    .from(watchProgress)
    .where(
      and(eq(watchProgress.userId, userId), eq(watchProgress.movieId, movieId)),
    )
    .limit(1);
  return row?.progressSeconds ?? 0;
}

/* ========== Avaliação deste usuário neste filme ========== */
export async function getUserMovieRating(userId: string, movieId: string) {
  const [rating] = await db
    .select({
      score: ratings.score,
      comment: ratings.comment,
    })
    .from(ratings)
    .where(and(eq(ratings.userId, userId), eq(ratings.movieId, movieId)))
    .limit(1);

  if (!rating) return null;

  return {
    score: rating.score / 2,
    comment: rating.comment,
  };
}

/* ========== Pega os filmes de um criador ========== */
export async function getMoviesByCreator(creatorId: string) {
  const averageRatings = db
    .select({
      movieId: ratings.movieId,
      averageRating: sql<number>`avg(${ratings.score}) / 2`.as(
        "average_rating",
      ),
      ratingsCount: sql<number>`count(*)::int`.as("ratings_count"),
    })
    .from(ratings)
    .groupBy(ratings.movieId)
    .as("average_ratings");

  const movieCategoryNames = db
    .select({
      movieId: movieCategories.movieId,

      category: sql<string>`
        string_agg(
          ${categories.name},
          ', ' ORDER BY ${categories.name}
        )
      `.as("category"),

      categoryIds: sql<string[]>`
        array_agg(
          ${movieCategories.categoryId}
          ORDER BY ${categories.name}
        )
      `.as("category_ids"),
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .groupBy(movieCategories.movieId)
    .as("movie_category_names");

  return db
    .select({
      id: movies.id,
      title: movies.title,
      synopsis: movies.synopsis,
      videoUrl: movies.videoUrl,
      thumbnailUrl: movies.thumbnailUrl,
      status: movies.status,
      banReason: movies.banReason,
      ageRating: movies.ageRating,
      creatorId: movies.creatorId,
      createdAt: movies.createdAt,
      updatedAt: movies.updatedAt,
      category: sql<string>`coalesce(${movieCategoryNames.category}, '')`,
      averageRating: sql<number | null>`${averageRatings.averageRating}`,
      categoryIds: movieCategoryNames.categoryIds,
      ratingsCount: sql<number>`coalesce(${averageRatings.ratingsCount}, 0)`,
    })
    .from(movies)
    .leftJoin(movieCategoryNames, eq(movieCategoryNames.movieId, movies.id))
    .leftJoin(averageRatings, eq(averageRatings.movieId, movies.id))
    .where(eq(movies.creatorId, creatorId))
    .orderBy(desc(movies.createdAt));
}

/* ========== Pega os filmes para moderação ========== */
export async function getMoviesForModeration() {
  const averageRatings = db
    .select({
      movieId: ratings.movieId,
      averageRating: sql<number>`avg(${ratings.score}) / 2`.as(
        "average_rating",
      ),
      ratingsCount: sql<number>`count(*)::int`.as("ratings_count"),
    })
    .from(ratings)
    .groupBy(ratings.movieId)
    .as("average_ratings");
  const movieCategoryNames = db
    .select({
      movieId: movieCategories.movieId,
      category: sql<string>`
        string_agg(
          ${categories.name},
          ', ' ORDER BY ${categories.name}
        )
      `.as("category"),
      categoryIds: sql<string[]>`
        array_agg(
          ${movieCategories.categoryId}
          ORDER BY ${categories.name}
        )
      `.as("category_ids"),
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .groupBy(movieCategories.movieId)
    .as("movie_category_names");
  return db
    .select({
      id: movies.id,
      title: movies.title,
      synopsis: movies.synopsis,
      videoUrl: movies.videoUrl,
      thumbnailUrl: movies.thumbnailUrl,
      status: movies.status,
      banReason: movies.banReason,
      ageRating: movies.ageRating,
      creatorId: movies.creatorId,
      creatorName: user.name,
      createdAt: movies.createdAt,
      updatedAt: movies.updatedAt,
      category: sql<string>`coalesce(${movieCategoryNames.category}, '')`,
      categoryIds: movieCategoryNames.categoryIds,
      averageRating: sql<number | null>`${averageRatings.averageRating}`,
      ratingsCount: sql<number>`coalesce(${averageRatings.ratingsCount}, 0)`,
    })
    .from(movies)
    .innerJoin(user, eq(user.id, movies.creatorId))
    .leftJoin(movieCategoryNames, eq(movieCategoryNames.movieId, movies.id))
    .leftJoin(averageRatings, eq(averageRatings.movieId, movies.id))
    .orderBy(desc(movies.createdAt));
}

/* ========== Banir um filme ========== */
export async function banMovie(movieId: string, reason: string) {
  const [movie] = await db
    .update(movies)
    .set({
      status: "BANNED",
      banReason: reason.trim(),
    })
    .where(and(eq(movies.id, movieId), eq(movies.status, "PUBLISHED")))
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
        or(eq(movies.status, "BANNED"), eq(movies.status, "PENDING_REVIEW")),
      ),
    )
    .returning();
  return movie ?? null;
}

/* ========== Lista os usuários ========== */
export async function getUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
}

/* ========== Lista as categorias ========== */
export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

/* ========== Pega uma categoria pelo ID ========== */
export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category ?? null;
}

/* ========== Pega uma categoria pelo nome ========== */
export async function getCategoryByName(name: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  return category ?? null;
}

/* ========== Categorias que possuem filme publicado ========== */
export async function getCategoriesWithPublishedMovies() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .innerJoin(movieCategories, eq(movieCategories.categoryId, categories.id))
    .innerJoin(movies, eq(movies.id, movieCategories.movieId))
    .where(eq(movies.status, "PUBLISHED"))
    .groupBy(categories.id, categories.name)
    .orderBy(asc(categories.name));
}

/* ========== Filmes publicados para o catálogo ========== */
export async function getCatalogMovies() {
  const averageRatings = db
    .select({
      movieId: ratings.movieId,
      averageRating: sql<number>`avg(${ratings.score}) / 2`.as(
        "average_rating",
      ),
      ratingsCount: sql<number>`count(*)::int`.as("ratings_count"),
    })
    .from(ratings)
    .groupBy(ratings.movieId)
    .as("average_ratings");

  const movieCategoryNames = db
    .select({
      movieId: movieCategories.movieId,
      category: sql<string>`
        string_agg(${categories.name}, ', ' ORDER BY ${categories.name})
      `.as("category"),
      categoryIds: sql<string[]>`
        array_agg(${movieCategories.categoryId} ORDER BY ${categories.name})
      `.as("category_ids"),
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .groupBy(movieCategories.movieId)
    .as("movie_category_names");

  return db
    .select({
      id: movies.id,
      title: movies.title,
      synopsis: movies.synopsis,
      thumbnailUrl: movies.thumbnailUrl,
      status: movies.status,
      banReason: movies.banReason,
      creatorId: movies.creatorId,
      creatorName: user.name,
      category: sql<string>`coalesce(${movieCategoryNames.category}, '')`,
      categoryIds: movieCategoryNames.categoryIds,
      averageRating: sql<number | null>`${averageRatings.averageRating}`,
      ratingsCount: sql<number>`coalesce(${averageRatings.ratingsCount}, 0)`,
    })
    .from(movies)
    .innerJoin(user, eq(user.id, movies.creatorId))
    .leftJoin(movieCategoryNames, eq(movieCategoryNames.movieId, movies.id))
    .leftJoin(averageRatings, eq(averageRatings.movieId, movies.id))
    .where(eq(movies.status, "PUBLISHED"))
    .orderBy(desc(movies.createdAt));
}

/* ========== Pega os comentários de um filme ========== */
export async function getMovieComments(movieId: string) {
  const rows = await db
    .select({
      id: ratings.id,
      comment: ratings.comment,
      score: ratings.score,
      createdAt: ratings.createdAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(ratings)
    .innerJoin(user, eq(user.id, ratings.userId))
    .where(
      and(
        eq(ratings.movieId, movieId),
        sql`length(trim(coalesce(${ratings.comment}, ''))) > 0`,
      ),
    )
    .orderBy(desc(ratings.createdAt));
  return rows.map((row) => ({
    ...row,
    score: row.score / 2,
  }));
}
