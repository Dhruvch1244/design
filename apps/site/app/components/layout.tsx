import { SkillPromoBanner } from "@/components/skill-promo-banner";
import { ComponentsSidebar } from "@/components/components-sidebar";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-32">
      <div className="pt-6">
        <SkillPromoBanner />
      </div>
      <div className="flex gap-12">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28">
            <ComponentsSidebar />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
