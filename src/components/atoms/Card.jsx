import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

const Card = forwardRef(({ 
  children, 
  className,
  variant = "default",
  hoverable = false,
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-xl border border-gray-200 overflow-hidden"
  
  const variants = {
    default: "shadow-sm",
    elevated: "shadow-lg",
    glass: "glass-card shadow-lg",
    ai: "ai-card shadow-lg relative"
  }

  const CardComponent = hoverable ? motion.div : "div"
  const motionProps = hoverable ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
    },
    transition: { duration: 0.2 }
  } : {}

  return (
    <CardComponent
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        hoverable && "transition-all duration-200 cursor-pointer",
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  )
})

Card.displayName = "Card"

export default Card