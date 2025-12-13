
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    heading: string;
    text?: string;
    children?: React.ReactNode;
}

export function PageHeader({
    heading,
    text,
    children,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 pb-4 md:pb-8", className)} {...props}>
            <div className="flex items-center justify-between gap-2">
                <div className="grid gap-1">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {heading}
                    </h1>
                    {text && <p className="text-muted-foreground text-sm md:text-base">{text}</p>}
                </div>
                {children && <div className="flex items-center gap-2">{children}</div>}
            </div>
            <Separator />
        </div>
    );
}
