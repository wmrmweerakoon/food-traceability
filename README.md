# Food Traceability Application

A comprehensive food traceability system that tracks products from farm to consumer, ensuring transparency and accountability throughout the supply chain.

## Features

- **Multi-role System**: Supports Farmers, Distributors, Retailers, and Consumers
- **Product Batch Tracking**: Create and manage product batches with QR codes
- **Transport Management**: Track shipments with real-time location updates
- **Inventory Management**: Retailers can manage store inventory
- **Consumer Traceability**: Consumers can scan QR codes to view product history
- **Interactive Maps**: Uses Leaflet for map visualization (no API keys required)
- **RESTful API**: Well-structured API endpoints for all operations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **geolib** for distance calculations
- **QRCode** for QR code generation
- **bcryptjs** for password hashing

### Frontend
- **React** 19 with Vite
- **React Router** for navigation
- **Leaflet & React-Leaflet** for maps
- **Tailwind CSS** for styling
- **Axios** for API calls

## Project Structure

```
food-traceability-app/
├── backend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── farmer/          # Farmer routes and controllers
│   │   │   ├── distributor/     # Distributor routes and controllers
│   │   │   ├── retailer/        # Retailer routes and controllers
│   │   │   └── consumer/         # Consumer routes and controllers
│   │   ├── config/
│   │   │   └── db.js            # Database configuration
│   │   ├── middleware/
│   │   │   └── auth.js          # Authentication middleware
│   │   ├── models/              # MongoDB models
│   │   └── app.js               # Express app setup
│   └── server.js                # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── App.jsx              # Main app component
│   └── package.json
└── package.json                 # Root dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wmrmweerakoon/food-traceability.git
cd food-traceability
```

2. Install root dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/food-traceability
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## API Documentation

This project uses **Postman** for API testing and documentation. Import the API endpoints into Postman to test and document the API.

### Main API Endpoints

- `/api/farmer/*` - Farmer operations (batch creation, management)
- `/api/distributor/*` - Distributor operations (transport management)
- `/api/retailer/*` - Retailer operations (inventory management)
- `/api/consumer/*` - Consumer operations (product traceability)

All endpoints require JWT authentication except for registration/login endpoints.

## Map Integration

The application uses **Leaflet** for map visualization. Example usage:

```jsx
import MapExample from './components/MapExample';

<MapExample 
  origin={{ lat: 40.7128, lng: -74.0060 }} 
  destination={{ lat: 40.7589, lng: -73.9851 }}
/>
```

## Key Features

### Distance Calculation
- Uses `geolib` library for coordinate-based distance calculations
- No external API keys required
- Calculates distance and estimated travel time

### Authentication
- JWT-based authentication
- Role-based access control (Farmer, Distributor, Retailer, Consumer, Admin)

### QR Code Generation
- Automatic QR code generation for product batches
- Consumers can scan QR codes to view full product history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

[Your Name]

## Acknowledgments

- Leaflet for open-source mapping
- OpenStreetMap for map tiles
- MongoDB for database
- React team for the amazing framework

