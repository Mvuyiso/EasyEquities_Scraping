# Easy Equities Investment Dashboard

A web application for tracking and visualizing your Easy Equities investments.

## Features

- View all your Easy Equities accounts in one place
- Track your investment holdings and their performance
- Analyze profit and loss across your portfolio
- View transaction history
- Interactive stock charts with TradingView integration
- Responsive design for desktop and mobile

## Project Structure

The project consists of two main parts:

1. **Frontend**: React application with Material UI
2. **Backend**: Django REST API that interfaces with the Easy Equities client library

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Easy Equities account credentials

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd easy-equities-web
```

### 2. Set up environment variables

Create a `.env` file in the root directory with your Easy Equities credentials:

```
EASYEQUITIES_USERNAME=your_username
EASYEQUITIES_PASSWORD=your_password
```

### 3. Backend Setup

```bash
# Navigate to the backend directory
cd backend-django

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install the Easy Equities client library
pip install -e ../..

# Run migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 4. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. The application will automatically connect to your Easy Equities account
3. Navigate through the different sections using the sidebar menu

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/accounts/` - List all accounts
- `GET /api/dashboard/:account_id/` - Get dashboard data for an account
- `GET /api/holdings/:account_id/` - Get holdings for an account
- `GET /api/transactions/:account_id/` - Get transactions for an account
- `GET /api/profit-loss/:account_id/` - Get profit/loss data for an account
- `GET /api/all-holdings/` - Get all holdings across all accounts
- `GET /api/historical-prices/:contract_code/:period/` - Get historical prices for an instrument

## License

This project is licensed under the MIT License - see the LICENSE file for details.