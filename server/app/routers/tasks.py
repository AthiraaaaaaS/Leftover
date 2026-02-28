"""Tasks API routes for volunteer pickup workflow."""
import random
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.models.donation import Donation
from app.models.task import Task
from app.schemas.task import TaskChecklistPatch


router = APIRouter(prefix="/tasks", tags=["tasks"])


def _task_to_response(t: Task) -> dict:
    """Convert Task model to frontend Task shape."""
    return {
        "id": t.id,
        "donationId": t.donation_id,
        "volunteerId": t.volunteer_id,
        "step": t.step,
        "checklist": {
            "sealed": t.checklist_sealed,
            "labelled": t.checklist_labelled,
            "noLeak": t.checklist_no_leak,
            "onTime": t.checklist_on_time,
            "note": t.checklist_note or "",
        },
        "updatedAt": t.updated_at.isoformat() if t.updated_at else datetime.utcnow().isoformat(),
    }


@router.get("", response_model=list)
async def list_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    volunteer_id: str = Query(..., description="Volunteer ID to list tasks for"),
):
    """List tasks for a volunteer."""
    result = await db.execute(
        select(Task)
        .where(Task.volunteer_id == volunteer_id)
        .order_by(Task.updated_at.desc())
    )
    tasks = list(result.scalars().all())
    return [_task_to_response(t) for t in tasks]


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a single task by ID."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    t = result.scalar_one_or_none()
    if not t:
        return None
    return _task_to_response(t)


@router.patch("/{task_id}/advance")
async def advance_task(
    task_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Advance task step: READY -> STARTED -> PICKED_UP -> DELIVERED."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    next_step = {
        "READY": "STARTED",
        "STARTED": "PICKED_UP",
        "PICKED_UP": "DELIVERED",
    }.get(task.step)
    if not next_step:
        raise HTTPException(400, "Task already completed")

    task.step = next_step
    task.updated_at = datetime.utcnow()

    donation_result = await db.execute(select(Donation).where(Donation.id == task.donation_id))
    donation = donation_result.scalar_one_or_none()
    if donation:
        donation.status = {
            "STARTED": "ASSIGNED",
            "PICKED_UP": "PICKED_UP",
            "DELIVERED": "DELIVERED",
        }.get(next_step, donation.status)

    await db.flush()
    return _task_to_response(task)


@router.patch("/{task_id}/checklist")
async def save_checklist(
    task_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    patch: TaskChecklistPatch,
):
    """Update task checklist fields."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    if patch.sealed is not None:
        task.checklist_sealed = patch.sealed
    if patch.labelled is not None:
        task.checklist_labelled = patch.labelled
    if patch.noLeak is not None:
        task.checklist_no_leak = patch.noLeak
    if patch.onTime is not None:
        task.checklist_on_time = patch.onTime
    if patch.note is not None:
        task.checklist_note = patch.note

    task.updated_at = datetime.utcnow()
    await db.flush()
    return _task_to_response(task)
