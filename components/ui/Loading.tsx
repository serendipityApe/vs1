import { CircularProgress } from "@heroui/react";

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
  className = ""
}: LoadingProps) => {
  const content = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <CircularProgress
        size={size}
        aria-label={label || "Loading..."}
        color="primary"
      />
      {label && (
        <p className="text-sm text-foreground-600">{label}</p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-32">
        {content}
      </div>
    );
  }

  return content;
};

// 页面级Loading组件
export const LoadingPage = ({
  label = "Loading..."
}: {
  label?: string
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" label={label} />
    </div>
  );
};

// 卡片内Loading组件
export const LoadingCard = ({
  label = "Loading..."
}: {
  label?: string
}) => {
  return (
    <div className="text-center py-8">
      <Loading size="md" label={label} />
    </div>
  );
};