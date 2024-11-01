from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

class RoleEnum(Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN="admin"

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    address = db.Column(db.String(80), nullable=True)
    photo = db.Column(db.String(200), nullable=True)
    birthday = db.Column(db.Date(), nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)
    
    is_active = db.Column(db.Boolean(), nullable=False)

    medicals = db.relationship("Medical", back_populates="user", lazy=True)  
    
    blocked_tokens = db.relationship("TokenBlockedList", back_populates="user", lazy=True)  


    def __repr__(self):
        return f'<User {self.id}, {self.role.value}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city,
            "address": self.address,
            "photo": self.photo,
            "birthday": self.birthday,
            "role": self.role.value,
            "is_active": self.is_active
        }
    
class Medical(db.Model):
    __tablename__ = 'medical'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    specialty = db.Column(db.String(80), nullable=False)
    university = db.Column(db.String(80), nullable=False)
    time_availability = db.Column(db.String(80), nullable=False)
    medical_consultation_price = db.Column(db.String(80), nullable=False)
   
    user = db.relationship(User) 

    def __repr__(self):
        return f'<Medical {self.id}, {self.user.first_name}>'

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.serialize(), 
            "specialty": self.specialty,
            "university": self.university,
            "time_availability": self.time_availability,
            "medical_consultation_price": self.medical_consultation_price
        }


class TokenBlockedList(db.Model):
    __tablename__ = 'token_blocked_list'  
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id")) 
    user = db.relationship(User) 

    def __repr__(self):
        return f'TokenBlockedList {self.jti} for user_id {self.user_id}'

    def serialize(self):
        return {
            "id": self.id,
            "jti": self.jti,
            "user_id": self.user_id
        }
