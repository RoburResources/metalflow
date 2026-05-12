import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        const jsonSchema = {
            "type": "object",
            "properties": {
                "gross_tonnes": {
                    "type": ["number", "null"],
                    "description": "Gross weight in tonnes extracted from the document. Null if not found."
                },
                "tare_tonnes": {
                    "type": ["number", "null"],
                    "description": "Tare weight in tonnes extracted from the document. Null if not found."
                },
                "net_tonnes": {
                    "type": ["number", "null"],
                    "description": "Net weight in tonnes extracted from the document. Null if not found."
                },
                "notes_from_document": {
                    "type": ["string", "null"],
                    "description": "Any additional notes or comments extracted from the document. Null if not found."
                },
                "material_grading_from_document": {
                    "type": ["string", "null"],
                    "description": "Material grade or product type extracted from the document. Null if not found."
                },
                "raw_document_text": {
                    "type": ["string", "null"],
                    "description": "The full raw text content extracted from the document, for audit purposes."
                }
            }
        };

        const ocrResult = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert at reading weighbridge tickets and delivery dockets. 
Extract all available data from this document image. 
Look for gross weight, tare weight, net weight (in tonnes), any notes or comments, and material grade/product type.
Return null for any field you cannot find or read clearly.`,
            file_urls: [file_url],
            response_json_schema: jsonSchema
        });

        return Response.json(ocrResult);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});