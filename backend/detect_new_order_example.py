import requests
import time
import json
import os

from square_interfacing import create_square_order_and_get_payment_link

# Formspree API endpoint
url = f"https://formspree.io/api/0/forms/{os.environ['FORMSPREE_FORM_HASHID']}/submissions"
headers = {
    "Authorization": f"Bearer {os.environ['FORMSPREE_API_KEY']}",
    "Accept": "application/json"
}

# Global variable for last submission
last_submission = None

def check_for_new_submissions():
    global last_submission
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        submissions = response.json()['submissions']
        if submissions:
            latest_submission = submissions[0]
            if last_submission and latest_submission['_date'] == last_submission['_date']:
                print("No new submissions.")
                return
            order_details = latest_submission.get('order_details')
            if order_details:
                print("New order received!")
                #print the type of orer_details and its contents for debugging
                print(type(order_details))
                print(order_details)
                # clean up order details, it should only have a single bracket content. take all the content between the last two  [] brackets
                order_details = '[' + order_details[order_details.rfind("[")+1:order_details.rfind("]")] + ']'
                print("Cleaned up order details:")
                print(order_details)
                print(json.dumps(json.loads(order_details), indent=2))
                
                # Create order in Square
                payment_link = create_square_order_and_get_payment_link(order_details, latest_submission.get('email'))
                if payment_link:
                    print(f"Payment link created: {payment_link}")
                else:
                    print("Failed to create payment link")

                # Update last_submission
                last_submission = latest_submission
            else:
                print("No order details in the latest submission.")
        else:
            print("No submissions found.")
    else:
        print(f"Error: {response.status_code}")

def main():
    global last_submission
    # Get current submissions to set last_submission
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        submissions = response.json()['submissions']
        if submissions:
            last_submission = submissions[0]
        else:
            print("No submissions found.")
    else:
        print(f"Error: {response.status_code}")
        return

    while True:
        check_for_new_submissions()
        time.sleep(5)  # Wait for 5 seconds before checking again

if __name__ == "__main__":
    main()
