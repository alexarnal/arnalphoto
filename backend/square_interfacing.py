from square.http.auth.o_auth_2 import BearerAuthCredentials
from square.client import Client
import os
import json
import uuid
import logging
from logging.handlers import RotatingFileHandler

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Setup file handler
file_handler = RotatingFileHandler(
    'logs/square_app.log',
    maxBytes=1024 * 1024,  # 1MB
    backupCount=5
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Setup logging config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        file_handler,
        logging.StreamHandler()  # This will still print to console
    ]
)
logger = logging.getLogger(__name__)

"""
    Create a client    
"""

client = Client(
    bearer_auth_credentials=BearerAuthCredentials(
        access_token=os.environ['SQUARE_ACCESS_TOKEN']
    ),
    environment='production')


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
        logger.info(f"Order created successfully: {result.body}")
    else:
        logger.error(f"Error creating order: {result.errors}")

def create_square_order_and_get_payment_link(order_details):
    try:
        # Parse the order_details JSON string if it's not already a dictionary
        if isinstance(order_details, str):
            order_details = json.loads(order_details)
        
        # Log the incoming order details for debugging
        logger.info(f"Processing order details: {json.dumps(order_details, indent=2)}")

        # Check if we have the new order structure with shipping info
        if 'poses' in order_details:
            poses = order_details['poses']
            shipping_info = order_details.get('shipping', {'cost': 0, 'applied': False})
        else:
            # If using old format, assume it's just the poses array
            poses = order_details
            shipping_info = {'cost': 0, 'applied': False}

        logger.info(f"Found {len(poses)} poses to process")
        logger.info(f"Shipping info: {shipping_info}")

        # Format order details for Square
        line_items = []
        
        for pose_index, pose in enumerate(poses):
            logger.info(f"Processing pose {pose_index + 1}: {pose}")
            
            # Add the prints to the order
            for print_type, quantity in pose['prints'].items():
                # Clean up the print type name (remove extra whitespace and badges)
                clean_print_type = print_type.strip()
                
                # Remove any badge text like "MOST POPULAR"
                if "MOST POPULAR" in clean_print_type:
                    clean_print_type = clean_print_type.replace("MOST POPULAR", "").strip()
                
                price = get_price_for_print(clean_print_type)
                if price == 0:
                    logger.error(f"Invalid print type or price not found: '{clean_print_type}' (original: '{print_type}')")
                    raise ValueError(f"Invalid print type or price not found: {clean_print_type}")
                
                logger.info(f"Adding line item: {clean_print_type} x{quantity} @ ${price}")
                
                line_items.append({
                    "name": f"Pose {pose['poseNumber']} - {clean_print_type}",
                    "quantity": str(quantity),
                    "base_price_money": {
                        "amount": int(price * 100),
                        "currency": "USD"
                    }
                })
            
            # Add pose type cost (only if there's actually a cost)
            cost_for_number_of_people = get_price_for_number_of_people(pose['poseType'])
            if cost_for_number_of_people > 0:  # Only add if there's a cost
                logger.info(f"Adding pose type cost: {pose['poseType']} @ ${cost_for_number_of_people}")
                line_items.append({
                    "name": f"Pose {pose['poseNumber']} - {pose['poseType']} people",
                    "quantity": "1",
                    "base_price_money": {
                        "amount": int(cost_for_number_of_people * 100),
                        "currency": "USD"
                    }
                })
            
            # Add description as a note (free item)
            if pose.get('description', '') != '':
                line_items.append({
                    "name": f'Pose {pose["poseNumber"]} Note - {pose["description"]}',
                    "quantity": "1",
                    "base_price_money": {
                        "amount": 0,
                        "currency": "USD"
                    }
                })

        # Add shipping charge if applicable
        if shipping_info['applied'] and shipping_info['cost'] > 0:
            logger.info(f"Adding shipping: ${shipping_info['cost']}")
            line_items.append({
                "name": "Shipping",
                "quantity": "1",
                "base_price_money": {
                    "amount": int(shipping_info['cost'] * 100),
                    "currency": "USD"
                }
            })

        logger.info(f"Final line items count: {len(line_items)}")
        logger.info(f"Line items: {json.dumps(line_items, indent=2)}")

        # Create the Square order
        result = client.checkout.create_payment_link(
            body = {
                "order": {
                    "location_id": os.environ['SQUARE_LOCATION_ID'],
                    "line_items": line_items
                },
                "checkout_options": {
                    "allow_tipping": False,
                    "ask_for_shipping_address": True,
                    "accepted_payment_methods": {
                        "apple_pay": True,
                        "google_pay": True,
                        "cash_app_pay": True,
                        "afterpay_clearpay": True
                    }
                }
            }
        )

        if result.is_success():
            logger.info("Payment link created successfully")
            return result.body['payment_link']['long_url']
        else:
            logger.error(f"Square API Error: {result.errors}")
            return None
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None

# You need to implement this function to return the price for each print type
def get_price_for_number_of_people(number_of_people):
    prices = {
        "1-3": 0,
        "4-6": 15,
        "7-10": 30
    }
    value = prices.get(number_of_people, 0)  # Return 0 if number of people not found
    if value==0: logger.info('unable to get price, returning price of 0 for number_of_people', number_of_people)
    return value

def get_price_for_print(print_type):
    prices = {
        # Individual prints
        "Print 2x3": 10,
        "Print 5x7": 10,
        "Print 8x10": 15,
        "Print 11x14": 35,
        "Print 16x20": 65,
        "Print 20x24": 95,
        "Print 30x40": 200,
        
        # Packages
        "Traditional Package": 40,
        "Showcase Package": 55,
        "Collection Package": 70,  # Fixed: was 75, should be 70
        
        # Group photos
        "Group Photo 5×7": 10,
        "Group Photo 8×10": 15,
        "Group Photo 11×14": 35,
        
        # Digital
        "Digital Download": 35,
    }
    value = prices.get(print_type, 0)
    if value == 0: 
        logger.warning(f'Unable to get price, returning price of 0 for print_type: "{print_type}"')
    return value
# # Use this in your main loop
# if new_order:
#     payment_link = create_square_order_and_get_payment_link(parse_order_details(new_order), customer_email)
#     if payment_link:
#         print(f"Payment link created: {payment_link}")
#     else:
#         print("Failed to create payment link")
