from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class AccountCategory(str, enum.Enum):
    retirement = "retirement"
    non_retirement = "non_retirement"
    liability = "liability"
    trust = "trust"


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    spouse_name = Column(String, nullable=True)
    monthly_salary = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    accounts = relationship("Account", back_populates="client", cascade="all, delete-orphan")
    reports = relationship("QuarterlyReport", back_populates="client", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    account_name = Column(String, nullable=False)
    account_category = Column(Enum(AccountCategory), nullable=False)
    last_four = Column(String(4), nullable=True)
    is_joint = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="accounts")
    entries = relationship("ReportEntry", back_populates="account", cascade="all, delete-orphan")


class QuarterlyReport(Base):
    __tablename__ = "quarterly_reports"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="reports")
    entries = relationship("ReportEntry", back_populates="report", cascade="all, delete-orphan")


class ReportEntry(Base):
    __tablename__ = "report_entries"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("quarterly_reports.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    balance = Column(Float, nullable=False)

    report = relationship("QuarterlyReport", back_populates="entries")
    account = relationship("Account", back_populates="entries")
