from square.http.auth.o_auth_2 import BearerAuthCredentials
from square.client import Client
import os
import json
import uuid

"""
    Create a client    
"""

client = Client(
    bearer_auth_credentials=BearerAuthCredentials(
        access_token=os.environ['SQUARE_ACCESS_TOKEN']
    ),
    environment='sandbox')


def submit_to_square(order_details):
    # Format order details for Square
    line_items = [
        {
            "name": item["name"],
            "quantity": str(item["quantity"]),
            "base_price_money": {
                "amount": int(item["price"] * 100),  # Convert to cents
                "currency": "USD"
            }
        } for item in order_details["items"]
    ]

    # Create order in Square
    result = client.orders.create_order(
        body = {
            "order": {
                "location_id": os.environ['SQUARE_LOCATION_ID'],
                "line_items": line_items
            }
        }
    )

    if result.is_success():
        print(f"Order created successfully: {result.body}")
    else:
        print(f"Error creating order: {result.errors}")

def create_square_order_and_get_payment_link(order_details, customer_email):
    # Parse the order_details JSON string if it's not already a dictionary
    if isinstance(order_details, str):
        order_details = json.loads(order_details)

    # Format order details for Square
    line_items = []
    for pose in order_details:
        for print_type, quantity in pose['prints'].items():
            price = get_price_for_print(print_type)  # You need to implement this function
            line_items.append({
                "name": f"Pose {pose['poseNumber']} - {print_type}",
                "quantity": str(quantity),
                "base_price_money": {
                    "amount": int(price * 100),  # Convert to cents
                    "currency": "USD"
                }
            })

    """
        Create a payment link
    """

    result = client.checkout.create_payment_link(
    body = {
        "order": {
        "location_id": os.environ['SQUARE_LOCATION_ID'],
        "line_items": line_items
        # [
        #     {
        #     "name": "Photo Package ",
        #     "quantity": "2",
        #     "note": "1 - 8x10 2 - 5x7 4 - 2x3",
        #     "base_price_money": {
        #         "amount": 35*100,
        #         "currency": "USD"
        #     }
        #     },
        #     {
        #     "name": "11x14 print",
        #     "quantity": "1",
        #     "note": "group of 5 people",
        #     "base_price_money": {
        #         "amount": 35*100,
        #         "currency": "USD"
        #     }
        #     }
        # ]
        },
        "checkout_options": {
        "allow_tipping": False,
        "ask_for_shipping_address": True,
        "accepted_payment_methods": {
            "apple_pay": True,
            "google_pay": True,
            "cash_app_pay": True,
            "afterpay_clearpay": True
        },
        },
        # "pre_populated_data": {
        # "buyer_email": "alex51195@gmail.com",
        # "buyer_phone_number": "19155881690",
        # "buyer_address": {
        #     "address_line_1": "8771 Plains Dr",
        #     # "address_line_2": "2",
        #     # "address_line_3": "3",
        #     "postal_code": "79907",
        #     "country": "US",
        #     "first_name": "Alexandro",
        #     "last_name": "Arnal"
        # }
        # }
    }
    )

    if result.is_success():
        print("Payment link created successfully")
        # print formatted with indents for better readability
        text = json.dumps(result.body, indent=4)
        print(text)
        return result.body['payment_link']['long_url']
    elif result.is_error():
        print("Errors occurred while creating payment link:")
        print(result.errors)
        return None
    # # Create order in Square
    # order_result = client.orders.create_order(
    #     body = {
    #         "order": {
    #             "location_id": "62A8XEQ52V2HD",
    #             "line_items": line_items
    #         }
    #     }
    # )

    # if order_result.is_success():
    #     order_id = order_result.body['order']['id']
        
    #     # Generate payment link
    #     payment_link_result = client.checkout.create_payment_link(
    #         body = {
    #             "order_id": order_id,
    #             "checkout_options": {
    #                 "allow_tipping": False,
    #                 "redirect_url": "https://yourwebsite.com/thank-you",
    #                 "ask_for_shipping_address": False
    #             }
    #         }
    #     )

    #     if payment_link_result.is_success():
    #         payment_link = payment_link_result.body['payment_link']['url']
    #         print(f"Payment link created: {payment_link}")
    #         return payment_link
    #     else:
    #         print(f"Error creating payment link: {payment_link_result.errors}")
    # else:
    #     print(f"Error creating order: {order_result.errors}")
    

# You need to implement this function to return the price for each print type
def get_price_for_print(print_type):
    # Example prices, replace with your actual pricing
    prices = {
        "Print 2x3": 2.5,
        "Print 5x7": 10,
        "Print 8x10": 15,

        # Add other print types and prices here
    }
    return prices.get(print_type, 0)  # Return 0 if print type not found

# # Use this in your main loop
# if new_order:
#     payment_link = create_square_order_and_get_payment_link(parse_order_details(new_order), customer_email)
#     if payment_link:
#         print(f"Payment link created: {payment_link}")
#     else:
#         print("Failed to create payment link")
