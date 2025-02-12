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
        email = request.form.get('email')
        order_details = request.form.get('order_details')
        
        # Clean up order details (keeping your existing logic)
        order_details = '[' + order_details[order_details.rfind("[")+1:order_details.rfind("]")] + ']'
        
        # Create payment link using your existing function
        payment_link = create_square_order_and_get_payment_link(order_details, email)
        
        if payment_link:
            # Redirect to the payment link
            return redirect(payment_link)
        else:
            return "Failed to create payment link", 500
            
    except Exception as e:
        print(f"Error processing submission: {str(e)}")
        return "Error processing submission", 500

if __name__ == '__main__':
    # Make sure required environment variables are set
    required_vars = ['SQUARE_ACCESS_TOKEN']  # Add any other required env vars
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8080)