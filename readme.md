# Contact Identification Service

This service is designed to identify and reconcile contact information using a PostgreSQL database. It exposes an endpoint `/identify` on port 4000 to manage primary and secondary contacts based on email and phone number.

## Prerequisites

- Node.js (version 14.x or higher)
- PostgreSQL (version 10.x or higher)

## Running the Application

The application will run on the following URLs:
- `https://54.254.162.138:4000`
- `https://18.142.128.26:4000`
- `https://13.228.225.19:4000`

## API Endpoint

### `/identify`

#### Method: POST

#### Description

Identifies and reconciles contacts based on the provided email and/or phone number.

#### Request Body

- `email` (string, optional): The email of the contact.
- `phoneNumber` (string, optional): The phone number of the contact.

At least one of `email` or `phoneNumber` must be provided.

#### Response

- `primaryContactId` (integer): The ID of the primary contact.
- `emails` (array of strings): The list of associated emails.
- `phoneNumbers` (array of strings): The list of associated phone numbers.
- `secondaryContactIds` (array of integers): The list of IDs of secondary contacts.

#### Example Request

```bash
curl -X POST https://13.228.225.19:4000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
