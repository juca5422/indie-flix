import { ROLES, type UserRole } from "@/lib/roles";

export type MovieStatus = "PUBLISHED" | "BANNED" | "PENDING_REVIEW";

export type MovieContext =
  | "HOME"
  | "FILMMAKER"
  | "ADMIN_MOVIES"
  | "ADMIN_REVIEW";

export type MovieAction = "REQUEST_REVIEW" | "EDIT" | "BAN" | "PUBLISH";

type MoviePolicyInput = {
  role: UserRole;
  context: MovieContext;
  status: MovieStatus;
  isOwner: boolean;
};

type WatchPolicyInput = {
  role: UserRole;
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
    const isCreator =
      (role === ROLES.FILMMAKER || role === ROLES.ADMIN) && isOwner;
    if (!isCreator) return [];
    if (status === "PUBLISHED") return ["EDIT"];
    if (status === "BANNED") return ["REQUEST_REVIEW"];
    return [];
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

export function canWatchMovie({ role, status, isOwner }: WatchPolicyInput) {
  if (status === "PUBLISHED") {
    return true;
  }
  if (status === "PENDING_REVIEW" || status === "BANNED") {
    if (role === ROLES.ADMIN) return true;
    return role === ROLES.FILMMAKER && isOwner;
  }
  return false;
}
