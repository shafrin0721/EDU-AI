import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error("Failed to mount app:", error)
  document.body.innerHTML = `<h1>Error loading app: ${error.message}</h1><pre>${error.stack}</pre>`
}