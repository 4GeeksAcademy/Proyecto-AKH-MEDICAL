"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Doctor, RoleEnum, TokenBlockedList, Testimonial, TestimonialCount, Appointment
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity, get_jwt
from flask_jwt_extended import jwt_required
import json 
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
        for appointment in appointments:
            if appointment['date'] == data['date']:
                return jsonify({"Msg": "Time slot is not available!"}), 400
        
        appointments.append(data)
        return jsonify({"Msg": "Appointment added!", "appointment": data}), 201
    return jsonify(appointments), 200

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

@api.route('/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if doctor:
        return jsonify(doctor.serialize()), 200
    else:
        return jsonify({'error': 'Doctor not found'}), 404


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
    token_data=json.dumps({"id": user.id, "role": user.role.value})
    access_token=create_access_token(identity=token_data)
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

@api.route("/logout", methods=["POST"])
@jwt_required()
def user_logout():
    try:
        token_data=get_jwt()
        token_blocked=TokenBlockedList(jti=token_data["jti"])
        db.session.add(token_blocked)
        db.session.commit()
        return jsonify({"Msg":"Closed session"}), 200
    except Exception as e:
        return jsonify({"Msg": "Logout error", "Error": str(e)}), 500
    
@api.route("/current_user", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        token_data=get_jwt_identity()
        user=json.loads(token_data)
        print(user)
        exist_user=User.query.get(user["id"])
        if not exist_user:
            return jsonify({"Msg": "User not found"}), 404
        return jsonify(exist_user.serialize()), 200
    except Exception as e:
        return jsonify({"Msg": "cannot get current user", "Error": str(e)}), 500


@api.route('/specialities', methods=['GET'])
def get_especialities():
    specialities = db.session.query(Doctor.speciality).distinct().all()
    specialities_list = [speciality[0] for speciality in specialities]
    return jsonify(specialities_list), 200

@api.route('/testimonials', methods=['GET'])
def get_testimonials():
    testimonials=Testimonial.query.all()
    if testimonials==[]:
        return jsonify({"Msg": "There aren't testimonials"}), 400
    results=list(map(lambda item:item.serialize(), testimonials))
    return jsonify (results), 200

@api.route('/testimonial', methods=['POST'])
@jwt_required()
def create_testimonial():
    # try:
        body = request.get_json()
        token_data=get_jwt_identity()
        user=json.loads(token_data)
        print(user)
        exist_user=User.query.get(user["id"])
        if not exist_user:
            return jsonify({"Msg": "User not found"}), 404
        new_testimonial=Testimonial(
            patient_id=user["id"],
            content= body["content"],
            count= TestimonialCount(int(body["count"])) if  "count" in body else None
        )
        db.session.add(new_testimonial)
        db.session.commit()

        return jsonify(new_testimonial.serialize()), 201
    # except Exception as e:
    #     return jsonify({"Error": "Unexpected error"}), 500

