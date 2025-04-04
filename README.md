# Expense Tracker

Full-stack expense tracking application with React frontend and .NET backend.

## Project Structure

### Frontend (ClientApp/)
- `/api/`: Axios/Fetch wrappers for backend calls
- `/contexts/`: Global state management
- `/hooks/`: Custom React hooks
- `/pages/`: Application routes

### Backend (API/)
- `/Models/Entities/`: PostgreSQL entity classes
- `/Services/`: Business logic layer
- `/Migrations/`: EF Core migrations

### Additional Directories
- `/docker/`: Docker configurations
- `/kubernetes/`: Kubernetes deployments
- `/scripts/importers/`: Bank statement parsers

## Database Architecture

### PostgreSQL
- User accounts and authentication
- Transaction records
- Categories and budgets

### MongoDB
- Raw bank statements
- Processing logs
- Analytics data
- User preferences

