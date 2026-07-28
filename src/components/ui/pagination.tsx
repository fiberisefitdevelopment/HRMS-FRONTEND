import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

function Pagination({ className, page, pageCount, onPageChange, ...props }: PaginationProps) {
  const pages = React.useMemo(() => {
    const items: (number | "ellipsis")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) {
        items.push(i);
      }
      if (page < pageCount - 2) items.push("ellipsis");
      items.push(pageCount);
    }
    return items;
  }, [page, pageCount]);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li key={`ellipsis-${i}`}>
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            </li>
          ) : (
            <li key={p}>
              <Button
                variant={page === p ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(p)}
                aria-current={page === p ? "page" : undefined}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </Button>
            </li>
          )
        )}
        <li>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export { Pagination };
