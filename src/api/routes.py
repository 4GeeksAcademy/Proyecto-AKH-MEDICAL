"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app, Response
from api.models import db, User, Doctor, RoleEnum, TokenBlockedList, Testimonial, TestimonialCount, MedicalHistory, Appointment
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt, jwt_required 
import json
import os
import logging
import paypalrestsdk
import cloudinary
import tempfile


paypalrestsdk.configure({ 
    "mode": os.getenv("PAYPAL_MODE", "sandbox"),
    "client_id": os.getenv("PAYPAL_CLIENT_ID"),
    "client_secret": os.getenv("PAYPAL_CLIENT_SECRET")
})

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)



api = Blueprint('api', __name__)
CORS(api, resources={
    r"/api/*": {
        "origins": "*",  # En producción, especifica los dominios permitidos
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True
    }
})

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
    

@api.route('/appointments', methods=['POST'])
@jwt_required()
def manage_appointments(): 
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = json.loads(user_id)['id']
        data = request.json
        print ("Received data:", data)

        required_fields = ['doctor_id','date']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print ("Missing fields:", missing_fields)
            return jsonify({"Msg": f"Missing fields: {', '.join(missing_fields)}"}), 400
        doctor_id=data['doctor_id']
        date=data['date']
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({"msg":"Doctor not found"}), 404
        existing_appointment = Appointment.query.filter_by(doctor_id=data['doctor_id'], date=data['date']).first()
        if existing_appointment:
            print("Time slot is not available for Doctor:", data['doctor_id'],"at Date:", data['date'])
            return jsonify({"Msg": "Time slot is not available!"}),400
        new_appointment = Appointment(
            patient_id=user_id,
            doctor_id=data['doctor_id'],
            date=data['date']
        )
        db.session.add(new_appointment)
        db.session.commit()
        print("Appointment added:", new_appointment)
        
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment/execute",
                "cancel_url": "http://localhost:3000/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "appointment",
                        "sku": "001",
                        "price": f"{doctor.medical_consultant_price:.2f}",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": f"{doctor.medical_consultant_price:.2f}",
                    "currency": "USD"
                },
                "description": "Payment for medical consultation."
            }]
        })

        if payment.create():
            # Obtener URL de aprobación
            approval_url = next((link.href for link in payment.links if link.rel == "approval_url"), None)
            return jsonify({
                "msg": "Appointment created successfully!",
                "appointment": new_appointment.serialize(),
                "approval_url": approval_url
            }), 201
        else:
            logging.error(f"PayPal error: {payment.error}")
            return jsonify({"msg": "Error creating PayPal payment", "error": payment.error}), 500

    except Exception as ex:
        print(ex)
        return jsonify({"msg":"Error creating appointment"}), 500
@api.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointments():
    try:
        appointments = Appointment.query.all()
        return jsonify([appointment.serialize() for appointment in appointments]), 200
    except Exception as ex:
        print(ex)
        return jsonify({"msg":"Error fetching appointments"}), 500
    
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
        return jsonify({"Msg": "There aren't testimonials"}), 404
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
        doctor_email = data.get('doctor_email')
        user_email = data.get('user_email')
        observation = data.get('observation')

        current_user = get_jwt_identity()

        user = User.query.filter_by(email=doctor_email).first()
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        patient = User.query.filter_by(email=user_email).first()

        if not doctor or not patient:
            return jsonify({"msg": "Doctor or Patient not found"}), 404

        medical_history = MedicalHistory(
            doctor_id=doctor.id,
            patient_id=patient.id,
            observation=observation
        )

        db.session.add(medical_history)
        db.session.commit()

        return jsonify(medical_history.serialize()), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": "Error al crear el historial médico"}), 500
    

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

@api.route('/medical-history/doctor/users', methods=['GET'])
@jwt_required()
def get_users_with_histories():
    try:
        token_data = get_jwt_identity()
        user = json.loads(token_data)
        doctor = Doctor.query.filter_by(user_id=user["id"]).first()

        if not doctor:
            return jsonify({"Msg": "Access forbidden"}), 403

        users = db.session.query(User).join(MedicalHistory, User.id == MedicalHistory.patient_id)\
                                     .filter(MedicalHistory.doctor_id == doctor.id).distinct().all()

        return jsonify([user.serialize() for user in users]), 200

    except Exception as e:
        print(f"Error fetching users with histories: {e}")
        return jsonify({"error": "Failed to fetch users with histories"}), 500

@api.route('/medical-history/doctor/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_doctor_patient_medical_histories(patient_id):
    try:
        token_data = get_jwt_identity()
        user = json.loads(token_data)
        doctor = Doctor.query.filter_by(user_id=user["id"]).first()

        if not doctor:
            return jsonify({"Msg": "Access forbidden"}), 403

        medical_histories = MedicalHistory.query.filter_by(doctor_id=doctor.id, patient_id=patient_id).all()

        if not medical_histories:
            return jsonify({"msg": "No medical histories found for this patient"}), 404

        return jsonify([{
            "id": history.id,
            "doctor": {
                "first_name": history.doctor.user.first_name,
                "last_name": history.doctor.user.last_name,
                "email": history.doctor.user.email
            },
            "patient": {
                "first_name": history.patient.first_name,
                "last_name": history.patient.last_name,
                "email": history.patient.email
            },
            "created_at": history.created_at,
            "observation": history.observation
        } for history in medical_histories]), 200

    except Exception as e:
        print(f"Error fetching medical histories for doctor and patient: {e}")
        return jsonify({"error": "Failed to fetch medical histories for doctor and patient"}), 500
    

@api.route('/doctors-for-patient', methods=['GET'])
@jwt_required()
def get_doctors_for_patient():
    try:
        token_data = get_jwt_identity()
        user = json.loads(token_data)
        patient = User.query.get(user["id"])

        if not patient:
            return jsonify({"msg": "Patient not found"}), 404

        medical_histories = MedicalHistory.query.filter_by(patient_id=patient.id).all()
        doctors = {history.doctor for history in medical_histories}

        return jsonify([{
            "id": doctor.id,
            "first_name": doctor.user.first_name,
            "last_name": doctor.user.last_name,
            "email": doctor.user.email,
            "speciality": doctor.speciality
        } for doctor in doctors]), 200
    except Exception as e:
        print(f"Error fetching doctors for patient: {e}")
        return jsonify({"error": "Failed to fetch doctors for patient"}), 500

@api.route('/medical-histories/doctor/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_medical_histories_with_doctor(doctor_id):
    try:
        token_data = get_jwt_identity()
        user = json.loads(token_data)
        patient = User.query.get(user["id"])

        if not patient:
            return jsonify({"msg": "Patient not found"}), 404

        medical_histories = MedicalHistory.query.filter_by(patient_id=patient.id, doctor_id=doctor_id).all()

        if not medical_histories:
            return jsonify({"msg": "No medical histories found for this doctor and patient"}), 404

        return jsonify([{
            "id": history.id,
            "doctor": {
                "first_name": history.doctor.user.first_name,
                "last_name": history.doctor.user.last_name,
                "email": history.doctor.user.email,
                "speciality": history.doctor.speciality
            },
            "patient": {
                "first_name": history.patient.first_name,
                "last_name": history.patient.last_name,
                "email": history.patient.email
            },
            "created_at": history.created_at,
            "observation": history.observation
        } for history in medical_histories]), 200
    except Exception as e:
        print(f"Error fetching medical histories for doctor and patient: {e}")
        return jsonify({"error": "Failed to fetch medical histories for doctor and patient"}), 500


@api.route('/payment/execute', methods=['GET'])
def execute_payment():
    try:
        payment_id = request.args.get('paymentId')
        payer_id = request.args.get('PayerID')

        payment = paypalrestsdk.Payment.find(payment_id)
        if payment.execute({"payer_id": payer_id}):
            return jsonify({"msg": "Payment executed successfully"}), 200
        else:
            logging.error(f"PayPal execution error: {payment.error}")
            return jsonify({"msg": "Error executing payment", "error": payment.error}), 500
    except Exception as e:
        logging.error(f"Error executing payment: {str(e)}")
        return jsonify({"msg": "Error executing payment"}), 500

@api.route("/profilepic", methods=["POST"])
@jwt_required()
def user_picture():
    try:
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()
        if user is None:
            return jsonify({"message": "User not found"}), 400

        file = request.files["profilePicture"]
        temp = tempfile.NamedTemporaryFile(delete=False)
        file.saved(temp.name)
        extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"usersPictures/{user_id}.{extension}"
        upload_result=cloudinary.uploader.upload(temp.name, public_id=filename, asset_folder="userPicture")
        print(upload_result)
        asset_id=upload_result["public_id"]
        user.img_url = asset_id
        user.img_url= asset_id
        db.session.add(user)
        db.session.commit()
        return jsonify({"msg": "Picture updated"})
    except Exception as ex:
        print(ex)
        return json ({"msg":"Error al subir la foto de perfil"})
@api.route("/profilepic", methods=["GET"])
@jwt_required()
def user_profile_picture_get():
    user_id = get_jwt_identity()
    user=User.query.get(user_id)
    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    if not user.img_url:
        return jsonify({"msg": "User has no profile picture"}), 404
    try:
        image_info = cloudinary.api.resource(user.img_url)
        return jsonify({"url":image_info["secure_url"]})
    except Exception as ex:
        print(ex)
        return jsonify({"msg": "Error fetching profile picture"})
@api.after_request
def add_csp(response):
    csp_policy = (
        "default-src 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn 'unsafe-inline'; "
        "script-src 'nonce-mSstq1H4Dsed1UVZcI574NjxbswCo1J+lm02A01WdjHogzEN' 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn 'unsafe-inline'; "
        "img-src 'self' https://*.googleusercontent.com/ https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn https://ak1s.abmr.net https://ak1s.mathtag.com https://akamai.mathtag.com https://ak1.abmr.net https://www.facebook.com https://www.google-analytics.com https://px.ads.linkedin.com https://googleads.g.doubleclick.net https://www.google.co.cr https://www.google.com https://www.googleadservices.com https://*.doubleclick.net data:; "
        "connect-src 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn https://192.55.233.1 'unsafe-inline' https://browser-intake-us5-datadoghq.com https://*.qualtrics.com https://www.google.com https://www.googleadservices.com https://www.google-analytics.com https://googleads.g.doubleclick.net; "
        "object-src 'none'; "
        "media-src 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn; "
        "font-src 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn; "
        "frame-src 'self' https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://objects.paypal.cn https://smartlock.google.com https://*.qualtrics.com https://bid.g.doubleclick.net https://*.doubleclick.net; "
        "base-uri 'self' https://*.paypal.com https://*.paypal.cn; "
        "worker-src 'self' blob: https://*.paypal.com; "
        "upgrade-insecure-requests;"
    )
    response.headers['Content-Security-Policy'] = csp_policy
    return response




