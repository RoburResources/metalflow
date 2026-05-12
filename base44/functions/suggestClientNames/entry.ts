import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query } = await req.json();

        if (!query || query.trim().length < 2) {
            return Response.json({ suggestions: [] });
        }

        const jsonSchema = {
            "type": "object",
            "properties": {
                "suggestions": {
                    "type": "array",
                    "description": "List of company/business names matching the query",
                    "items": {
                        "type": "string"
                    }
                }
            }
        };

        const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Search for companies and businesses in Western Australia matching the query: "${query}". 
Return up to 5 company or business names that are most relevant. Focus on recycling, scrap metal, waste management, manufacturing, and logistics companies if applicable.
Be specific and return only real company names.`,
            add_context_from_internet: true,
            response_json_schema: jsonSchema
        });

        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});