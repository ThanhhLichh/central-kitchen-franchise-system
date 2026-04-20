from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

SECRET_KEY = "Day_La_Chia_Khoa_Bi_Mat_Cua_He_Thong_Franchise_2026_@!#"
ALGORITHM = "HS256"
ISSUER = "AuthService"
AUDIENCE = "FranchiseSystem"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=ISSUER,
            audience=AUDIENCE
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")