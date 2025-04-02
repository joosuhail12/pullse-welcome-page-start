
import { cn } from "../../../lib/utils";

/**
 * Quick prompt button styles for the chat widget
 * @returns CSS classes for a quick prompt button
 */
export const quickPromptButtonStyles = () => {
  return cn(
    "text-sm text-left py-2 px-3 border border-gray-200 rounded-md bg-white",
    "transition-all duration-300 ease-in-out",
    "hover:bg-vivid-purple-50 hover:border-vivid-purple-200 hover:text-vivid-purple-700",
    "focus:outline-none focus:ring-2 focus:ring-vivid-purple-300",
    "active:scale-[0.98] active:bg-vivid-purple-100",
    "group"
  );
};

/**
 * Text animation styles for quick prompt button content
 * @returns CSS classes for animating text within a quick prompt button
 */
export const quickPromptTextStyles = () => {
  return "transition-transform duration-300 group-hover:translate-x-1 inline-block";
};
