import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"

const ViewLogger = () => {
  const location = useLocation()

  useEffect(() => {
    axios.post("/log-view", {
      path: location.pathname,
    }).catch((err) => {
      console.error("Failed to log view:", err)
    })
  }, [location.pathname])

  return null
}

export default ViewLogger
