import { Deta } from "deta";
import { NextResponse } from "next/server";

const deta = Deta(process.env.DETA_PROJECT_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const drive = deta.Drive(body.key);
    const data = await drive.get(body.fileName);

    if (!data) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // Set appropriate headers for binary data
    const headers = {
      "Content-Type": "application/pdf", // Set the correct content type
      "Content-Disposition": `attachment; filename=${body.fileName}` // Set the filename for download
    };

    // Return the binary data with appropriate headers
    return NextResponse.json(data, {headers})
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}