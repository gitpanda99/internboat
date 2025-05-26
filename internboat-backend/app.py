# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS # This is crucial for allowing your frontend to talk to your backend

app = Flask(__name__)
# Enable CORS for all routes. This allows your frontend (e.g., internboat.onrender.com)
# to make requests to this backend service.
CORS(app)

# In-memory storage for registrations.
# IMPORTANT: This data will be lost every time the server restarts (e.g., on deploy or if it crashes).
# For a real application, you'd use a database (like PostgreSQL, MongoDB, SQLite).
registrations = []

@app.route('/')
def home():
    """A simple home route to check if the backend is running."""
    return "Internboat Backend is running! (API endpoints: /register, /view-registrations, /login)"

@app.route('/register', methods=['POST'])
def register():
    """Handles new user registrations."""
    # Ensure the request body is JSON
    if not request.is_json:
        return jsonify({"message": "Request must be JSON"}), 400

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')

    # Basic validation
    if not name or not email:
        return jsonify({"message": "Name and email are required"}), 400

    # Check if email already exists (case-insensitive for simplicity)
    if any(reg['email'].lower() == email.lower() for reg in registrations):
        return jsonify({"message": "Email already registered"}), 409 # 409 Conflict

    # Add new registration
    registrations.append({"name": name, "email": email})
    print(f"Registered new user: Name='{name}', Email='{email}'") # For server logs
    return jsonify({"message": "Registration successful!", "user": {"name": name, "email": email}}), 201 # 201 Created

@app.route('/view-registrations', methods=['GET'])
def view_registrations():
    """Returns all registered users."""
    return jsonify(registrations)

@app.route('/login', methods=['POST'])
def login():
    """Handles user login verification."""
    # Ensure the request body is JSON
    if not request.is_json:
        return jsonify({"message": "Request must be JSON"}), 400

    data = request.get_json()
    entered_name = data.get('name')
    entered_email = data.get('email')

    # Basic validation
    if not entered_name or not entered_email:
        return jsonify({"message": "Name and email are required"}), 400

    # Check if a user with matching name and email exists
    user_found = False
    for reg in registrations:
        if reg['name'] == entered_name and reg['email'] == entered_email:
            user_found = True
            break

    if user_found:
        return jsonify({"message": "Login successful!", "status": "success"}), 200
    else:
        # It's good practice not to specify if it's name or email that's wrong for security
        return jsonify({"message": "Invalid name or email", "status": "fail"}), 401 # 401 Unauthorized

# This part is for local development only
if __name__ == '__main__':
    # Use a specific port for local testing
    app.run(debug=True, port=5000)