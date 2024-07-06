import { title } from "process";
import React from "react";
import { Loader } from "./loader";
import { cn } from "@/libs/util";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
  title: string;
  type?: "button" | "submit" | "reset";
  href?: string;
}

const AppButton: React.FC<ButtonProps> = ({
  onClick,
  className,
  isLoading = false,
  type = "button",
  title,
  href,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        className
      )}
      disabled={isLoading}>
      {isLoading ? <Loader /> : <span>{title}</span>}
    </button>
  );
};

export { AppButton };
