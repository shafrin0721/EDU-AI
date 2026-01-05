import { cn } from "@/utils/cn"

const Badge = ({ 
  children, 
  className,
  variant = "default",
  size = "default",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full"
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800",
    secondary: "bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800",
    accent: "bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800",
    warning: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800",
    danger: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
    outline: "border-2 border-gray-200 text-gray-600"
  }
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    default: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  }

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge