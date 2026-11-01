import { NextResponse } from "next/server";

import { getUniversities } from "@/lib/university-list";
import { filterUniversities } from "@/lib/university-api-filters";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const result = await getUniversities();

  return NextResponse.json(
    filterUniversities(result, new URL(request.url).searchParams),
    { headers: corsHeaders },
  );
}
