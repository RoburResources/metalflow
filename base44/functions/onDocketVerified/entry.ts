import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  let payload = {};
  try {
    const base44 = createClientFromRequest(req);
    payload = await req.json();

    const { event, data } = payload;

    // Only process verified dockets
    if (!data || data.status !== 'Verified') {
      return Response.json({ skipped: true });
    }

    const docket = data;
    const ticketNo = docket.ticket_no || 'N/A';
    const customerEmail = docket.customer_email;
    const customerName = docket.customer_name || docket.bill_to_name || 'Valued Customer';

    // Log the verification event
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'docket_verified',
      ticket_no: ticketNo,
      docket_id: event.entity_id,
      customer_name: customerName,
      customer_email: customerEmail || null,
      rego: docket.rego || null,
      net_tonnes: docket.net_tonnes ? parseFloat(docket.net_tonnes) : null,
      performed_by: docket.weigh_person_name || 'System',
      status: 'success',
      details: `Docket ${ticketNo} verified. Net: ${docket.net_tonnes || 0}t. Driver: ${docket.driver_name || 'N/A'}.`,
    });

    // Send email if customer email is present
    if (customerEmail) {
      const fmt = (v, fallback = '—') => v || fallback;
      const fmtNum = (v) => v ? parseFloat(v).toFixed(2) : '—';

      const grades = docket.material_grades?.length > 0
        ? docket.material_grades.map(g =>
            `${g.grade}${docket.material_grades.length > 1 ? ` (${g.percentage || 0}%)` : ''}`
          ).join(', ')
        : fmt(docket.material_grade);

      const emailBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f7fc; margin: 0; padding: 0; }
  .wrapper { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0B1929 0%, #12305C 55%, #1E4D99 100%); padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; }
  .header p { color: #90C4F9; margin: 6px 0 0; font-size: 13px; }
  .header .ticket { color: #fff; font-size: 14px; font-weight: 700; margin-top: 12px; }
  .body { padding: 28px 32px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #AAB0C4; margin: 20px 0 10px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
  .field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7A8898; display: block; margin-bottom: 3px; }
  .field span { font-size: 14px; font-weight: 700; color: #0D1A2E; }
  .weight-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin: 12px 0; }
  .weight-box { background: #F4F7FC; border-radius: 10px; padding: 14px; text-align: center; }
  .weight-box.highlight { background: #0B1929; }
  .weight-box .label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #AAB0C4; }
  .weight-box.highlight .label { color: #90C4F9; }
  .weight-box .value { font-size: 22px; font-weight: 900; color: #0D1A2E; margin-top: 4px; }
  .weight-box.highlight .value { color: #fff; }
  .weight-box .unit { font-size: 11px; color: #7A8898; }
  .weight-box.highlight .unit { color: #5BA3F5; }
  .grade-badge { display: inline-block; background: #EFF4FF; color: #1E4D99; border: 1px solid #DCE9FA; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin: 2px; }
  .footer { background: #F4F7FC; border-top: 1px solid #EAEEF5; padding: 18px 32px; text-align: center; }
  .footer p { font-size: 11px; color: #AAB0C4; margin: 0; }
  .divider { border: none; border-top: 1px solid #EAEEF5; margin: 18px 0; }
  .verified-badge { display: inline-flex; align-items: center; gap: 6px; background: #EDFBF3; color: #1B7A45; border: 1px solid #C3EDD5; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:1px;">Metal <span style="color:#5BA3F5;">X</span> Renewables</div>
    <p>Verified Weight Docket — Direct Measurement Ticket</p>
    <div class="ticket">Ticket: ${ticketNo}</div>
  </div>
  <div class="body">
    <div class="verified-badge">✓ Docket Verified</div>
    <p style="color:#0D1A2E;font-size:14px;">Dear ${customerName},</p>
    <p style="color:#7A8898;font-size:13px;line-height:1.6;">Your weight docket has been verified and is attached for your records. Please find the key details summarised below.</p>

    <div class="section-title">Weight Summary</div>
    <div class="weight-row">
      <div class="weight-box">
        <div class="label">Gross</div>
        <div class="value">${fmtNum(docket.gross_tonnes)}</div>
        <div class="unit">tonnes</div>
      </div>
      <div class="weight-box">
        <div class="label">Tare</div>
        <div class="value">${fmtNum(docket.tare_tonnes)}</div>
        <div class="unit">tonnes</div>
      </div>
      <div class="weight-box highlight">
        <div class="label">Net</div>
        <div class="value">${fmtNum(docket.net_tonnes)}</div>
        <div class="unit">tonnes</div>
      </div>
    </div>

    <hr class="divider">

    <div class="section-title">Load Details</div>
    <div class="grid">
      <div class="field"><label>From</label><span>${fmt(docket.from_location)}</span></div>
      <div class="field"><label>To</label><span>${fmt(docket.to_location)}</span></div>
      <div class="field"><label>Vehicle Rego</label><span>${fmt(docket.rego)}</span></div>
      <div class="field"><label>Driver</label><span>${fmt(docket.driver_name)}</span></div>
      <div class="field"><label>Order Date</label><span>${fmt(docket.order_date)}</span></div>
      <div class="field"><label>Payment Status</label><span>${fmt(docket.payment_status)}</span></div>
    </div>

    ${grades && grades !== '—' ? `
    <hr class="divider">
    <div class="section-title">Material Grade</div>
    <div>${(docket.material_grades?.length > 0 ? docket.material_grades : [{grade: grades}]).map(g => `<span class="grade-badge">${g.grade}${docket.material_grades?.length > 1 ? ` ${g.percentage||0}%` : ''}</span>`).join('')}</div>
    ` : ''}

    ${docket.comments || docket.contamination_notes ? `
    <hr class="divider">
    <div class="section-title">Notes</div>
    <p style="color:#7A8898;font-size:13px;line-height:1.6;">${[docket.contamination_notes, docket.comments].filter(Boolean).join(' ')}</p>
    ` : ''}

    <hr class="divider">
    <p style="font-size:12px;color:#AAB0C4;text-align:center;font-style:italic;">This is an automated notification from Metal X Renewables internal operations system.</p>
  </div>
  <div class="footer">
    <p>Metal X Renewables Pty Ltd · ABN 90 687 484 975 · PO Box Z5150, St Georges Terrace 6000</p>
    <p style="margin-top:4px;font-style:italic;">Shaping a Sustainable Future</p>
  </div>
</div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customerEmail,
        subject: `Metal X — Verified Weight Docket ${ticketNo}`,
        body: emailBody,
      });

      // Log the email event
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'email_sent',
        ticket_no: ticketNo,
        docket_id: event.entity_id,
        customer_name: customerName,
        customer_email: customerEmail,
        rego: docket.rego || null,
        net_tonnes: docket.net_tonnes ? parseFloat(docket.net_tonnes) : null,
        performed_by: 'System (Automation)',
        status: 'success',
        details: `Verified docket email sent to ${customerEmail} for ticket ${ticketNo}.`,
      });
    }

    return Response.json({ ok: true, emailSent: !!customerEmail });
  } catch (error) {
    // Try to log the failure
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AuditLog.create({
        event_type: 'automation_error',
        ticket_no: payload?.data?.ticket_no || null,
        performed_by: 'System',
        status: 'failed',
        details: `Error in onDocketVerified: ${error.message}`,
      });
    } catch (_) {}
    return Response.json({ error: error.message }, { status: 500 });
  }
});