"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app 
from api.models import db, User, Doctor, RoleEnum, TokenBlockedList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

api = Blueprint('api', __name__)
CORS(api)
appointments = []

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    exist=User.query.filter_by(email=data.get("email")).first()
    if exist:
        return jsonify({"msg": "email already exists"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    country = data.get('country')
    city = data.get('city')
    role = data.get('role')

    if role not in [RoleEnum.PATIENT.value, RoleEnum.DOCTOR.value]:
        print(RoleEnum.PATIENT.value)
        return jsonify({"error": "Invalid role"}), 400
   
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    user = User(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        country=country,
        city=city,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    if role == RoleEnum.DOCTOR.value:
        speciality = data.get('speciality')
        time_availability = data.get('time_availability')
        medical_consultant_price = data.get('medical_consultant_price')
        
        if Doctor.query.filter_by(user_id=user.id).first():
            return jsonify({"error": "Doctor already exists for this user"}), 400

        doctor = Doctor(
            user_id=user.id,
            speciality=speciality,
            time_availability=time_availability,
            medical_consultant_price=medical_consultant_price)

@api.route('/appointments', methods=['GET', 'POST'])
def manage_appointments():
    if request.method == 'POST':
        data = request.json
        # Check if the appointment time is available
        for appointment in appointments:
            if appointment['date'] == data['date']:
                return jsonify({"message": "Time slot is not available!"}), 400
        
        appointments.append(data)
        return jsonify({"message": "Appointment added!", "appointment": data}), 201
    return jsonify(appointments), 200

@api.route('/signup', methods=['POST'])
def signup_user():
    try:
        body = request.get_json()
        exist_user=User.query.filter_by(email=body["email"]).first()
        if exist_user:
            return jsonify({"msg": "User exists already"}), 404
        pw_hash=current_app.bcrypt.generate_password_hash(body["password"]).decode("utf-8")
        new_user=User(
            email=body["email"],
            # password=pw_hash,
            password=pw_hash,
            first_name=body["first_name"],
            last_name=body["last_name"],
            city=body["city"],
            country=body["country"],
            address=body["address"],
            photo=body["photo"],
            birthday=body["birthday"],
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created"}), 201
    except Exception as e:
        return jsonify({"msg": "Error al crear el usuario", "error": str(e)}), 500

@api.route('/signup/medical', methods=['POST'])
@jwt_required()
def signup_medical():
    try:
        body = request.get_json()
        user_id=get_jwt_identity()
        exist_user=User.query.get(user_id)
        if not exist_user:
            return jsonify({"msg": "User not found"}), 404
        new_medical=Doctor(
            user_id=user_id,
            # password=pw_hash,
            specialty= body["specialty"],
            university= body["university"],
            time_availability=body["time_availability"],
            medical_consultation_price=body["medical_consultation_price"]
        )
        db.session.add(Doctor)
        db.session.commit()

        return jsonify(Doctor.serialize()), 201
    except Exception as e:
        return jsonify(User.serialize()), 201


@api.route('/doctors', methods=['GET'])
def get_doctors():
    doctors=Doctor.query.all() 
    if doctors==[]:
        return jsonify({"msg": "doctors don't exist"}), 400
    results=list(map(lambda item:item.serialize(), doctors))
    return jsonify (results), 200

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email=data.get("email", None)
    password=data.get("password", None)
    user=User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "user not found"}), 404
    valid_password=  check_password_hash(user.password, password)
    if not valid_password:
        return jsonify({"msg": "invalid email or password"}), 400
    access_token=create_access_token(identity={"id": user.id, "role": user.role.value})
    result={}
    result["access_token"]=access_token
    if user.role.value == RoleEnum.DOCTOR.value:
        doctor=Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            return jsonify({"msg": "doctor not found"}), 404
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
        return jsonify({"msg":"Session cerrada"}), 200
    except Exception as e:
        return jsonify({"msg": "Error al cierre de sesión", "error": str(e)}), 500

# Devuelve una lista de todas las especialidades
@api.route('/specialities', methods=['GET'])
def get_especialities():
    specialities = db.session.query(Doctor.speciality).distinct().all()

    specialities_list = [speciality[0] for speciality in specialities]
    return jsonify(specialities_list), 200
