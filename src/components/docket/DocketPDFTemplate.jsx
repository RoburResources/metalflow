/**
 * DocketPDFTemplate
 * A self-contained, print-ready A4 layout rendered as HTML.
 * Captured by html2canvas → jsPDF.
 */

const LOGO_URL =
  "https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png";
const BLUE = "#1E4D99";
const DARK_BLUE = "#163D80";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const fmt = (v, fallback = "—") => v || fallback;
const fmtNum = (v, d = 2) => (v ? parseFloat(v).toFixed(d) : "—");

const Row = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      borderBottom: `1px solid ${BORDER}`,
      fontSize: 11,
    }}
  >
    <span style={{ color: MUTED, fontWeight: 500 }}>{label}</span>
    <span style={{ color: "#0D1A2E", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
  </div>
);

const SectionHead = ({ children }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: BLUE,
      marginBottom: 6,
      paddingBottom: 4,
      borderBottom: `2px solid ${BLUE}`,
    }}
  >
    {children}
  </div>
);

const SectionHeadLight = ({ children }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#93C5FD",
      marginBottom: 6,
      paddingBottom: 4,
      borderBottom: "1px solid rgba(255,255,255,0.2)",
    }}
  >
    {children}
  </div>
);

const AuditStamp = ({ docket }) => {
  const isVerified = docket.status === "Verified";
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        right: 32,
        width: 110,
        height: 110,
        border: `4px solid ${isVerified ? "#16A34A" : "#DC2626"}`,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.18,
        transform: "rotate(-20deg)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: isVerified ? "#16A34A" : "#DC2626",
          letterSpacing: 2,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {isVerified ? "VERIFIED" : docket.status?.toUpperCase() || "DRAFT"}
      </div>
      <div style={{ fontSize: 9, color: isVerified ? "#16A34A" : "#DC2626", marginTop: 4, letterSpacing: 1 }}>
        METAL X
      </div>
    </div>
  );
};

export default function DocketPDFTemplate({ docket = {} }) {
  const materialGrades =
    docket.material_grades?.length > 0
      ? docket.material_grades
          .map(
            (g) =>
              `${g.grade}${
                docket.material_grades.length > 1 ? ` (${g.percentage || 0}%)` : ""
              }${
                g.grade === "Rubbish / Contamination" && g.rubbish_value
                  ? ` – ${g.rubbish_value}${g.rubbish_unit === "kg" ? "kg" : "%"}`
                  : ""
              }`
          )
          .join(", ")
      : docket.material_grade || docket.product_description || "—";

  return (
    <div
      style={{
        width: 794,
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        fontSize: 11,
        color: "#0D1A2E",
        background: "#fff",
        position: "relative",
      }}
    >
      {/* ─── AUDIT STAMP WATERMARK ─── */}
      <AuditStamp docket={docket} />

      {/* ═══════════════════════════════════════
          SECTION 1 — WEIGHT DOCKET (WHITE)
      ═══════════════════════════════════════ */}
      <div style={{ background: "#fff", padding: "28px 36px 20px" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `2px solid ${BLUE}`,
          }}
        >
          <div>
            <img src={LOGO_URL} alt="Metal X" style={{ height: 50, objectFit: "contain", marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: MUTED }}>Renewables Pty Ltd · ABN 90 687 484 975</div>
            <div style={{ fontSize: 9, color: MUTED }}>PO Box Z5150, St Georges Terrace 6000, Perth WA</div>
            <div
              style={{
                marginTop: 6,
                display: "inline-block",
                border: `1.5px solid ${BLUE}`,
                borderRadius: 4,
                padding: "2px 10px",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: BLUE,
              }}
            >
              DIRECT MEASUREMENT TICKET
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: MUTED, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>
              Ticket Reference
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: BLUE }}>{fmt(docket.ticket_no, "MX-XXXXXXX")}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{fmt(docket.order_date)}</div>
            <div
              style={{
                marginTop: 6,
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 800,
                background:
                  docket.status === "Verified"
                    ? "#DCFCE7"
                    : docket.status === "Pending"
                    ? "#EFF4FF"
                    : "#F4F7FC",
                color:
                  docket.status === "Verified"
                    ? "#16A34A"
                    : docket.status === "Pending"
                    ? BLUE
                    : MUTED,
                border: `1px solid ${
                  docket.status === "Verified"
                    ? "#86EFAC"
                    : docket.status === "Pending"
                    ? "#BFDBFE"
                    : BORDER
                }`,
              }}
            >
              {docket.status || "Draft"}
            </div>
          </div>
        </div>

        {/* Bill To / Issued By */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            {
              label: "Issued By",
              lines: [
                "Metal X Renewables Pty Ltd",
                "PO Box Z5150, St Georges Terrace 6000",
                "Perth, Western Australia",
              ],
            },
            {
              label: "Bill To",
              lines: [
                fmt(docket.bill_to_name),
                fmt(docket.bill_to_address),
                `Payment: ${fmt(docket.payment_status)}`,
              ],
            },
          ].map(({ label, lines }) => (
            <div
              key={label}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: "10px 14px",
                background: "#FAFBFD",
              }}
            >
              <SectionHead>{label}</SectionHead>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{lines[0]}</div>
              {lines.slice(1).map((l, i) => (
                <div key={i} style={{ color: MUTED, fontSize: 10 }}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Movement + Weights */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginBottom: 16 }}>
          {/* Movement */}
          <div
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", background: "#FAFBFD" }}
          >
            <SectionHead>Movement Details</SectionHead>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {[
                ["From Location", docket.from_location],
                ["To Location", docket.to_location],
                ["From Company", docket.from_company],
                ["To Company", docket.to_company],
                ["Goods / Ref", docket.goods_weighed],
                ["Vehicle Rego", docket.rego],
                ["Driver", docket.driver_name],
                ["Weigh Person", docket.weigh_person_name],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{ padding: "4px 8px 4px 0", borderBottom: `1px solid ${BORDER}` }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: MUTED,
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#0D1A2E" }}>{fmt(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weights */}
          <div
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", background: "#FAFBFD" }}
          >
            <SectionHead>Weight Readings</SectionHead>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["", "Tonnes", "Date / Time"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "3px 6px",
                        textAlign: i === 1 ? "center" : "left",
                        fontSize: 8,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: MUTED,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Gross", docket.gross_tonnes, docket.gross_datetime],
                  ["Tare", docket.tare_tonnes, docket.tare_datetime],
                  ["Net", docket.net_tonnes, docket.net_datetime],
                ].map(([label, t, dt]) => (
                  <tr
                    key={label}
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      background: label === "Net" ? "#EFF6FF" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "5px 6px",
                        fontWeight: label === "Net" ? 900 : 500,
                        color: label === "Net" ? BLUE : "#0D1A2E",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: "5px 6px",
                        textAlign: "center",
                        fontWeight: 900,
                        color: label === "Net" ? BLUE : "#0D1A2E",
                        fontSize: label === "Net" ? 13 : 10,
                      }}
                    >
                      {t ? fmtNum(t) : ""}
                    </td>
                    <td style={{ padding: "5px 6px", color: MUTED, fontSize: 9 }}>{dt || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Material Grade */}
            <div style={{ marginTop: 12 }}>
              <SectionHead>Material Grade</SectionHead>
              <div style={{ fontSize: 11, fontWeight: 700, color: BLUE }}>{materialGrades}</div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div
          style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", background: "#FAFBFD", marginBottom: 16 }}
        >
          <SectionHead>Billing</SectionHead>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Description", "Qty", "UOM", "Unit Price", "Ext Price"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "3px 8px",
                      textAlign: i >= 3 ? "right" : i === 1 ? "center" : "left",
                      fontSize: 8,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: MUTED,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "5px 8px" }}>{fmt(docket.line_description, "Internal Weight Record")}</td>
                <td style={{ padding: "5px 8px", textAlign: "center" }}>{fmtNum(docket.qty, 0)}</td>
                <td style={{ padding: "5px 8px" }}>{fmt(docket.uom, "Each")}</td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>${fmtNum(docket.unit_price)}</td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>${fmtNum(docket.ext_price)}</td>
              </tr>
            </tbody>
          </table>
          <div
            style={{
              marginTop: 6,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 4,
              padding: "6px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 11, color: BLUE }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 14, color: BLUE }}>${fmtNum(docket.total_price)}</span>
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", background: "#FAFBFD", marginBottom: 16 }}
        >
          <SectionHead>Signatures & Authorisation</SectionHead>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              ["Driver", docket.driver_name, docket.driver_signature],
              ["Weigh Person", docket.weigh_person_name, docket.weigh_person_signature],
            ].map(([role, name, sig]) => (
              <div key={role}>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: MUTED,
                    marginBottom: 4,
                  }}
                >
                  {role}:{" "}
                  <strong style={{ color: "#0D1A2E", fontSize: 10 }}>{name || "—"}</strong>
                </div>
                <div
                  style={{
                    height: 48,
                    borderBottom: "1.5px solid #0D1A2E",
                    overflow: "hidden",
                    background: sig ? "transparent" : "#FAFBFD",
                  }}
                >
                  {sig && (
                    <img
                      src={sig}
                      alt={`${role} signature`}
                      style={{ height: 46, objectFit: "contain", objectPosition: "left center" }}
                    />
                  )}
                </div>
                <div style={{ fontSize: 8, color: MUTED, marginTop: 3 }}>Signed electronically</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {(docket.contamination_notes || docket.comments) && (
          <div
            style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", background: "#FFFBEB", borderColor: "#FDE68A", marginBottom: 16 }}
          >
            <SectionHead>Notes & Contamination</SectionHead>
            {docket.contamination_notes && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>CONTAMINATION</div>
                <div style={{ fontSize: 10, color: "#92400E" }}>{docket.contamination_notes}</div>
              </div>
            )}
            {docket.comments && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, marginBottom: 2 }}>COMMENTS</div>
                <div style={{ fontSize: 10 }}>{docket.comments}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── CUT LINE ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 36px",
          background: "#f8fafc",
          color: MUTED,
          fontSize: 8,
          letterSpacing: "1.5px",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        <div style={{ flex: 1, borderTop: "1.5px dashed #cbd5e1" }} />
        CUT LINE — MATERIAL GRADING DOCKET
        <div style={{ flex: 1, borderTop: "1.5px dashed #cbd5e1" }} />
      </div>

      {/* ═══════════════════════════════════════
          SECTION 2 — GRADING DOCKET (BLUE)
      ═══════════════════════════════════════ */}
      <div style={{ background: BLUE, padding: "20px 36px 24px" }}>

        {/* Grading Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div>
            <img
              src={LOGO_URL}
              alt="Metal X"
              style={{ height: 40, objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 4 }}
            />
            <div style={{ fontSize: 9, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "1px" }}>
              Material Grading Docket
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#93C5FD", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>
              Docket No.
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
              {fmt(docket.docket_no, docket.ticket_no)}
            </div>
            <div style={{ fontSize: 9, color: "#93C5FD", marginTop: 2 }}>{fmt(docket.docket_date, docket.order_date)}</div>
          </div>
        </div>

        {/* Customer + Collection + Payment */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <SectionHeadLight>Customer</SectionHeadLight>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{fmt(docket.customer_name)}</div>
            <div style={{ color: "#93C5FD", fontSize: 10, marginTop: 2 }}>{fmt(docket.site_address)}</div>
            {docket.customer_email && (
              <div style={{ color: "#5BA3F5", fontSize: 9, marginTop: 2 }}>{docket.customer_email}</div>
            )}
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <SectionHeadLight>Collection Mode</SectionHeadLight>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
              {[
                { label: "Pickup", checked: !!docket.pickup },
                { label: "Swap", checked: !!docket.swap },
                { label: "Deliver", checked: docket.deliver !== false },
              ].map(({ label, checked }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      border: `2px solid ${checked ? "#93C5FD" : "rgba(255,255,255,0.3)"}`,
                      borderRadius: 3,
                      background: checked ? "#3B82F6" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: "#fff",
                      fontWeight: 900,
                    }}
                  >
                    {checked ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 10, color: checked ? "#DBEAFE" : "#93C5FD", fontWeight: checked ? 700 : 400 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <SectionHeadLight>Payment</SectionHeadLight>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <span style={{ fontSize: 10, color: "#93C5FD" }}>Cash</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{fmt(docket.cash_payment)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 10, color: "#93C5FD" }}>Amount</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                {docket.amount ? `$${fmtNum(docket.amount)}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Material Grade full row */}
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: 6,
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.15)",
            marginBottom: 12,
          }}
        >
          <SectionHeadLight>Material Grade / Product Description</SectionHeadLight>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{materialGrades}</div>
        </div>

        {/* Driver sig + contamination */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <SectionHeadLight>Contamination / Comments</SectionHeadLight>
            <div style={{ fontSize: 10, color: "#DBEAFE", minHeight: 32 }}>
              {[docket.contamination_notes, docket.comments].filter(Boolean).join(" ") || "—"}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <SectionHeadLight>Driver Signature</SectionHeadLight>
            <div style={{ fontWeight: 700, fontSize: 10, color: "#fff", marginBottom: 4 }}>
              {fmt(docket.driver_name)}
            </div>
            <div
              style={{
                height: 42,
                borderBottom: "1px solid rgba(255,255,255,0.4)",
                overflow: "hidden",
              }}
            >
              {docket.driver_signature && (
                <img
                  src={docket.driver_signature}
                  alt="Driver signature"
                  style={{ height: 40, objectFit: "contain", objectPosition: "left center" }}
                />
              )}
            </div>
            <div style={{ fontSize: 8, color: "#93C5FD", marginTop: 3 }}>Signed electronically</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 8,
            color: "#93C5FD",
          }}
        >
          <span style={{ fontStyle: "italic" }}>Shaping a Sustainable Future</span>
          <span>Metal X Renewables · ABN 90 687 484 975 · {fmt(docket.ticket_no)}</span>
          <span>Generated: {new Date().toLocaleDateString("en-AU")}</span>
        </div>
      </div>
    </div>
  );
}