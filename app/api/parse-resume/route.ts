import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Forward to FastAPI backend
    const backendUrl = process.env.FASTAPI_BACKEND_URL || "http://localhost:8000"
    
    const backendFormData = new FormData()
    backendFormData.append("file", file)
    
    const response = await fetch(`${backendUrl}/api/parse-resume`, {
      method: "POST",
      body: backendFormData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to parse resume", details: errorText },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("Parse resume error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
