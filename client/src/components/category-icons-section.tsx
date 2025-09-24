import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CategoryIcon } from "@shared/schema";
import categoryImagesPath from "@assets/image_1756293848206.png";

export default function CategoryIconsSection() {
  const { data: categoryIcons = [], isLoading } = useQuery<CategoryIcon[]>({
    queryKey: ["/api/category-icons"],
  });

  // Only show active icons, sorted by sortOrder
  const activeIcons = (categoryIcons as CategoryIcon[])
    .filter((icon: CategoryIcon) => icon.isActive)
    .sort((a: CategoryIcon, b: CategoryIcon) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (isLoading) {
    return (
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded mb-2 mx-auto"></div>
                <div className="w-16 h-3 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!activeIcons.length) return null;

  return (
    <section className="py-8 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
          {activeIcons.map((icon: CategoryIcon) => (
            <Link 
              key={icon.id} 
              href={icon.linkUrl || "/"}
              className="text-center group cursor-pointer"
              data-testid={`category-icon-${icon.id}`}
            >
              <div className="w-full aspect-square mx-auto mb-3 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden group-hover:shadow-md transition-all duration-300">
                <img 
                  src={icon.icon} 
                  alt={icon.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm font-medium text-gray-800 leading-tight group-hover:text-primary transition-colors">
                {icon.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}