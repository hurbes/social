import { cn } from "@/libs/util";
import React from "react";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-gray-300 h-10 w-10 animate-spin rounded-full border-8 border-t-blue-600",
        className
      )}
    />
  );
};

export { Loader };
