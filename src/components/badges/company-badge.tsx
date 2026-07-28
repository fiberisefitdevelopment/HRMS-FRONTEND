import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CompanyBadgeProps {
  name: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { avatar: "h-5 w-5 text-[10px]", text: "text-xs" },
  md: { avatar: "h-6 w-6 text-xs", text: "text-sm" },
  lg: { avatar: "h-8 w-8 text-sm", text: "text-base" },
};

export function CompanyBadge({ name, logo, size = "md", className }: CompanyBadgeProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={sizeMap[size].avatar}>
        {logo && <AvatarImage src={logo} alt={name} />}
        <AvatarFallback className={sizeMap[size].avatar}>{initials}</AvatarFallback>
      </Avatar>
      <span className={cn("font-medium truncate", sizeMap[size].text)}>{name}</span>
    </div>
  );
}
