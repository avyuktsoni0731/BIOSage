import type { NextApiRequest, NextApiResponse } from "next";

// /pages/api/generate.ts

interface GenerateRequestBody {
    // Define the expected properties of the request body here
    // For example:
    // prompt: string;
    // maxTokens?: number;
    [key: string]: any;
}

interface GenerateResponseData {
    // Define the expected properties of the response data here
    // For example:
    // result: string;
    [key: string]: any;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GenerateResponseData | { message: string }>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const upstreamResponse = await fetch(
            `http://${process.env.NEXT_PUBLIC_EC2_IP}:11434/api/generate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body as GenerateRequestBody),
            }
        );

        const data: GenerateResponseData = await upstreamResponse.json();
        res.status(upstreamResponse.status).json(data);
    } catch (error) {
        console.error("Error proxying to Ollama generate:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
