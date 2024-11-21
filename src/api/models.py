from flask_sqlalchemy import SQLAlchemy
from enum import Enum


db = SQLAlchemy()
    
class RoleEnum(Enum):

    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    MANAGER = "MANAGER"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    age = db.Column(db.String(80), nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)

    appointments = db.relationship("Appointment", back_populates="patient", lazy=True)
    doctors=db.relationship("Doctor", back_populates="user", lazy=True)

    def __repr__(self):
        return f'<User {self.id}, {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city,
            "age": self.age,
            "role": self.role.value
        }
    def serialize_doctors(self):
        return [doctor.serialize() for doctor in self.doctors]


class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    speciality = db.Column(db.String(100), nullable=False)
    time_availability = db.Column(db.String(100), nullable=False)
    medical_consultant_price = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id")) 
    user= db.relationship(User)
    appointments = db.relationship("Appointment", back_populates="doctor", lazy=True)

    def __repr__(self):
        return f'<Doctor {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "info":self.user.serialize() if self.user else None,
            "speciality": self.speciality,
            "time_availability": self.time_availability,
            "medical_consultant_price": self.medical_consultant_price,
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id")) 
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"))    

    doctor = db.relationship(Doctor)
    patient = db.relationship(User)


    def __repr__(self):
        return f'<Appointment {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "patient": self.patient.serialize() if self.patient else None, 
            "doctor": self.doctor.serialize() if self.doctor else None
        }

class TokenBlockedList(db.Model):
    __tablename__ = 'token_blocked_list'  
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<TokenBlockedList {self.jti}>'

    def serialize(self):
        return {
            "id": self.id,
            "jti": self.jti,
        }