from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import schemas
from services import clients as client_service, accounts as account_service

router = APIRouter()


@router.post("/", response_model=schemas.ClientOut, status_code=201)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db)):
    return client_service.create(db, payload)


@router.get("/", response_model=List[schemas.ClientOut])
def list_clients(db: Session = Depends(get_db)):
    return client_service.get_all(db)


@router.get("/{client_id}", response_model=schemas.ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db)):
    return client_service.get_by_id(db, client_id)


@router.get("/{client_id}/accounts", response_model=List[schemas.AccountOut])
def list_client_accounts(client_id: int, db: Session = Depends(get_db)):
    return client_service.get_accounts(db, client_id)


@router.patch("/{client_id}", response_model=schemas.ClientOut)
def update_client(client_id: int, payload: schemas.ClientUpdate, db: Session = Depends(get_db)):
    client = client_service.get_by_id(db, client_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = client_service.get_by_id(db, client_id)
    db.delete(client)
    db.commit()
