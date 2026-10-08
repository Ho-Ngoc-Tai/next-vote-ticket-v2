import * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  /**
   * Khu vực bên phải: button, dropdown, filter...
   * Nếu không truyền thì header chỉ hiển thị title + mô tả.
   */
  actions?: React.ReactNode;
  className?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className }) => {
  const hasActions = Boolean(actions);

  return (
    <div
      className={cn("flex flex-col gap-2", hasActions && "md:flex-row md:items-center md:justify-between", className)}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      {hasActions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
