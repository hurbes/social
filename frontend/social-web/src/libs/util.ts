import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const POST_QUERY_LIMIT = 5;
const COMMENT_QUERY_LIMIT = 5;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { cn, POST_QUERY_LIMIT, COMMENT_QUERY_LIMIT };
