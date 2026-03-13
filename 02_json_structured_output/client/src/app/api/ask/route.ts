import { NextResponse } from "next/server";

// Fall back to localhost when the env variable is not set
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Proxy POST /api/ask -> backend /ask, forwarding the request body as-is
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward the request to the Express backend
    const apiResponse = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();

    // Mirror the backend's status code so the client sees the real error codes
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (err: any) {
    // Network or JSON parse failure
    return NextResponse.json(
      { error: "Failed to fetch answer" },
      { status: 500 },
    );
  }
}
