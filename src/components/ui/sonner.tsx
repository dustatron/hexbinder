import { FaCheckCircle, FaInfoCircle, FaSpinner, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "~/components/theme-provider";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <FaCheckCircle className="size-4" />,
        info: <FaInfoCircle className="size-4" />,
        warning: <FaExclamationTriangle className="size-4" />,
        error: <FaTimesCircle className="size-4" />,
        loading: <FaSpinner className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
