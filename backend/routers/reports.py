from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models, schemas
from services.pdf_generator import generate_report_pdf

router = APIRouter()


def _compute_calculations(report: models.QuarterlyReport, client: models.Client) -> schemas.ReportCalculations:
    totals = {cat: 0.0 for cat in models.AccountCategory}
    for entry in report.entries:
        totals[entry.account.account_category] += entry.balance

    retirement = totals[models.AccountCategory.retirement]
    non_retirement = totals[models.AccountCategory.non_retirement]
    trust = totals[models.AccountCategory.trust]
    liabilities = totals[models.AccountCategory.liability]

    return schemas.ReportCalculations(
        excess_cashflow=client.monthly_salary - client.monthly_expenses,
        retirement_total=retirement,
        non_retirement_total=non_retirement,
        trust_total=trust,
        liabilities_total=liabilities,
        grand_total_net_worth=retirement + non_retirement + trust,
    )


def _report_with_calcs(report: models.QuarterlyReport, db: Session) -> schemas.QuarterlyReportWithCalcs:
    client = db.query(models.Client).filter(models.Client.id == report.client_id).first()
    data = schemas.QuarterlyReportOut.model_validate(report).model_dump()
    data["calculations"] = _compute_calculations(report, client)
    return schemas.QuarterlyReportWithCalcs(**data)


@router.get("/", response_model=List[schemas.QuarterlyReportOut])
def list_reports(client_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.QuarterlyReport)
    if client_id:
        query = query.filter(models.QuarterlyReport.client_id == client_id)
    return query.all()


@router.post("/", response_model=schemas.QuarterlyReportWithCalcs, status_code=201)
def create_report(payload: schemas.QuarterlyReportCreate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    report = models.QuarterlyReport(client_id=payload.client_id)
    db.add(report)
    db.flush()

    for entry_data in payload.entries:
        account = db.query(models.Account).filter(
            models.Account.id == entry_data.account_id,
            models.Account.client_id == payload.client_id,
        ).first()
        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Account {entry_data.account_id} not found for this client",
            )
        db.add(models.ReportEntry(
            report_id=report.id,
            account_id=entry_data.account_id,
            balance=entry_data.balance,
        ))

    db.commit()
    db.refresh(report)
    return _report_with_calcs(report, db)


@router.post("/{report_id}/entries", response_model=schemas.QuarterlyReportWithCalcs, status_code=201)
def add_entries(report_id: int, payload: schemas.BulkEntriesCreate, db: Session = Depends(get_db)):
    report = db.query(models.QuarterlyReport).filter(models.QuarterlyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    for entry_data in payload.entries:
        account = db.query(models.Account).filter(
            models.Account.id == entry_data.account_id,
            models.Account.client_id == report.client_id,
        ).first()
        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Account {entry_data.account_id} not found for this client",
            )
        db.add(models.ReportEntry(
            report_id=report.id,
            account_id=entry_data.account_id,
            balance=entry_data.balance,
        ))

    db.commit()
    db.refresh(report)
    return _report_with_calcs(report, db)


@router.get("/{report_id}", response_model=schemas.QuarterlyReportWithCalcs)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.QuarterlyReport).filter(models.QuarterlyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _report_with_calcs(report, db)


@router.delete("/{report_id}", status_code=204)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.QuarterlyReport).filter(models.QuarterlyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    type: str = Query("tcc", pattern="^(sacs|tcc)$"),
    db: Session = Depends(get_db),
):
    report = db.query(models.QuarterlyReport).filter(models.QuarterlyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    pdf_path = generate_report_pdf(report, report_type=type)
    filename = f"report_{report_id}_{type}.pdf"
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)
