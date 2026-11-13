"use client";

import { useState } from "react";

interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
}

export function Tabs({ items, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultValue ?? items[0]?.value ?? "",
  );

  const activeItem = items.find((item) => item.value === activeTab);

  if (items.length === 0) return null;

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex gap-2 overflow-x-auto border-b border-app-border"
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={activeTab === item.value}
            onClick={() => setActiveTab(item.value)}
            className={[
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === item.value
                ? "border-maroon-700 text-maroon-700"
                : "border-transparent text-secondary-text hover:text-maroon-700",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-5">
        {activeItem?.content}
      </div>
    </div>
  );
}
