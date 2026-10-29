export const instant = false;

import { CategoryNav } from "@/components/home/category-nav";
import { toCategorySlug } from "@/lib/categories/slug";
import { getCategoriesWithPublishedMovies } from "@/lib/queries/queries";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategoriesWithPublishedMovies();

  const links = [
    { label: "Todos", href: "/home" },
    ...categories.map((category) => ({
      label: category.name,
      href: `/home/${toCategorySlug(category.name)}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <CategoryNav links={links} />
      {children}
    </div>
  );
}
