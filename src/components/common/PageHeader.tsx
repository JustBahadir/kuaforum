
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  button?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function PageHeader({ title, subtitle, button }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {button && (
        button.onClick ? (
          <Button className="mt-4 md:mt-0" onClick={button.onClick}>
            {button.label}
          </Button>
        ) : (
          <Button asChild className="mt-4 md:mt-0">
            <Link to={button.href || "#"}>{button.label}</Link>
          </Button>
        )
      )}
    </div>
  );
}
