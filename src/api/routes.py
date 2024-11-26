"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Doctor, RoleEnum, TokenBlockedList, Appointment
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from datetime import datetime

api = Blueprint('api', __name__)
CORS(api)
appointments = []
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    exist=User.query.filter_by(email=data.get("email")).first() # 10 responde 1
    if exist:
        return jsonify({"Msg": "Email already exists"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    country = data.get('country')
    city = data.get('city')
    age = data.get('age')
    role = data.get('role')
    if role not in [RoleEnum.PATIENT.value, RoleEnum.DOCTOR.value]:
        print(RoleEnum.PATIENT.value)
        return jsonify({"Error": "Invalid role"}), 400
   
    hashed_password = generate_password_hash(password)
    # print(hashed_password)
    user = User(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name, 
        country=country,
        city=city,
        age=age,
        role=role
    )
    db.session.add(user)
    db.session.commit()

    if role == RoleEnum.DOCTOR.value:
        speciality = data.get('speciality')
        time_availability = data.get('time_availability')
        medical_consultant_price = data.get('medical_consultant_price')
        
        if Doctor.query.filter_by(user_id=user.id).first():
            return jsonify({"Error": "Doctor already exists for this user"}), 400

        doctor = Doctor(
            user_id=user.id,
            speciality=speciality,
            time_availability=time_availability,
            medical_consultant_price=medical_consultant_price)
        
        db.session.add(doctor)
        db.session.commit()
        return jsonify(doctor.serialize())
    return jsonify(user.serialize())

        
@api.route('/appointments', methods=['GET', 'POST'])
def manage_appointments():
    if request.method == 'POST':
        data = request.json
        doctor_id = data.get('doctor_id')
        patient_id = data.get('patient_id')
        appointment_date = data.get('date')  # Fecha en formato ISO (YYYY-MM-DDTHH:MM:SS)

        if not doctor_id or not patient_id or not appointment_date:
            return jsonify({"Msg": "Missing required fields!"}), 400

        # Convertir la fecha
        try:
            appointment_date = datetime.fromisoformat(appointment_date)
        except ValueError:
            return jsonify({"Msg": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400

        # Buscar al doctor
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({"Msg": "Doctor not found!"}), 404

        # Validar la hora dentro del rango de disponibilidad del doctor
        start_time, end_time = doctor.time_availability.split('-')
        start_time = datetime.strptime(start_time.strip(), "%H:%M").time()
        end_time = datetime.strptime(end_time.strip(), "%H:%M").time()

        if not (start_time <= appointment_date.time() <= end_time):
            return jsonify({"Msg": "Appointment time is outside the doctor's availability!"}), 400

        # Verificar si ya existe una cita para el doctor en la misma fecha y hora
        existing_appointment = Appointment.query.filter_by(
            doctor_id=doctor_id,
            date=appointment_date
        ).first()

        if existing_appointment:
            return jsonify({"Msg": "This time slot is not available!"}), 400

        # Crear la cita
        new_appointment = Appointment(
            doctor_id=doctor_id,
            #patient_id=patient_id,
            date=appointment_date
        )
        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({"Msg": "Appointment successfully created!", "appointment": new_appointment.serialize()}), 201

    # Manejar método GET: Devolver todas las citas
    appointments = Appointment.query.all()
    return jsonify([appointment.serialize() for appointment in appointments]), 200
  #  if request.method == 'POST':
   #     data = request.json
    #    for appointment in appointments:
     #       if appointment['date'] == data['date']:
      #          return jsonify({"Msg": "Time slot is not available!"}), 400
        
       # appointments.append(data)
        #return jsonify({"Msg": "Appointment added!", "appointment": data}), 201
    #return jsonify(appointments), 200

@api.route('/signup', methods=['POST'])
def signup_user():
    try:
        body = request.get_json()
        exist_user=User.query.filter_by(email=body["email"]).first()
        if exist_user:
            return jsonify({"Msg": "User exists already"}), 404
        pw_hash=current_app.bcrypt.generate_password_hash(body["password"]).decode("utf-8")
        new_user=User(
            email=body["email"],
            password=pw_hash,
            first_name=body["first_name"],
            last_name=body["last_name"],
            country=body["country"],
            city=body["city"],
            age=body["age"],
            rol=body["role"],
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"Msg": "User created"}), 201
    except Exception as e:
        return jsonify({"Msg": "Error creating user", "Error": str(e)}), 500

@api.route('/signup/medical', methods=['POST'])
@jwt_required()
def signup_medical():
    try:
        body = request.get_json()
        user_id=get_jwt_identity()
        exist_user=User.query.get(user_id)
        if not exist_user:
            return jsonify({"Msg": "User not found"}), 404
        new_medical=Doctor(
            user_id=user_id,
            speciality= body["speciality"],
            university= body["university"],
            time_availability=body["time_availability"],
            medical_consultation_price=body["medical_consultation_price"]
        )
        db.session.add(new_medical)
        db.session.commit()

        return jsonify(new_medical.serialize()), 201
    except Exception as e:
        return jsonify({"Error": "Unexpected error"}), 500


@api.route('/doctors', methods=['GET'])
def get_doctors():
    doctors=Doctor.query.all()
    if doctors==[]:
        return jsonify({"Msg": "There aren't doctors"}), 400
    results=list(map(lambda item:item.serialize(), doctors))
    return jsonify (results), 200
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email=data.get("email", None)
    password=data.get("password", None)
    user=User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"Msg": "User not found"}), 404
    valid_password=  check_password_hash(user.password, password)
    if not valid_password:
        return jsonify({"Msg": "Invalid email or password"}), 400
    access_token=create_access_token(identity={"id": user.id, "role": user.role.value})
    result={}
    result["access_token"]=access_token
    if user.role.value == RoleEnum.DOCTOR.value:
        doctor=Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            return jsonify({"Msg": "Doctor not found"}), 404
        result["doctor"]=doctor.serialize()
        return jsonify(result), 200
    result["user"]=user.serialize()
    return jsonify(result), 200
@api.route("/protected", methods=["GET"])
@jwt_required()
def user_logout():
    try:
        token_data=get_jwt_identity()
        token_blocked=TokenBlockedList(jti=token_data["jti"])
        db.session.add(token_blocked)
        db.session.commit()
        return jsonify({"Msg":"Closed session"}), 200
    except Exception as e:
        return jsonify({"Msg": "Logout error", "Error": str(e)}), 500

# Devuelve una lista de todas las especialidades
@api.route('/specialities', methods=['GET'])
def get_especialities():
    specialities = db.session.query(Doctor.speciality).distinct().all()
    specialities_list = [speciality[0] for speciality in specialities]
    return jsonify(specialities_list), 200