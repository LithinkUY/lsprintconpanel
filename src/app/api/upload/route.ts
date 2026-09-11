import { NextRequest, NextResponse } from "next/server";

// ── Cloudinary upload (production) ───────────────────────────
async function uploadToCloudinary(
    buffer: Buffer,
    filename: string,
    folder: string,
    resourceType: "image" | "video" | "raw" = "image"
): Promise<string> {
    const cloudinary = await import("cloudinary");
    const v2 = cloudinary.v2;

    // Use built-in env parser for CLOUDINARY_URL
    v2.config(true);

    return new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
            {
                folder: `lsprint/${folder}`,
                public_id: filename,
                resource_type: resourceType,
                overwrite: true,
            },
            (err, result) => {
                if (err || !result) return reject(err ?? new Error("Upload to Cloudinary failed"));
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

// ── Local filesystem upload (development) ────────────────────
async function uploadToLocal(
    buffer: Buffer,
    filename: string,
    type: string
): Promise<string> {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");

    if (type === "favicon") {
        const faviconPath = path.join(process.cwd(), "public", "favicon.ico");
        await writeFile(faviconPath, buffer);
        return `/favicon.ico?v=${Date.now()}`;
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get("file") as File | null;
        const type = (data.get("type") as string | null) ?? "media";

        if (!file) {
            return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const hasCloudinary = Boolean(process.env.CLOUDINARY_URL);

        // Vercel serverless request limits
        if (!hasCloudinary && isVideo && file.size > 4.5 * 1024 * 1024) {
            return NextResponse.json(
                {
                    error:
                        "El video supera el límite de 4.5MB. Configura CLOUDINARY_URL en las variables de entorno de Vercel o pega una URL de YouTube / enlace MP4 directo.",
                },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
        const slug =
            type === "logo"
                ? "logo"
                : type === "logo_mobile"
                ? "logo-mobile"
                : type === "favicon"
                ? "favicon"
                : "media";

        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueId = `${slug}-${Date.now()}-${randomStr}`;
        const filename = `${uniqueId}.${ext}`;

        // 1. Try Cloudinary if configured
        if (hasCloudinary) {
            try {
                const folder =
                    type === "logo" || type === "logo_mobile"
                        ? "logos"
                        : type === "favicon"
                        ? "favicon"
                        : "media";
                const resourceType = isVideo ? "video" : "image";
                const url = await uploadToCloudinary(buffer, uniqueId, folder, resourceType);
                return NextResponse.json({ url });
            } catch (cloudErr) {
                console.warn("[upload] Cloudinary upload failed, attempting fallback:", cloudErr);
            }
        }

        // 2. Try local filesystem (working in local dev environment)
        try {
            const url = await uploadToLocal(buffer, filename, type);
            return NextResponse.json({ url });
        } catch (fsErr) {
            // 3. Fallback for serverless (Vercel read-only filesystem without Cloudinary)
            // Return base64 Data URL so the application continues to function seamlessly
            const mimeType = file.type || (isVideo ? "video/mp4" : "image/jpeg");
            const base64Data = buffer.toString("base64");
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            return NextResponse.json({ url: dataUrl });
        }
    } catch (err) {
        console.error("[upload]", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
