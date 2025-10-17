# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Copuno - Gestión de Partes** is a modern web application for managing work reports (partes de trabajo) with a Notion backend. It features a React frontend with a Node.js/Express backend that integrates directly with the Notion API.

## Core Architecture

### Frontend (React + Vite)
- **Single Page Application**: All UI logic in `src/App.jsx` (~500 lines)
- **Component Structure**: Home screen, create/edit forms, data tables, and detail modals
- **Styling**: CSS Variables system in `src/App.css` with modern, minimalist design
- **State Management**: Local React state with API service layer
- **Build Tool**: Vite for development and production builds

### Backend (Node.js + Express)
- **Monolithic API**: Single `server.js` file (~700+ lines) handling all endpoints
- **Notion Integration**: Direct integration with Notion API using database IDs
- **Static Serving**: Express serves built React app in production
- **Security**: Helmet, CORS, rate limiting, and economic data sanitization
- **Caching**: In-memory TTL cache for catalog data (obras, empleados, jefes)

### Database Integration
- **Primary Database**: Notion API with 5 databases (obras, empleados, jefes, partes, detalles)
- **Mock Mode**: Can run with simulated data when `USE_MOCK_DATA=true`
- **Data Sanitization**: Automatically removes economic data from all API responses

## Development Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Create .env file (required)
echo "NOTION_TOKEN=your_notion_token_here" > .env
```

### Development Workflow
```bash
# Frontend development (with API proxy)
npm run dev  # Vite dev server on port 5173, proxies to 3001

# Production build and serve
npm run build    # Build frontend to dist/
npm run server   # Start production server on port 3001

# Preview production build
npm run preview  # Vite preview server
```

### Database and API Testing
```bash
# Explore Notion databases
npm run explore

# Test Notion connectivity
node scripts/test-notion-direct.js

# Health check
curl http://localhost:3001/api/health
```

### Common Development Tasks
```bash
# Create new parte (work report)
curl -X POST http://localhost:3001/api/partes-trabajo \
  -H "Content-Type: application/json" \
  -d '{"obraId": "obra-id", "fecha": "2024-01-15", "jefeObraId": "jefe-id"}'

# Update existing parte  
curl -X PUT http://localhost:3001/api/partes-trabajo/PARTE_ID \
  -H "Content-Type: application/json" \
  -d '{"obraId": "nueva-obra", "empleados": ["emp1"], "empleadosHoras": {"emp1": 8}}'

# Get parte details with employees
curl http://localhost:3001/api/partes-trabajo/PARTE_ID/detalles
```

## Key Implementation Details

### State Management and Business Logic
- **Editable States**: Only partes in states `borrador`, `en revisión`, `pendiente`, `listo para firmar` can be edited
- **Protected States**: `firmado`, `datos enviados`, `enviado` prevent any modifications
- **Employee Management**: Dynamic loading of employees based on selected obra (work site)
- **Hours Validation**: Individual hour tracking per employee with 0-24 hour range validation

### API Endpoints Structure
```
GET /api/health                           # System health check
GET /api/obras                            # List all work sites
GET /api/empleados                        # List all employees  
GET /api/jefes-obra                       # List all work site managers
GET /api/partes-trabajo                   # List work reports (with filters)
POST /api/partes-trabajo                  # Create new work report
PUT /api/partes-trabajo/:id               # Update work report
GET /api/partes-trabajo/:id/detalles      # Get full work report details
GET /api/obras/:obraId/empleados          # Get employees for specific obra
POST /api/partes-trabajo/:id/enviar-datos # Send data to webhook (Make.com)
```

### Data Flow Patterns
1. **Initial Load**: `getDatosCompletos()` fetches all catalog data (obras, empleados, jefes)
2. **Dynamic Loading**: Selecting obra triggers loading of specific employees
3. **Form Validation**: Real-time validation for required fields and business rules
4. **State Synchronization**: Server-sent events for real-time estado updates
5. **Error Handling**: Comprehensive error handling with user-friendly messages

### Environment Configuration
Required environment variables:
- `NOTION_TOKEN`: Notion integration token (required)
- `PORT`: Server port (default: 3001)
- `USE_MOCK_DATA`: Use simulated data instead of Notion (default: false)
- `ALLOWED_ORIGINS`: CORS origins (comma-separated)
- `PARTES_DATOS_WEBHOOK_URL`: Webhook URL for data export
- `CACHE_TTL_MS`: Cache TTL in milliseconds (default: 60000)

### Security and Performance Features
- **Rate Limiting**: Express rate limiter with configurable windows
- **Economic Data Sanitization**: Removes all financial/economic data from responses
- **CORS Configuration**: Configurable allowed origins for cross-origin requests
- **Request Tracking**: UUID-based request correlation with Morgan logging
- **Caching**: In-memory cache for frequently accessed catalog data

### Mock Data Support
The application can run in mock mode for development without Notion access:
- Set `USE_MOCK_DATA=true` or `NOTION_TOKEN=mock`
- Mock data simulates realistic Notion API responses
- All CRUD operations work with simulated data

## File Structure Importance

### Critical Files
- `server.js`: Core API logic, Notion integration, all endpoints
- `src/App.jsx`: Complete frontend application with all UI components
- `src/services/notionService.js`: Frontend API client
- `package.json`: Dependencies and scripts

### Configuration Files
- `.env`: Environment variables (create locally, never commit)
- `vite.config.js`: Frontend build configuration
- Documentation in `docs/` folder provides detailed technical information

### Scripts Directory
- `scripts/explore-notion-direct.js`: Interactive Notion database explorer
- `scripts/test-notion-direct.js`: Connectivity testing utility

## Testing Strategy

### Manual Testing Workflow
1. Verify health endpoint: `curl http://localhost:3001/api/health`
2. Test data loading: Check obras, empleados, jefes endpoints
3. Create parte workflow: Test form validation and submission
4. Edit parte workflow: Verify state validation and updates
5. Employee management: Test dynamic loading per obra

### Common Issues and Debugging
- **Missing NOTION_TOKEN**: Server will exit with error message
- **Notion connectivity**: Use `node scripts/test-notion-direct.js`
- **Port conflicts**: Check `lsof -i :3001` and kill if needed
- **Cache issues**: Restart server to clear in-memory cache
- **Mock mode**: Useful for development when Notion is unavailable

This application is production-ready with comprehensive error handling, security measures, and a complete feature set for work report management.