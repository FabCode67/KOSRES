import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/revalidate
 * Called after admin creates/edits/deletes a property.
 * Clears Next.js cache so the customer site reflects changes immediately.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== (process.env.REVALIDATE_SECRET || "kosres_revalidate_2024")) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  // Revalidate all property-related pages
  revalidatePath("/")
  revalidatePath("/properties")
  revalidatePath("/properties/[id]", "page")

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
