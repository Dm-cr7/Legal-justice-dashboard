// src/components/ui/SkeletonLoader.jsx
import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-28 bg-gray-300 dark:bg-gray-700 rounded-lg"
        ></div>
      ))}
    </div>
  );
}
