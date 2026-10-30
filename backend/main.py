from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import TaskDB
from schemas import TaskCreate, TaskResponse

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "Todo API is running"}


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(TaskDB).order_by(TaskDB.id.asc()).all()


@app.get("/not_completed", response_model=list[TaskResponse])
def get_task(db: Session = Depends(get_db)):
    return db.query(TaskDB).filter(TaskDB.completed.is_(False)).order_by(TaskDB.id.asc()).all()


@app.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):

    title = task.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Task title cannot be empty")

    new_task = TaskDB(title=title, completed=False)

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    completed: bool,
    db: Session = Depends(get_db)
):
    task = db.get(TaskDB, task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = completed
    db.commit()
    db.refresh(task)

    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(TaskDB, task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}