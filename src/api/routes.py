"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import paypalrestsdk
import logging 
paypalrestsdk.configure({ 
    "mode": "sandbox",  
    "client_id": "Afc8qlthkmv24JpZbwp2cCELxTbk4Kv5fGIeZk9KBwZKkdTut_7wSJ6LV4MQ9PzSNV_XS_0qTghi0SYZ",
    "client_secret":"ENuCVvRxsMG2AhUEqtznqWnxlOATrzbPqNaBt0D6PbgaZL71uwL_JhKKS53B082VJ9wTileuhkHcKvO1" 
    })
logging.basicConfig(level=logging.INFO)

from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Doctor, RoleEnum, TokenBlockedList, Testimonial, TestimonialCount, MedicalHistory, Appointment
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt, jwt_required 
import json


api = Blueprint('api', __name__)
CORS(api)
appointments = []


@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    exist = User.query.filter_by(email=data.get("email")).first()
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
        return jsonify({"Error": "Invalid role"}), 400

    hashed_password = generate_password_hash(password)
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
        print("Received data:", data)
        # Verificar que se proporcionen todos los campos necesarios 
        required_fields = ['user_id', 'doctor_id', 'date'] 
        missing_field = [field for field in required_fields if field not in data]
        if missing_field:
            print("Missing fields:", missing_field)
            return jsonify({"Msg": f"Missing fields: {', '.join(missing_field)}"}), 400
        # Verificar la disponibilidad de la cita 
        existing_appointment = Appointment.query.filter_by(doctor_id=data['doctor_id'], date=data['date']).first() 
        if existing_appointment: 
            print("Time slot is not available for Doctor ID:", data['doctor_id'], "at Date:", data['date'])
            return jsonify({"Msg": "Time slot is not available!"}),400
        
        # Crear y agregar la nueva cita 
        new_appointment = Appointment( 
            user_id=data['user_id'], 
            doctor_id=data['doctor_id'], 
            date=data['date'] ) 
        db.session.add(new_appointment) 
        db.session.commit() 

        print("Appoinment added: ", new_appointment)
        return jsonify({"Msg": "Appointment added!", "appointment": new_appointment.serialize()}), 201 
    # Obtener todas las citas 
    appointments = Appointment.query.all() 
    return jsonify([appointment.serialize() for appointment in appointments]), 200

@api.route('/signup', methods=['POST'])
def signup_user():
    try:
        body = request.get_json()
        exist_user = User.query.filter_by(email=body["email"]).first()
        if exist_user:
            return jsonify({"Msg": "User exists already"}), 404
        pw_hash = current_app.bcrypt.generate_password_hash(body["password"]).decode("utf-8")
        new_user = User(
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
        user_id = get_jwt_identity()
        exist_user = User.query.get(user_id)
        if not exist_user:
            return jsonify({"Msg": "User not found"}), 404
        new_medical = Doctor(
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
    doctors = Doctor.query.all()
    if not doctors:
        return jsonify({"Msg": "There aren't doctors"}), 400
    results = list(map(lambda item: item.serialize(), doctors))
    return jsonify(results), 200

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
    email = data.get("email", None)
    password = data.get("password", None)
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"Msg": "User not found"}), 404
    valid_password = check_password_hash(user.password, password)
    if not valid_password:
        return jsonify({"Msg": "Invalid email or password"}), 400
    token_data = json.dumps({"id": user.id, "role": user.role.value})
    access_token = create_access_token(identity=token_data)
    result = {"access_token": access_token}
    if user.role.value == RoleEnum.DOCTOR.value:
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            return jsonify({"Msg": "Doctor not found"}), 404
        result["doctor"] = doctor.serialize()
        return jsonify(result), 200
    result["user"] = user.serialize()
    return jsonify(result), 200

@api.route("/logout", methods=["POST"])
@jwt_required()
def user_logout():
    try:
        token_data = get_jwt()
        token_blocked = TokenBlockedList(jti=token_data["jti"])
        db.session.add(token_blocked)
        db.session.commit()
        return jsonify({"Msg": "Closed session"}), 200
    except Exception as e:
        return jsonify({"Msg": "Logout error", "Error": str(e)}), 500

@api.route("/current_user", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        token_data = get_jwt_identity()
        user = json.loads(token_data)
        exist_user = User.query.get(user["id"])
        if not exist_user:
            return jsonify({"Msg": "User not found"}), 404
        return jsonify(exist_user.serialize()), 200
    except Exception as e:
        return jsonify({"Msg": "Cannot get current user", "Error": str(e)}), 500
@api.route('/specialities', methods=['GET'])
def get_specialities():
    specialities = db.session.query(Doctor.speciality).distinct().all()
    specialities_list = [speciality[0] for speciality in specialities]
    return jsonify(specialities_list), 200

@api.route('/testimonials', methods=['GET'])
def get_testimonials():
    testimonials = Testimonial.query.all()
    if not testimonials:
        return jsonify({"Msg": "There aren't testimonials"}), 400
    results = list(map(lambda item: item.serialize(), testimonials))
    return jsonify(results), 200

@api.route('/testimonial', methods=['POST'])
@jwt_required()
def create_testimonial():
    body = request.get_json()
    token_data = get_jwt_identity()
    user = json.loads(token_data)
    exist_user = User.query.get(user["id"])
    if not exist_user:
        return jsonify({"Msg": "User not found"}), 404
    new_testimonial = Testimonial(
        patient_id=user["id"],
        content=body["content"],
        count=TestimonialCount(int(body["count"])) if "count" in body else None
    )
    db.session.add(new_testimonial)
    db.session.commit()
    return jsonify(new_testimonial.serialize()), 201



@api.route('/medical-history', methods=['POST'])
@jwt_required()
def create_medical_history():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        if 'user_email' not in data or 'doctor_email' not in data or 'observation' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        doctor = Doctor.query.filter_by(user_id=user_id).first()
        if not doctor:
            return jsonify({"Msg": "Only doctors can create medical histories"}), 403

        user_email = data['user_email']
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({"Msg": "User not found"}), 404

        doctor_email = data['doctor_email']
        doctor = User.query.filter_by(email=doctor_email).first()
        if not doctor or doctor.role != RoleEnum.DOCTOR:
            return jsonify({"Msg": "Doctor not found"}), 404

        observation = data['observation']

        medical_history = MedicalHistory(
            doctor_id=doctor.id,
            patient_id=user.id,
            observation=observation
        )

        db.session.add(medical_history)
        db.session.commit()
        return jsonify(medical_history.serialize()), 201

    except Exception as e:
        print(f"Error creating medical history: {e}")
        return jsonify({"error": "Failed to create medical history"}), 500
    
    

@api.route('/medical-history/doctors-by-speciality', methods=['GET'])
def get_doctors_by_speciality():
    try:
        speciality = request.args.get('speciality')
        if not speciality:
            return jsonify({"Msg": "Speciality parameter is required"}), 400

        doctors = Doctor.query.filter_by(speciality=speciality).all()
        results = [doctor.serialize() for doctor in doctors]
        return jsonify(results), 200

    except Exception as e:
        print(f"Error fetching doctors by speciality: {e}")
        return jsonify({"error": "Failed to fetch doctors by speciality"}), 500

@api.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    try:
        patients = User.query.filter_by(role=RoleEnum.PATIENT).all()
        if not patients:
            return jsonify([]), 200  # Devolver una lista vacía si no hay pacientes
        return jsonify([patient.serialize() for patient in patients]), 200
    except Exception as e:
        print(f"Error fetching patients: {e}")
        return jsonify({"error": "Failed to fetch patients"}), 500



@api.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500

@api.route('/medical-history/user', methods=['GET'])
@jwt_required()
def get_user_medical_history():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"Msg": "User not found"}), 404

        medical_histories = MedicalHistory.query.filter_by(patient_id=user_id).all()
        return jsonify([history.serialize() for history in medical_histories]), 200

    except Exception as e:
        print(f"Error fetching medical histories for user: {e}")
        return jsonify({"error": "Failed to fetch medical histories for user"}), 500

@api.route('/medical-history/doctor', methods=['GET'])
@jwt_required()
def get_doctor_medical_history():
    try:
        user_id = get_jwt_identity()
        doctor = Doctor.query.filter_by(user_id=user_id).first()

        if not doctor:
            return jsonify({"Msg": "Access forbidden"}), 403

        medical_histories = MedicalHistory.query.filter_by(doctor_id=doctor.id).all()
        return jsonify([history.serialize() for history in medical_histories]), 200

    except Exception as e:
        print(f"Error fetching medical histories for doctor: {e}")
        return jsonify({"error": "Failed to fetch medical histories for doctor"}), 500

@api.route('/medical-history/doctor/users', methods=['GET'])
@jwt_required()
def get_users_with_histories():
    try:
        user_id = get_jwt_identity()
        doctor = Doctor.query.filter_by(user_id=user_id).first()

        if not doctor:
            return jsonify({"Msg": "Access forbidden"}), 403

        users = db.session.query(User).join(MedicalHistory, User.id == MedicalHistory.patient_id)\
                                     .filter(MedicalHistory.doctor_id == doctor.id).distinct().all()

        return jsonify([user.serialize() for user in users]), 200

    except Exception as e:
        print(f"Error fetching users with histories: {e}")
        return jsonify({"error": "Failed to fetch users with histories"}), 500
