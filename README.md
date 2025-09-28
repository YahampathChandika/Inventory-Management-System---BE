# Inventory Management System - Backend API

A robust NestJS-based backend API for inventory management with role-based access control, bulk email reporting, and comprehensive user management.

## 🏗️ **Tech Stack**

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Email Service**: Brevo (SendGrid alternative)
- **Validation**: class-validator & class-transformer
- **Security**: bcrypt, rate limiting, CORS

## 🚀 **Features**

### **Multi-Role Access Control**
- **Admin**: Full system access including user management
- **Manager**: Inventory management + email reporting to merchants
- **Viewer**: Read-only access to inventory data

### **Inventory Management**
- Create, read, update, delete inventory items
- Search and filter functionality
- Low stock alerts
- Comprehensive audit trail (created/updated by tracking)

### **User Management** (Admin only)
- Create and manage user accounts
- Enable/disable user access
- Role assignment and updates
- Profile management

### **Email Reporting System**
- Bulk inventory reports to merchants (up to 1000+ recipients)
- Individual email sending (no CC/BCC)
- Customizable email content and subjects
- Comprehensive email logging and status tracking
- Development mode with email simulation

### **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting protection
- Input validation and sanitization
- CORS configuration

## 📦 **Installation**

### **Prerequisites**
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### **Clone & Install**
```bash
git clone <https://github.com/YahampathChandika/Inventory-Management-System---BE>
cd inventory-management-backend
npm install
```

## ⚙️ **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=inventory_management

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRATION=24h

# Application Configuration
PORT=3001
NODE_ENV=development

# Brevo Email Configuration (Optional for development)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Inventory System

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### **Generate Secure JWT Secret**
```bash
# Generate a secure random string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄️ **Database Setup**

### **1. Create Database**
```sql
CREATE DATABASE inventory_management;
USE inventory_management;
```

### **2. Run Application (Auto-setup)**
The application automatically creates tables and seeds initial data on first run:

```bash
npm run start:dev
```

### **3. Default Test Users Created**
The system creates these test accounts automatically:

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Admin |
| manager@test.com | manager123 | Manager |
| viewer@test.com | viewer123 | Viewer |

## 🏃 **Running the Application**

### **Development Mode**
```bash
npm run start:dev
```
- Auto-restarts on file changes
- Database logging enabled
- Email simulation mode (no actual emails sent)

### **Production Mode**
```bash
npm run build
npm run start:prod
```

### **Debug Mode**
```bash
npm run start:debug
```

## 📡 **API Documentation**

### **Base URL**
```
http://localhost:3001/api/v1
```

### **Authentication**
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### **Key Endpoints**

#### **Authentication**
```http
POST /auth/login          # User login
GET  /auth/profile        # Get current user profile
PUT  /auth/profile        # Update profile
PUT  /auth/change-password # Change password
```

#### **User Management** (Admin only)
```http
GET    /users             # List all users with filters
GET    /users/:id         # Get specific user
POST   /users             # Create new user
PUT    /users/:id         # Update user
PATCH  /users/:id/status  # Enable/disable user
DELETE /users/:id         # Delete user
```

#### **Inventory Management**
```http
GET    /inventory         # List inventory (all roles)
GET    /inventory/:id     # Get specific item
POST   /inventory         # Create item (Manager+)
PUT    /inventory/:id     # Update item (Manager+)
PATCH  /inventory/:id/quantity # Update quantity only (Manager+)
DELETE /inventory/:id     # Delete item (Manager+)
```

#### **Merchants** (Manager+)
```http
GET  /merchants           # List merchants
POST /merchants           # Create merchant
POST /merchants/bulk-import # Bulk import from email list
PUT  /merchants/:id       # Update merchant
```

#### **Reports & Email** (Manager+)
```http
GET  /reports/inventory   # Get inventory report data
POST /reports/send-inventory # Send email reports
GET  /email-logs          # View email logs
```

#### **Utilities**
```http
GET /roles                # Get available roles
GET /health              # Health check
```

## 🔐 **User Roles & Permissions**

| Feature | Viewer | Manager | Admin |
|---------|--------|---------|-------|
| View Inventory | ✅ | ✅ | ✅ |
| Manage Inventory | ❌ | ✅ | ✅ |
| Manage Merchants | ❌ | ✅ | ✅ |
| Send Email Reports | ❌ | ✅ | ✅ |
| View Email Logs | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| System Administration | ❌ | ❌ | ✅ |

## 📧 **Email System**

### **Development Mode**
- Emails are simulated and logged to console
- No actual emails sent
- All functionality available for testing

### **Production Mode**
- Requires valid Brevo API key
- Sends real emails to recipients
- Individual sending (no CC/BCC as per requirements)
- Handles up to 1000+ recipients efficiently

### **Email Features**
- **Inventory Reports**: Two-column format (Item Name, Quantity)
- **Custom Messages**: Add personalized content
- **Bulk Processing**: Queue-based email sending
- **Status Tracking**: Sent, Failed, Pending statuses
- **Retry Logic**: Failed emails are retried automatically

## 🧪 **Testing**

### **Run Tests**
```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### **Manual Testing**
Use the seeded test accounts to verify functionality:
1. Login with different role accounts
2. Test role-based access restrictions
3. Verify inventory CRUD operations
4. Test email functionality in development mode

## 🔧 **Development**

### **Code Formatting**
```bash
npm run format     # Format code with Prettier
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

### **Database Management**
- **Auto-Migration**: Tables created automatically in development
- **Seeding**: Default roles and test users created on startup
- **Synchronize**: Disabled in production (use migrations)

### **Debugging**
- Enable TypeORM logging in development
- Comprehensive error handling with proper HTTP status codes
- Request/response logging available

## 🚀 **Production Deployment**

### **Environment Preparation**
1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong JWT secret
4. Configure Brevo for email sending
5. Set proper CORS origins

### **Build & Deploy**
```bash
npm run build
npm run start:prod
```

### **Security Checklist**
- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (reverse proxy)
- [ ] Environment variables secured

### **Performance Optimization**
- Database connection pooling (10 connections)
- Query optimization with proper indexes
- Email queue processing for bulk operations
- Caching for frequent queries

## 📊 **Monitoring & Logging**

### **Application Logs**
- Authentication attempts and failures
- Database operations
- Email sending status
- Error tracking and stack traces

### **Health Monitoring**
```http
GET /api/v1/health
```
Returns application status and database connectivity.

## 🛠️ **API Response Format**

All API responses follow a consistent format:

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid"
      }
    ]
  }
}
```

## 🔍 **Common Issues & Solutions**

### **Database Connection Issues**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### **Authentication Issues**
- Verify JWT secret is set
- Check token expiration
- Ensure user account is active

### **Email Issues**
- Development: Check console logs for simulated emails
- Production: Verify Brevo API key and sender email

## 📝 **License**

This project is developed for Empite Solutions as part of a technical assessment.

## 🤝 **Support**

For technical questions or issues:
1. Check the error logs in the console
2. Verify environment configuration
3. Test with provided seed accounts
4. Review API documentation above

---