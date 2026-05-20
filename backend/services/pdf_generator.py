import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

PAGE_W, PAGE_H = letter
MARGIN = 0.6 * inch
USABLE_W = PAGE_W - 2 * MARGIN
TOP_MARGIN = 1.05 * inch

# Brand palette
NAVY       = colors.HexColor("#1B3A6B")
BLUE_MID   = colors.HexColor("#2563EB")
BLUE_LIGHT = colors.HexColor("#DBEAFE")
BLUE_PALE  = colors.HexColor("#EFF6FF")
TEXT_DARK  = colors.HexColor("#1E293B")
TEXT_MUTED = colors.HexColor("#64748B")
GREEN      = colors.HexColor("#15803D")
GREEN_BG   = colors.HexColor("#DCFCE7")
RED        = colors.HexColor("#B91C1C")
RED_BG     = colors.HexColor("#FEE2E2")
BORDER     = colors.HexColor("#CBD5E1")
ROW_ALT    = colors.HexColor("#F8FAFC")
WHITE      = colors.white


def _fmt(v: float) -> str:
    return f"${v:,.2f}"


def _fmt_signed(v: float) -> str:
    return f"+${v:,.2f}" if v >= 0 else f"-${abs(v):,.2f}"


def _S():
    def P(name, **kw):
        return ParagraphStyle(name, **kw)
    return {
        "title":       P("title",       fontName="Helvetica-Bold", fontSize=20, textColor=NAVY, leading=26),
        "subtitle":    P("subtitle",    fontName="Helvetica",      fontSize=10, textColor=TEXT_MUTED, spaceAfter=4),
        "section":     P("section",     fontName="Helvetica-Bold", fontSize=12, textColor=NAVY,
                          spaceBefore=14, spaceAfter=4),
        "note":        P("note",        fontName="Helvetica-Oblique", fontSize=8, textColor=TEXT_MUTED, spaceBefore=4),
        "card_label":  P("card_label",  fontName="Helvetica",      fontSize=8,  textColor=TEXT_MUTED,
                          alignment=TA_CENTER, leading=11),
        "card_value":  P("card_value",  fontName="Helvetica-Bold", fontSize=15, textColor=NAVY,
                          alignment=TA_CENTER, leading=20),
        "card_green":  P("card_green",  fontName="Helvetica-Bold", fontSize=15, textColor=GREEN,
                          alignment=TA_CENTER, leading=20),
        "card_red":    P("card_red",    fontName="Helvetica-Bold", fontSize=15, textColor=RED,
                          alignment=TA_CENTER, leading=20),
    }


def _draw_page(canvas, doc, report_title: str, client_display: str, date_str: str):
    canvas.saveState()

    # Header bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 0.85 * inch, PAGE_W, 0.85 * inch, fill=1, stroke=0)

    # Left accent stripe
    canvas.setFillColor(BLUE_MID)
    canvas.rect(0, PAGE_H - 0.85 * inch, 5, 0.85 * inch, fill=1, stroke=0)

    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 13)
    canvas.drawString(0.65 * inch, PAGE_H - 0.52 * inch, report_title)

    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.36 * inch, client_display)
    canvas.setFillColor(BLUE_LIGHT)
    canvas.setFont("Helvetica", 8.5)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.57 * inch, date_str)

    # Footer rule
    canvas.setStrokeColor(BLUE_LIGHT)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 0.56 * inch, PAGE_W - MARGIN, 0.56 * inch)

    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 0.36 * inch, "Confidential — For Client Use Only  |  Prepared by AW Financial")
    canvas.drawRightString(PAGE_W - MARGIN, 0.36 * inch, f"Page {doc.page}")

    canvas.restoreState()


def _cards(S, items: list) -> Table:
    """Row of summary stat cards. items: [(label, value_str, style_key), ...]"""
    n = len(items)
    col_w = USABLE_W / n
    cells = []
    for label, value, sk in items:
        cell = Table(
            [[Paragraph(label, S["card_label"])], [Paragraph(value, S[sk])]],
            colWidths=[col_w - 0.24 * inch],
        )
        cell.setStyle(TableStyle([
            ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        cells.append(cell)

    t = Table([cells], colWidths=[col_w] * n)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BLUE_PALE),
        ("BOX",           (0, 0), (-1, -1), 1,   BLUE_LIGHT),
        ("LINEAFTER",     (0, 0), (-2,  0), 0.5, BLUE_LIGHT),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def _section_header(S, text: str) -> list:
    return [
        Paragraph(text, S["section"]),
        HRFlowable(width=USABLE_W, thickness=1, color=BLUE_LIGHT, spaceAfter=6),
    ]


def _accounts_table(entries: list) -> tuple:
    """Returns (Table | None, total). Table has account name, number, joint, balance."""
    if not entries:
        return None, 0.0

    col_w = [USABLE_W * 0.42, USABLE_W * 0.20, USABLE_W * 0.12, USABLE_W * 0.26]
    rows = [["Account Name", "Account #", "Joint?", "Balance"]]
    total = 0.0

    for entry in entries:
        acc = entry.account
        num = f"••••{acc.last_four}" if acc.last_four else "—"
        joint = "Yes" if acc.is_joint else "No"
        rows.append([acc.account_name, num, joint, _fmt(entry.balance)])
        total += entry.balance

    rows.append(["", "", "Subtotal", _fmt(total)])

    style = TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("ALIGN",         (0,  0), (-1, -1), "CENTER"),
        ("ALIGN",         (0,  1), ( 0, -2), "LEFT"),
        ("FONTNAME",      (0,  1), (-1, -2), "Helvetica"),
        ("TEXTCOLOR",     (0,  1), (-1, -2), TEXT_DARK),
        ("BACKGROUND",    (0, -1), (-1, -1), BLUE_PALE),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, -1), (-1, -1), NAVY),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("LINEABOVE",     (0, -1), (-1, -1), 0.5, BLUE_LIGHT),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -1), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -1), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 8),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, ROW_ALT]),
    ])

    t = Table(rows, colWidths=col_w)
    t.setStyle(style)
    return t, total



# ─── SACS ────────────────────────────────────────────────────────────────────

def _generate_sacs(report, client) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    date_str = report.created_at.strftime("%B %d, %Y")
    client_display = client.client_name
    if client.spouse_name:
        client_display += f" & {client.spouse_name}"

    def on_page(canvas, doc):
        _draw_page(canvas, doc, "SACS — Strategic Asset Cashflow Summary", client_display, date_str)

    doc = SimpleDocTemplate(
        tmp.name, pagesize=letter,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=0.8 * inch,
    )
    S = _S()

    monthly_income   = client.monthly_salary
    monthly_expenses = client.monthly_expenses
    excess           = monthly_income - monthly_expenses
    excess_sk        = "card_green" if excess >= 0 else "card_red"

    non_ret_entries  = [e for e in report.entries if e.account.account_category.value == "non_retirement"]
    _, private_reserve = _accounts_table(non_ret_entries)
    months_covered = (private_reserve / monthly_expenses) if monthly_expenses > 0 else 0.0

    story = []

    # ── Title ──
    story.append(Paragraph("Strategic Asset Cashflow Summary", S["title"]))
    story.append(Paragraph(f"Prepared for {client_display}  ·  {date_str}", S["subtitle"]))
    story.append(Spacer(1, 0.2 * inch))

    # ── Summary cards ──
    story.append(_cards(S, [
        ("Monthly Income",   _fmt(monthly_income),        "card_value"),
        ("Monthly Expenses", _fmt(monthly_expenses),      "card_value"),
        ("Monthly Excess",   _fmt_signed(excess),         excess_sk),
        ("Private Reserve",  _fmt(private_reserve),       "card_value"),
    ]))
    story.append(Spacer(1, 0.25 * inch))

    # ── Inflow ──
    story += _section_header(S, "Inflow")
    col_w3 = [USABLE_W * 0.50, USABLE_W * 0.25, USABLE_W * 0.25]
    inflow_rows = [
        ["Source",              "Monthly",              "Annual"],
        ["Employment / Salary", _fmt(monthly_income),   _fmt(monthly_income * 12)],
        ["Total Inflow",        _fmt(monthly_income),   _fmt(monthly_income * 12)],
    ]
    in_t = Table(inflow_rows, colWidths=col_w3)
    in_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("BACKGROUND",    (0, -1), (-1, -1), GREEN_BG),
        ("TEXTCOLOR",     (0, -1), (-1, -1), GREEN),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTNAME",      (0,  1), (-1, -2), "Helvetica"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("ALIGN",         (0,  0), (-1, -1), "CENTER"),
        ("ALIGN",         (0,  1), ( 0, -2), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, ROW_ALT]),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -1), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -1), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 8),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 8),
    ]))
    story.append(in_t)
    story.append(Spacer(1, 0.18 * inch))

    # ── Outflow ──
    story += _section_header(S, "Outflow")
    outflow_rows = [
        ["Category",         "Monthly",                  "Annual"],
        ["Living Expenses",  _fmt(monthly_expenses),     _fmt(monthly_expenses * 12)],
        ["Total Outflow",    _fmt(monthly_expenses),     _fmt(monthly_expenses * 12)],
    ]
    out_t = Table(outflow_rows, colWidths=col_w3)
    out_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("BACKGROUND",    (0, -1), (-1, -1), RED_BG),
        ("TEXTCOLOR",     (0, -1), (-1, -1), RED),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTNAME",      (0,  1), (-1, -2), "Helvetica"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("ALIGN",         (0,  0), (-1, -1), "CENTER"),
        ("ALIGN",         (0,  1), ( 0, -2), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, ROW_ALT]),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -1), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -1), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 8),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 8),
    ]))
    story.append(out_t)
    story.append(Spacer(1, 0.18 * inch))

    # ── Excess Cashflow ──
    story += _section_header(S, "Excess Cashflow")
    status = "Surplus" if excess >= 0 else "Deficit"
    excess_color = GREEN if excess >= 0 else RED
    excess_bg    = GREEN_BG if excess >= 0 else RED_BG
    cf_rows = [
        ["",                         "Monthly",                       "Annual"],
        ["Total Inflow",             _fmt(monthly_income),            _fmt(monthly_income * 12)],
        ["Total Outflow",            f"({_fmt(monthly_expenses)})",   f"({_fmt(monthly_expenses * 12)})"],
        [f"Net Cashflow — {status}", _fmt_signed(excess),             _fmt_signed(excess * 12)],
    ]
    cf_t = Table(cf_rows, colWidths=col_w3)
    cf_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("BACKGROUND",    (0, -1), (-1, -1), excess_bg),
        ("TEXTCOLOR",     (0, -1), (-1, -1), excess_color),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTNAME",      (0,  1), (-1, -2), "Helvetica"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("ALIGN",         (0,  0), (-1, -1), "CENTER"),
        ("ALIGN",         (0,  1), ( 0, -2), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, ROW_ALT]),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -1), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -1), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 8),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 8),
    ]))
    story.append(cf_t)
    story.append(Spacer(1, 0.18 * inch))

    # ── Private Reserve ──
    story += _section_header(S, "Private Reserve")
    if non_ret_entries:
        t, _ = _accounts_table(non_ret_entries)
        story.append(KeepTogether(t))
    else:
        story.append(Paragraph("No non-retirement accounts on file.", S["note"]))
    story.append(Spacer(1, 0.12 * inch))

    reserve_sk = "card_value" if months_covered >= 6 else "card_red"
    story.append(_cards(S, [
        ("Total Private Reserve",     _fmt(private_reserve),              "card_value"),
        ("Monthly Expenses Coverage", f"{months_covered:.1f} months",     reserve_sk),
        ("Annual Expenses Coverage",  f"{months_covered / 12:.1f} years", reserve_sk),
    ]))
    story.append(Spacer(1, 0.18 * inch))

    # ── Monthly Summary ──
    story += _section_header(S, "Monthly Summary")
    summary_rows = [
        ["Item",                       "Monthly",                         "Annual"],
        ["Gross Income",               _fmt(monthly_income),              _fmt(monthly_income * 12)],
        ["Total Expenses",             f"({_fmt(monthly_expenses)})",     f"({_fmt(monthly_expenses * 12)})"],
        ["Excess Cashflow",            _fmt_signed(excess),               _fmt_signed(excess * 12)],
        ["Private Reserve (Total)",    _fmt(private_reserve),             "—"],
        ["Reserve Coverage",           f"{months_covered:.1f} months",   "—"],
    ]
    sum_t = Table(summary_rows, colWidths=col_w3)
    sum_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("FONTNAME",      (0,  1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("ALIGN",         (0,  0), (-1, -1), "CENTER"),
        ("ALIGN",         (0,  1), ( 0, -1), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, ROW_ALT]),
        # Excess row highlight
        ("FONTNAME",      (0,  3), (-1,  3), "Helvetica-Bold"),
        ("TEXTCOLOR",     (1,  3), (-1,  3), excess_color),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -1), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -1), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 8),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 8),
    ]))
    story.append(sum_t)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return tmp.name


# ─── TCC ─────────────────────────────────────────────────────────────────────

def _generate_tcc(report, client) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    date_str = report.created_at.strftime("%B %d, %Y")
    client_display = client.client_name
    if client.spouse_name:
        client_display += f" & {client.spouse_name}"

    def on_page(canvas, doc):
        _draw_page(canvas, doc, "TCC — Total Client Capital", client_display, date_str)

    doc = SimpleDocTemplate(
        tmp.name, pagesize=letter,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=0.8 * inch,
    )
    S = _S()

    by_cat = {"retirement": [], "non_retirement": [], "trust": [], "liability": []}
    for e in report.entries:
        by_cat[e.account.account_category.value].append(e)

    ret_total     = sum(e.balance for e in by_cat["retirement"])
    non_ret_total = sum(e.balance for e in by_cat["non_retirement"])
    trust_total   = sum(e.balance for e in by_cat["trust"])
    liab_total    = sum(e.balance for e in by_cat["liability"])
    gross_assets  = ret_total + non_ret_total + trust_total
    net_worth     = gross_assets - liab_total

    story = []

    # ── Title ──
    story.append(Paragraph("Total Client Capital", S["title"]))
    story.append(Paragraph(f"Prepared for {client_display}  ·  {date_str}", S["subtitle"]))
    story.append(Spacer(1, 0.2 * inch))

    # ── Summary cards ──
    story.append(_cards(S, [
        ("Retirement Assets",     _fmt(ret_total),     "card_value"),
        ("Non-Retirement Assets", _fmt(non_ret_total), "card_value"),
        ("Trust Assets",          _fmt(trust_total),   "card_value"),
        ("Total Liabilities",     _fmt(liab_total),    "card_red"),
    ]))
    story.append(Spacer(1, 0.25 * inch))

    # ── Retirement Accounts ──
    story += _section_header(S, "Retirement Accounts")
    if by_cat["retirement"]:
        t, _ = _accounts_table(by_cat["retirement"])
        story.append(KeepTogether(t))
    else:
        story.append(Paragraph("No retirement accounts on file.", S["note"]))
    story.append(Spacer(1, 0.18 * inch))

    # ── Non-Retirement Accounts ──
    story += _section_header(S, "Non-Retirement Accounts")
    if by_cat["non_retirement"]:
        t, _ = _accounts_table(by_cat["non_retirement"])
        story.append(KeepTogether(t))
    else:
        story.append(Paragraph("No non-retirement accounts on file.", S["note"]))
    story.append(Spacer(1, 0.18 * inch))

    # ── Trust ──
    story += _section_header(S, "Trust")
    if by_cat["trust"]:
        t, _ = _accounts_table(by_cat["trust"])
        story.append(KeepTogether(t))
    else:
        story.append(Paragraph("No trust accounts on file.", S["note"]))
    story.append(Spacer(1, 0.18 * inch))

    # ── Liabilities ──
    story += _section_header(S, "Liabilities")
    if by_cat["liability"]:
        t, _ = _accounts_table(by_cat["liability"])
        story.append(KeepTogether(t))
    else:
        story.append(Paragraph("No liabilities on file.", S["note"]))
    story.append(Spacer(1, 0.18 * inch))

    # ── Grand Total ──
    story += _section_header(S, "Grand Total — Net Worth")
    nw_rows = [
        ["Category",                    "Value"],
        ["Total Retirement Assets",     _fmt(ret_total)],
        ["Total Non-Retirement Assets", _fmt(non_ret_total)],
        ["Total Trust Assets",          _fmt(trust_total)],
        ["Gross Assets",                _fmt(gross_assets)],
        ["Total Liabilities",           f"({_fmt(liab_total)})"],
        ["Net Worth",                   _fmt(net_worth)],
    ]
    col_w = [USABLE_W * 0.58, USABLE_W * 0.42]
    gt_t = Table(nw_rows, colWidths=col_w)
    gt_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,  0), (-1,  0), NAVY),
        ("TEXTCOLOR",     (0,  0), (-1,  0), WHITE),
        ("FONTNAME",      (0,  0), (-1,  0), "Helvetica-Bold"),
        ("FONTNAME",      (0,  1), (-1, -2), "Helvetica"),
        ("FONTSIZE",      (0,  0), (-1, -1), 9),
        ("TEXTCOLOR",     (0,  1), (-1, -2), TEXT_DARK),
        ("ALIGN",         (0,  0), ( 0, -1), "LEFT"),
        ("ALIGN",         (1,  0), ( 1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, ROW_ALT]),
        # Gross assets row
        ("BACKGROUND",    (0,  4), (-1,  4), BLUE_PALE),
        ("FONTNAME",      (0,  4), (-1,  4), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,  4), (-1,  4), NAVY),
        ("LINEABOVE",     (0,  4), (-1,  4), 0.5, BLUE_LIGHT),
        # Net worth row
        ("BACKGROUND",    (0, -1), (-1, -1), NAVY),
        ("TEXTCOLOR",     (0, -1), (-1, -1), WHITE),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, -1), (-1, -1), 11),
        ("TOPPADDING",    (0, -1), (-1, -1), 10),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("LINEBELOW",     (0,  0), (-1,  0), 1.5, NAVY),
        ("GRID",          (0,  0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0,  0), (-1, -2), 7),
        ("BOTTOMPADDING", (0,  0), (-1, -2), 7),
        ("LEFTPADDING",   (0,  0), (-1, -1), 10),
        ("RIGHTPADDING",  (0,  0), (-1, -1), 10),
    ]))
    story.append(KeepTogether(gt_t))

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return tmp.name


# ─── Public API ──────────────────────────────────────────────────────────────

def generate_report_pdf(report, report_type: str = "tcc") -> str:
    client = report.client
    if report_type == "sacs":
        return _generate_sacs(report, client)
    return _generate_tcc(report, client)
