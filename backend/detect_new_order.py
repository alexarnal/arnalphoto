import requests
import time
import json
import os
from datetime import datetime
from square_interfacing import create_square_order_and_get_payment_link

# Formspree API endpoint
url = f"https://formspree.io/api/0/forms/{os.environ['FORMSPREE_FORM_HASHID']}/submissions"
headers = {
    "Authorization": f"Bearer {os.environ['FORMSPREE_API_KEY']}",
    "Accept": "application/json"
}

last_submission = None
start_time = datetime.now()
last_order_time = None

def check_for_new_submissions():
    global last_submission, last_order_time
    current_time = datetime.now()
    
    # Calculate running time and time since last order
    running_time = (current_time - start_time).seconds
    time_since_order = (current_time - last_order_time).seconds if last_order_time else 0
    
    print(f"\rRunning: {running_time}s | Last order: {time_since_order}s ago" + " "*20, end='', flush=True)
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"\nAPI Error: {response.status_code}")
        return

    submissions = response.json()['submissions']
    if not submissions:
        return

    latest_submission = submissions[0]
    if last_submission and latest_submission['_date'] == last_submission['_date']:
        return

    # Clear the status line when new order is received
    print("\n" + "="*50)
    print(f"New order received at {current_time.strftime('%H:%M:%S')}!")
    
    order_details = latest_submission.get('order_details')
    if order_details:
        # Clean up order details
        order_details = '[' + order_details[order_details.rfind("[")+1:order_details.rfind("]")] + ']'
        print("Order details:", json.dumps(json.loads(order_details), indent=2))
        
        # Create order in Square
        payment_link = create_square_order_and_get_payment_link(order_details, latest_submission.get('email'))
        print(f"Payment link: {'Created - ' + payment_link if payment_link else 'Failed'}")
    else:
        print("Warning: No order details in submission")
    
    print("="*50)
    last_submission = latest_submission
    last_order_time = current_time

def main():
    global last_submission, last_order_time
    print("Starting order monitoring service...")
    
    # Initialize last_submission
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        submissions = response.json()['submissions']
        if submissions:
            last_submission = submissions[0]
            last_order_time = datetime.now()  # Initialize last order time
            print(f"Initialized with last order from: {last_submission['_date']}")
        else:
            print("No previous submissions found")
    else:
        print(f"Initialization error: {response.status_code}")
        return

    while True:
        check_for_new_submissions()
        time.sleep(5)

if __name__ == "__main__":
    main()