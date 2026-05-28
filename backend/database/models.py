# Database models — like blueprints for our tables
# SQLAlchemy = Python library to talk to database without writing SQL

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Create SQLite database file
# This creates a file called legacybridge.db in backend folder
DATABASE_URL = "sqlite:///./legacybridge.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User table — stores all registered users
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # One user can have many translations
    translations = relationship("Translation", back_populates="user")

# Translation table — stores all translations
class Translation(Base):
    __tablename__ = "translations"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    program_name = Column(String, nullable=False)
    understanding = Column(Text, nullable=False)
    generated_code = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Link to user
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="translations")

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()