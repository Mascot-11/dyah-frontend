// src/components/Reviews.jsx

import { useEffect } from "react"

export function ReviewsWidget() {
  // Elfsight script loader
  useEffect(() => {
    if (!document.getElementById("elfsight-platform-script")) {
      const script = document.createElement("script")
      script.id = "elfsight-platform-script"
      script.src = "https://static.elfsight.com/platform/platform.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <section
      className="min-h-[600px] bg-[#111] px-6 py-12 rounded-2xl max-w-5xl mx-auto mt-20 shadow-xl border border-white/10"
    >
      <h2 className="text-center text-4xl md:text-5xl font-bold text-white mb-10 tracking-wide uppercase">
        Reviews
      </h2>

      <div
        className="elfsight-app-630343bd-1a1d-4829-a430-1629cc02c6f9"
        data-elfsight-app-lazy
        style={{
          width: "100%",
          height: "490px",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "inset 0 0 40px #000000",
          backgroundColor: "#111",
        }}
      />
    </section>
  )
}

export default ReviewsWidget
