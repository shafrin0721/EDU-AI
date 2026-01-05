import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { login, clearError } from "@/store/slices/authSlice"
import Card from "@/components/atoms/Card"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import userService from "@/services/api/userService"

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { error, isAuthenticated } = useSelector(state => state.auth)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/")
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (error) {
      dispatch(clearError())
    }
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required")
      return false
    }
    
    if (!formData.lastName.trim()) {
      toast.error("Last name is required")
      return false
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    
    if (!formData.password) {
      toast.error("Password is required")
      return false
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // Check if email already exists
      const emailExists = await userService.emailExists(formData.email)
      if (emailExists) {
        toast.error("An account with this email already exists")
        setLoading(false)
        return
      }

      // Create new user
      const newUser = await userService.create({
        email: formData.email,
        role: "student", // Default role for new registrations
        organizationId: "org_001", // Default organization
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          avatar: "/api/placeholder/40/40",
          learningStreak: 0,
          totalPoints: 0,
          level: 1,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: {
            learning: {
              preferredDifficulty: "beginner"
            },
            notifications: {
              email: true,
              push: true,
              achievements: true
            }
          }
        },
        permissions: {
          canCreateCourse: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canEditProfile: true
        },
        password: formData.password // In real app, this would be hashed
      })

      dispatch(login(newUser))
      toast.success(`Welcome to EduAI, ${newUser.profile.firstName}!`)
      navigate("/")
    } catch (err) {
      toast.error(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="GraduationCap" size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              EduAI
            </h1>
          </div>
          <p className="text-gray-600">Start your personalized learning journey</p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="w-full"
                  icon="User"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full"
                icon="Mail"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full pr-12"
                  icon="Lock"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full pr-12"
                  icon="Lock"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-3"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Register