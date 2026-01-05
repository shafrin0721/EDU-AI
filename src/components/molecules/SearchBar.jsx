import { useState } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"
import Input from "@/components/atoms/Input"

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch,
  className,
  showFilter = false,
  filters = []
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState(filters[0]?.value || "")

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch?.(value, selectedFilter)
  }

  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue)
    onSearch?.(searchTerm, filterValue)
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          icon="Search"
          className="pr-4"
        />
      </div>
      
      {showFilter && filters.length > 0 && (
        <div className="flex items-center space-x-2">
          <ApperIcon name="Filter" size={16} className="text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default SearchBar