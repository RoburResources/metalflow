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
                    "description": "Gross weight in tonnes extracted from the document. Look for 'Gross' or 'Total'. Null if not found."
                },
                "tare_tonnes": {
                    "type": ["number", "null"],
                    "description": "Tare weight in tonnes extracted from the document. Look for 'Tare' or 'Empty'. Null if not found."
                },
                "net_tonnes": {
                    "type": ["number", "null"],
                    "description": "Net weight in tonnes extracted from the document. Look for 'Net' or 'Net Weight'. Null if not found."
                },
                "rego": {
                    "type": ["string", "null"],
                    "description": "Vehicle registration number. Look for 'Rego', 'Vehicle', or 'Plate'. Null if not found."
                },
                "driver_name": {
                    "type": ["string", "null"],
                    "description": "Driver name. Look for 'Driver' or signature labels. Null if not found."
                },
                "customer_name": {
                    "type": ["string", "null"],
                    "description": "Customer or company name. Look for 'Customer', 'Client', 'From', or 'To'. Null if not found."
                },
                "from_location": {
                    "type": ["string", "null"],
                    "description": "Pickup location or origin address. Look for 'From', 'Location', or 'Address'. Null if not found."
                },
                "to_location": {
                    "type": ["string", "null"],
                    "description": "Delivery location or destination. Look for 'To', 'Deliver', or 'Destination'. Null if not found."
                },
                "goods_weighed": {
                    "type": ["string", "null"],
                    "description": "Description of goods or material. Look for 'Material', 'Goods', or 'Product'. Null if not found."
                },
                "material_grading_from_document": {
                    "type": ["string", "null"],
                    "description": "Material grade or product type (e.g., Heavy Melt Steel, Loose Steel). Null if not found."
                },
                "notes_from_document": {
                    "type": ["string", "null"],
                    "description": "Any additional notes, comments, or special instructions. Null if not found."
                }
            }
        };

        const ocrResult = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert OCR specialist for weighbridge tickets and delivery dockets (Australian standard forms).
Carefully extract ALL available data from this document image.
Look for:
- Weights: Gross (total), Tare (empty), Net (difference) - all in tonnes
- Vehicle: Registration number (Rego, Plate)
- Driver: Name and signature location
- Customer/Client: Company or person name
- Locations: From (pickup) and To (delivery) addresses
- Material: Description of goods/material type and grade
- Notes: Any special instructions, contamination notes, or comments

Be thorough and look at all text areas. Return null ONLY if a field is genuinely not visible or readable.`,
            file_urls: [file_url],
            response_json_schema: jsonSchema
        });

        // Validate response has at least some extracted data
        if (!ocrResult || typeof ocrResult !== 'object') {
            return Response.json({ error: 'Invalid response from document extraction' }, { status: 400 });
        }

        return Response.json(ocrResult);

    } catch (error) {
        console.error('Document extraction error:', error);
        return Response.json({
            error: `Failed to extract document data: ${error.message}`,
            details: error.toString()
        }, { status: 500 });
    }
});