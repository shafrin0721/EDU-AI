import React, { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

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
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center gap-3", className)}>
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          icon="Search"
          className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-primary-300 focus:border-primary-500 focus:shadow-md transition-all duration-200"
        />
      </div>
      
      {showFilter && filters.length > 0 && (
        <div className="flex items-center space-x-3 min-w-fit">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg">
            <ApperIcon name="Filter" size={16} className="text-gray-500" />
          </div>
<select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="flex-1 sm:flex-none sm:min-w-[140px] h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%205%22><path%20fill=%22%23666%22%20d=%22M2%200L0%202h4zm0%205L0%203h4z%22/></svg>')] bg-no-repeat bg-right bg-[length:12px] pr-8"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value} className="py-2">
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