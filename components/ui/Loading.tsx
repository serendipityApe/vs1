interface LoadingProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  centered?: boolean;
  className?: string;
}

export const Loading = ({
  size = "md",
  label,
  centered = false,
  className = "",
}: LoadingProps) => {
  const content = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="font-mono font-bold text-primary uppercase animate-pulse">
        {">"} {label || "LOADING..."}{" "}
        <span className="inline-block w-2 h-4 bg-primary animate-bounce" />
      </div>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-32 border-2 border-dashed border-foreground/20">
        {content}
      </div>
    );
  }

  return content;
};

// 页面级Loading组件
export const LoadingPage = ({
  label = "SYSTEM_INITIALIZING...",
}: {
  label?: string;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="border-2 border-foreground p-8 bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <Loading label={label} size="lg" />
      </div>
    </div>
  );
};

// 卡片内Loading组件
export const LoadingCard = ({
  label = "FETCHING_DATA...",
}: {
  label?: string;
}) => {
  return (
    <div className="text-center py-12 border-2 border-dashed border-foreground/50 bg-content2/50">
      <Loading label={label} size="md" />
    </div>
  );
};
