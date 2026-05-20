from sqlalchemy.orm import Session
from fastapi import HTTPException

import models
import schemas


def create(db: Session, payload: schemas.AccountCreate):
    client = db.query(models.Client).filter(models.Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    account = models.Account(**payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account
