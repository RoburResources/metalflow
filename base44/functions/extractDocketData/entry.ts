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
                    "type": "number",
                    "description": "Gross weight in tonnes extracted from the document"
                },
                "tare_tonnes": {
                    "type": "number",
                    "description": "Tare weight in tonnes extracted from the document"
                },
                "net_tonnes": {
                    "type": "number",
                    "description": "Net weight in tonnes extracted from the document"
                },
                "notes_from_document": {
                    "type": "string",
                    "description": "Any additional notes or comments extracted from the document"
                },
                "material_grading_from_document": {
                    "type": "string",
                    "description": "Material grade information extracted from the document"
                },
                "raw_document_text": {
                    "type": "string",
                    "description": "The full raw text content extracted from the document, for audit purposes"
                }
            }
        };

        const ocrResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: file_url,
            json_schema: jsonSchema
        });

        if (ocrResult.status === 'success') {
            return Response.json(ocrResult.output);
        } else {
            return Response.json({ error: ocrResult.details || 'OCR extraction failed' }, { status: 500 });
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});