from flask import Flask, request, redirect, render_template
import json
import os
from square_interfacing import create_square_order_and_get_payment_link

app = Flask(__name__)

@app.route('/')
def home():
    return app.send_static_file('form.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        # Get form data
        # email = request.form.get('email')
        # if not email:
        #     return "Email is required", 400
            
        order_details = request.form.get('order_details')
        if not order_details:
            return "Order details are required", 400
            
        try:
            # Parse order details as JSON
            order_data = json.loads(order_details)
        except json.JSONDecodeError:
            return "Invalid order details format", 400

        # Create payment link
        payment_link = create_square_order_and_get_payment_link(json.dumps(order_data))
        
        if not payment_link:
            return "Failed to create payment link", 500
            
        return redirect(payment_link)
            
    except Exception as e:
        print(f"Error processing submission: {str(e)}")
        # In production, you might want to log the full error details securely
        return "An error occurred processing your order. Please try again.", 500

if __name__ == '__main__':
    # Make sure required environment variables are set
    required_vars = ['SQUARE_ACCESS_TOKEN']  # Add any other required env vars
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8080)