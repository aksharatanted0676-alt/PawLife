import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/connectMongo";
import { PetHealthImageAnalysisModel } from "@/lib/models/PetHealthImageAnalysis";
import { simulatePetHealthAnalysis } from "@/lib/petHealthSimulation";
import type { PetType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png"]);
const PET_TYPES: PetType[] = ["dog", "cat", "bird", "rabbit", "fish"];

function isPetType(s: string): s is PetType {
  return (PET_TYPES as string[]).includes(s);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("image");
    const petTypeRaw = form.get("petType");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    if (!petTypeRaw || typeof petTypeRaw !== "string") {
      return NextResponse.json({ error: "petType is required" }, { status: 400 });
    }

    const petType = petTypeRaw.toLowerCase().trim();
    if (!isPetType(petType)) {
      return NextResponse.json(
        { error: "Invalid petType. Use: dog, cat, bird, rabbit, or fish." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG and PNG are allowed." }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Empty image file" }, { status: 400 });
    }

    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
    }

    const analysis = simulatePetHealthAnalysis(petType);

    let recordId: string | undefined;
    const mongo = await connectMongo();
    if (mongo) {
      try {
        const doc = await PetHealthImageAnalysisModel.create({
          petType,
          issue: analysis.issue,
          confidence: analysis.confidence,
          risk: analysis.risk,
          description: analysis.description,
          action: analysis.action,
          steps: analysis.steps,
          originalFilename: file.name || undefined,
          imageSizeBytes: file.size
        });
        recordId = doc._id.toString();
      } catch (dbErr) {
        console.error("Failed to save analysis:", dbErr);
      }
    }

    return NextResponse.json({
      ...analysis,
      ...(recordId ? { recordId } : {})
    });
  } catch (err) {
    console.error("analyze-image error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
