# LeftoverLink API (FastAPI Backend)

Backend API for the LeftoverLink PWA, implemented with FastAPI, SQLAlchemy (async), and SQLite.

## Setup

```bash
cd server
python -m pip install -r requirements.txt
```

## Run

```bash
# From server folder
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API runs at **http://localhost:8000**

- Swagger docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment

Create `.env` in the server folder to override:

```
DATABASE_URL=sqlite+aiosqlite:///./leftoverlink.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DEBUG=false
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register/donor` | Register donor (JSON body) |
| POST | `/auth/register/volunteer` | Register volunteer |
| POST | `/auth/login` | Login (returns token + user) |
| GET | `/auth/me` | Get current user (Bearer token) |
| POST | `/auth/logout` | Logout (client discards token) |

### Donations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/donations` | List donations (query: q, category, status) |
| GET | `/donations/{id}` | Get single donation |
| POST | `/donations` | Create donation |
| POST | `/donations/{id}/accept` | Accept pickup (volunteer body) |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks?volunteer_id=X` | List tasks for volunteer |
| GET | `/tasks/{id}` | Get single task |
| PATCH | `/tasks/{id}/advance` | Advance task step |
| PATCH | `/tasks/{id}/checklist` | Update checklist |

### Demo
| Method | Path | Description |
|--------|------|-------------|
| POST | `/demo/reset` | Reset donations + tasks |
| POST | `/auth/reset-demo` | Reset users |

## Request/Response Format

The API expects **camelCase** in JSON bodies for compatibility with the frontend:

- **Donor register**: `{ username, password, fullName, phone, organization?, aadhaarLast4?, aadhaarConsent, idFrontImage?, idBackImage? }`
- **Volunteer register**: `{ username, password, fullName, phone, city?, hasVehicle? }`
- **Login**: `{ username, password }`
- **Create donation**: `{ donorName, donorPhoneMasked, pickupBy, category, servingsEstimate, items, pickupLocation, notes?, dietaryTags? }`
- **Accept pickup**: `{ volunteerId, volunteerName, volunteerPhoneMasked }` or `{ id, name, phoneMasked }`

Responses use camelCase as well (e.g. `donorName`, `createdAt`, `pickupBy`).
