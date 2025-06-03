# Telecom Mission Control API Documentation

## Overview

The Telecom Mission Control API provides a comprehensive interface for managing enterprise telecommunications infrastructure, with a focus on device management, tower operations, and policy enforcement.

## Authentication

All API requests require JWT authentication with role-based access control.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Authentication Endpoints

#### Login

```http
POST /auth/login
{
  "email": string,
  "password": string
}
```

Response:

```json
{
  "accessToken": string,
  "refreshToken": string,
  "expiresIn": number,
  "user": {
    "id": string,
    "email": string,
    "role": UserRole,
    "enterpriseId": string,
    "enterpriseName": string,
    "subscriptionTier": SubscriptionTier
  }
}
```

## Core Endpoints

### Enterprises

#### List Enterprises

```http
GET /enterprises
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- sort: "name" | "createdAt" | "tier" (default: "name")
- order: "asc" | "desc" (default: "asc")
- tier: EnterpriseTier[]
- subscriptionTier: SubscriptionTier[]
```

#### Get Enterprise Details

```http
GET /enterprises/{enterpriseId}
```

Response includes:

- Enterprise details
- Subscription information
- Metrics
- Connected devices count
- Active policies count
- Connected towers count

#### Update Enterprise

```http
PATCH /enterprises/{enterpriseId}
{
  "name": string,
  "contactEmail": string,
  "contactPhone": string,
  "address": {
    "street": string,
    "city": string,
    "state": string,
    "country": string,
    "zipCode": string
  }
}
```

### Devices

#### List Devices

```http
GET /enterprises/{enterpriseId}/devices
Query Parameters:
- status: DeviceStatus[]
- type: DeviceType[]
- os: OperatingSystem[]
- carrier: Carrier[]
- page: number
- limit: number
- sort: "name" | "lastSeen" | "status"
- order: "asc" | "desc"
```

#### Get Device Details

```http
GET /devices/{deviceId}
```

Response includes:

- Device information
- Security status
- Policy violations
- Connected tower
- App usage statistics

#### Update Device Status

```http
PATCH /devices/{deviceId}/status
{
  "status": DeviceStatus,
  "reason": string
}
```

#### Bulk Device Operations

```http
POST /enterprises/{enterpriseId}/devices/bulk
{
  "operation": "update" | "quarantine" | "approve",
  "devices": [
    {
      "id": string,
      "status": DeviceStatus,
      "reason": string
    }
  ]
}
```

### Towers

#### List Towers

```http
GET /enterprises/{enterpriseId}/towers
Query Parameters:
- status: TowerStatus[]
- carrier: Carrier[]
- location: {
    lat: number,
    lng: number,
    radius: number
  }
- realEstateProvider: RealEstateProvider[]
```

#### Get Tower Details

```http
GET /towers/{towerId}
```

Response includes:

- Tower information
- Carrier configurations
- Equipment status
- Connected devices
- Policy enforcement status
- Discovery settings

#### Update Tower Status

```http
PATCH /towers/{towerId}/status
{
  "status": TowerStatus,
  "maintenanceNotes": string
}
```

### Policies

#### List Policies

```http
GET /enterprises/{enterpriseId}/policies
Query Parameters:
- status: "active" | "inactive"
- priority: PolicyPriority[]
- page: number
- limit: number
```

#### Create Policy

```http
POST /enterprises/{enterpriseId}/policies
{
  "name": string,
  "description": string,
  "priority": PolicyPriority,
  "rules": {
    "appId": string,
    "actions": {
      "actionId": string,
      "allowedRoles": UserRole[],
      "conditions": {
        "deviceTypes": DeviceType[],
        "operatingSystems": OperatingSystem[],
        "carriers": Carrier[],
        "timeRestrictions": {
          "start": string,
          "end": string,
          "days": number[]
        },
        "locationRestrictions": {
          "towers": string[],
          "radius": number
        }
      }
    }[]
  }[]
}
```

### Apps and Usage

#### List Apps

```http
GET /enterprises/{enterpriseId}/apps
Query Parameters:
- category: AppCategory[]
- vendor: string[]
- page: number
- limit: number
```

#### Get App Usage

```http
GET /enterprises/{enterpriseId}/apps/{appId}/usage
Query Parameters:
- startDate: string
- endDate: string
- interval: "hour" | "day" | "week" | "month"
```

## Metrics and Analytics

### Enterprise Metrics

```http
GET /enterprises/{enterpriseId}/metrics
Query Parameters:
- startDate: string
- endDate: string
- interval: "hour" | "day" | "week" | "month"
```

Response includes:

- Device metrics
- Policy enforcement stats
- Tower status
- Security incidents
- App usage statistics

### Dashboard Metrics

```http
GET /dashboard/metrics
```

Response includes:

- Enterprise counts by subscription
- Device statistics
- Tower status
- Policy enforcement
- Security alerts

### Event Types

- device.status_changed
- tower.status_changed
- policy.violation
- enterprise.subscription_updated
- app.usage_violation
- security.incident

## Rate Limiting

### Global Rate Limits

- 100 requests per minute per IP address
- 1000 requests per hour per IP address
- 10000 requests per day per IP address

### Endpoint-Specific Limits

- Authentication endpoints: 10 requests per minute per IP
- Device discovery: 50 requests per minute per enterprise
- Tower operations: 30 requests per minute per enterprise
- Policy enforcement: 100 requests per minute per enterprise
- Metrics and analytics: 60 requests per minute per enterprise

### Concurrent Request Limits

- Maximum 50 concurrent requests per enterprise
- Maximum 10 concurrent WebSocket connections per enterprise
- Maximum 5 concurrent bulk operations per enterprise

### Rate Limit Headers

```
X-RateLimit-Limit: <requests_per_window>
X-RateLimit-Remaining: <remaining_requests>
X-RateLimit-Reset: <reset_timestamp>
```

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": number,
      "remaining": number,
      "reset": string,
      "retryAfter": number
    }
  }
}
```

### Rate Limit Bypass

- Internal services can bypass rate limits using service tokens
- Emergency operations can request temporary limit increases
- Webhook endpoints have separate rate limits

## Caching Strategy

1. **Response Caching**

   - GET requests: 5 minutes
   - Enterprise details: 15 minutes
   - Device status: 1 minute
   - Tower status: 1 minute
   - Policy rules: 5 minutes
   - App usage: 15 minutes

2. **Cache Invalidation**
   - On POST/PUT/PATCH/DELETE
   - Manual invalidation via webhook
   - Time-based expiration

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": string,
    "message": string,
    "details": object,
    "timestamp": string,
    "requestId": string
  }
}
```

## Security

### API Keys

- Required for webhook endpoints
- Rate limiting per key
- Key rotation every 90 days

### CORS

```json
{
  "origin": ["https://app.toweriq.com"],
  "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
  "allowedHeaders": ["Authorization", "Content-Type"],
  "maxAge": 86400
}
```

### Data Validation

- Input sanitization
- Schema validation
- Rate limiting
- Request size limits

## Versioning

- URL-based versioning (/v1/)
- Deprecation notices 6 months in advance
- Backward compatibility for 2 versions

# API Model

## Authentication

### Endpoints

```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/me
```

### Request/Response Models

```typescript
interface LoginRequest {
  email: string;
  password: string;
  enterpriseId?: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  enterprise: Enterprise;
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  enterpriseId: string;
  permissions: string[];
}
```

## Enterprise Management

### Endpoints

```
GET /api/enterprises
POST /api/enterprises
GET /api/enterprises/{id}
PUT /api/enterprises/{id}
DELETE /api/enterprises/{id}
```

### Request/Response Models

```typescript
interface Enterprise {
  id: string;
  name: string;
  tier: EnterpriseTier;
  contactEmail: string;
  contactPhone: string;
  address: Address;
  subscription: Subscription;
  metrics: EnterpriseMetrics;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Subscription {
  startDate: string;
  endDate: string;
  status: "active" | "suspended" | "cancelled";
  tier: SubscriptionTier;
}

interface EnterpriseMetrics {
  deviceCount: number;
  policyCount: number;
  towerCount: number;
  securityScore: number;
}
```

## Tower Management

### Endpoints

```
GET /api/towers
POST /api/towers
GET /api/towers/{id}
PUT /api/towers/{id}
GET /api/towers/{id}/coverage
```

### Request/Response Models

```typescript
interface Tower {
  id: string;
  name: string;
  status: TowerStatus;
  location: Location;
  carriers: Carrier[];
  realEstateProvider: RealEstateProvider;
  coverage: Coverage;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface Coverage {
  radius: number;
  signalStrength: number;
}
```

## Device Management

### Endpoints

```
GET /api/devices
POST /api/devices
GET /api/devices/{id}
PUT /api/devices/{id}
GET /api/devices/{id}/status
```

### Request/Response Models

```typescript
interface Device {
  id: string;
  name: string;
  type: DeviceType;
  os: OperatingSystem;
  carrier: Carrier;
  status: DeviceStatus;
  location: Location;
  securityStatus: SecurityStatus;
}

interface SecurityStatus {
  isCompliant: boolean;
  vulnerabilities: number;
  securityScore: number;
}
```

## Policy Management

### Endpoints

```
GET /api/policies
POST /api/policies
GET /api/policies/{id}
PUT /api/policies/{id}
DELETE /api/policies/{id}
```

### Request/Response Models

```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  priority: PolicyPriority;
  rules: PolicyRule[];
  status: "active" | "inactive";
}

interface PolicyRule {
  appId: string;
  action: PolicyAction;
  conditions: PolicyCondition;
}

interface PolicyCondition {
  deviceTypes?: DeviceType[];
  operatingSystems?: OperatingSystem[];
  carriers?: Carrier[];
}
```

## Carrier Integration

### Endpoints

```
GET /api/carrier-integrations
POST /api/carrier-integrations
GET /api/carrier-integrations/{id}
PUT /api/carrier-integrations/{id}
```

### Request/Response Models

```typescript
interface CarrierIntegration {
  id: string;
  carrierId: string;
  enterpriseId: string;
  status: "active" | "inactive";
  integrationType: "direct" | "api";
  credentials: {
    apiKey: string;
    endpoints: {
      base: string;
      coverage: string;
    };
  };
  coverage: {
    totalTowers: number;
    activeTowers: number;
    coverageArea: {
      type: "polygon" | "radius";
      coordinates: number[][];
      radius?: number;
    };
  };
  lastSync: string;
}
```

## WebSocket Events

### Event Types

```typescript
interface DeviceEvent {
  type: "status_change" | "policy_violation";
  deviceId: string;
  data: any;
  timestamp: string;
}

interface TowerEvent {
  type: "status_change" | "coverage_update";
  towerId: string;
  data: any;
  timestamp: string;
}

interface PolicyEvent {
  type: "violation" | "enforcement";
  policyId: string;
  data: any;
  timestamp: string;
}
```

## Error Responses

### Error Model

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
```
