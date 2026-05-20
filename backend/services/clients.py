from sqlalchemy.orm import Session
from fastapi import HTTPException

import models
import schemas


def get_all(db: Session):
    return db.query(models.Client).all()


def create(db: Session, payload: schemas.ClientCreate):
    client = models.Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_by_id(db: Session, client_id: int) -> models.Client:
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


def get_accounts(db: Session, client_id: int):
    get_by_id(db, client_id)
    return db.query(models.Account).filter(models.Account.client_id == client_id).all()
