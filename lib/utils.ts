import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilitaire classnames pour shadcn/ui
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
