import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import clients, accounts, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AW Client Portal API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])


@app.get("/")
def root():
    return {"status": "ok", "message": "AW Client Portal API"}
