import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { customer_name } = await req.json();

    if (!customer_name) {
      return Response.json({ error: 'customer_name required' }, { status: 400 });
    }

    // Check if client already exists
    const existing = await base44.asServiceRole.entities.Client.filter(
      { company_name: customer_name },
      '',
      1
    );

    if (existing.length > 0) {
      return Response.json({ success: true, created: false, client_id: existing[0].id });
    }

    // Create new client
    const newClient = await base44.asServiceRole.entities.Client.create({
      company_name: customer_name,
      active: true
    });

    return Response.json({ success: true, created: true, client_id: newClient.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});