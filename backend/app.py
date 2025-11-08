# app.py
from flask import Flask, request, redirect, render_template, jsonify
import hmac
import hashlib
import json
import os
from square_interfacing import create_square_order_and_get_payment_link
import logging

app = Flask(__name__)

@app.route('/')
def home():
    return app.send_static_file('form.html')

@app.route('/submit', methods=['POST'])
def submit():
    print("Received submission!")
    print(f"Form data: {request.form}")
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
        payment_link = create_square_order_and_get_payment_link(
                          json.dumps(order_data),
                          request.form.get('student_name', ''),
                          request.form.get('student_email', ''),
                          request.form.get('student_phone', ''),
                          request.form.get('ask_for_shipping', False)
                       )
        
        if not payment_link:
            return "Failed to create payment link", 500
            
        return redirect(payment_link)
            
    except Exception as e:
        print(f"Error processing submission: {str(e)}")
        # In production, you might want to log the full error details securely
        return "An error occurred processing your order. Please try again.", 500

# Add these routes to your existing Flask app
@app.route('/webhook', methods=['POST'])
def square_webhook():
    logger = logging.getLogger(__name__)
    logger.info("Webhook received!")
    
    # Log headers
    logger.info(f"Headers: {dict(request.headers)}")
    
    # Log signature
    signature = request.headers.get('x-square-hmacsha256-signature')
    logger.info(f"Signature: {signature}")
    
    # Log body
    body = request.get_data()
    logger.info(f"Raw body: {body}")

    # Verify webhook signature
    signature = request.headers.get('x-square-hmacsha256-signature')
    webhook_url = 'https://api.arnalphoto.com/webhook'  # Your webhook URL
    signing_key = os.environ.get('SQUARE_WEBHOOK_SIGNING_KEY')
    
    # Verify the webhook is from Square
    body = request.get_data()
    hmac_obj = hmac.new(signing_key.encode('utf-8'), body, hashlib.sha256)
    if not hmac.compare_digest(signature, hmac_obj.hexdigest()):
        return jsonify({'message': 'Invalid signature'}), 401

    event = request.json
    event_type = event.get('type')
    
    if event_type == 'payment.updated':
        payment = event.get('data', {}).get('object', {}).get('payment', {})
        order_id = payment.get('order_id')
        status = payment.get('status')
        
        if status == 'COMPLETED':
            # Here you would:
            # 1. Look up the original order details
            # 2. Save customer information to your database
            # 3. Send confirmation email, etc.
            logger.info(f"Payment for order {order_id} has been completed")
            pass
    
    return jsonify({'message': 'Webhook received'}), 200

# Optional route to test webhook is working
@app.route('/webhook/test', methods=['GET'])
def test_webhook():
    return jsonify({'message': 'Webhook endpoint is active'}), 200

if __name__ == '__main__':
    # Make sure required environment variables are set
    required_vars = ['SQUARE_ACCESS_TOKEN']  # Add any other required env vars
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8080)