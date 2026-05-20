from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import AccountCategory


# ── Account ───────────────────────────────────────────────────────────────────

class AccountBase(BaseModel):
    account_name: str
    account_category: AccountCategory
    last_four: Optional[str] = None
    is_joint: bool = False


class AccountCreate(AccountBase):
    client_id: int


class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    account_category: Optional[AccountCategory] = None
    last_four: Optional[str] = None
    is_joint: Optional[bool] = None


class AccountOut(AccountBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Client ────────────────────────────────────────────────────────────────────

class ClientBase(BaseModel):
    client_name: str
    spouse_name: Optional[str] = None
    monthly_salary: float = 0.0
    monthly_expenses: float = 0.0


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    client_name: Optional[str] = None
    spouse_name: Optional[str] = None
    monthly_salary: Optional[float] = None
    monthly_expenses: Optional[float] = None


class ClientOut(ClientBase):
    id: int
    created_at: datetime
    accounts: List[AccountOut] = []

    class Config:
        from_attributes = True


# ── ReportEntry ───────────────────────────────────────────────────────────────

class ReportEntryCreate(BaseModel):
    account_id: int
    balance: float


class ReportEntryOut(BaseModel):
    id: int
    report_id: int
    account_id: int
    balance: float
    account: AccountOut

    class Config:
        from_attributes = True


# ── QuarterlyReport ───────────────────────────────────────────────────────────

class QuarterlyReportCreate(BaseModel):
    client_id: int
    entries: List[ReportEntryCreate] = []


class BulkEntriesCreate(BaseModel):
    entries: List[ReportEntryCreate]


class ReportCalculations(BaseModel):
    excess_cashflow: float
    retirement_total: float
    non_retirement_total: float
    trust_total: float
    liabilities_total: float
    grand_total_net_worth: float


class QuarterlyReportOut(BaseModel):
    id: int
    client_id: int
    created_at: datetime
    entries: List[ReportEntryOut] = []

    class Config:
        from_attributes = True


class QuarterlyReportWithCalcs(QuarterlyReportOut):
    calculations: ReportCalculations
