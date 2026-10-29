import { ROLES, type UserRole } from "@/lib/roles";

export type MovieStatus = "PUBLISHED" | "BANNED" | "PENDING_REVIEW";

export type MovieContext =
  | "HOME"
  | "FILMMAKER"
  | "ADMIN_MOVIES"
  | "ADMIN_REVIEW";

export type MovieAction = "REQUEST_REVIEW" | "BAN" | "PUBLISH";

type MoviePolicyInput = {
  role: UserRole;
  context: MovieContext;
  status: MovieStatus;
  isOwner: boolean;
};

export function getMovieActions({
  role,
  context,
  status,
  isOwner,
}: MoviePolicyInput): MovieAction[] {
  // Catálogo público: sem ações administrativas.
  if (context === "HOME") {
    return [];
  }

  // Área de gerenciamento dos próprios filmes.
  if (context === "FILMMAKER") {
    const canRequestReview =
      (role === ROLES.FILMMAKER || role === ROLES.ADMIN) &&
      isOwner &&
      status === "BANNED";

    return canRequestReview ? ["REQUEST_REVIEW"] : [];
  }

  // As duas áreas administrativas são exclusivas do ADMIN.
  if (role !== ROLES.ADMIN) {
    return [];
  }

  if (context === "ADMIN_MOVIES") {
    if (status === "PUBLISHED") return ["BAN"];
    if (status === "BANNED") return ["PUBLISH"];
  }

  if (context === "ADMIN_REVIEW" && status === "PENDING_REVIEW") {
    return ["PUBLISH"];
  }

  return [];
}
