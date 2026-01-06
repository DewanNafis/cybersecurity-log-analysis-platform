from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, Literal, Optional, Tuple
from urllib.request import urlopen
import shutil

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = Path(os.environ.get("ML_MODELS_DIR", BASE_DIR / "models")).resolve()

BINARY_MODEL_PATH = Path(os.environ.get("ML_BINARY_MODEL", MODELS_DIR / "random_forest_cicids.pkl"))
BINARY_SCALER_PATH = Path(os.environ.get("ML_BINARY_SCALER", MODELS_DIR / "scaler_cicids.pkl"))

MULTI_MODEL_PATH = Path(os.environ.get("ML_MULTI_MODEL", MODELS_DIR / "rf_multiclass_cicids.pkl"))
MULTI_SCALER_PATH = Path(os.environ.get("ML_MULTI_SCALER", MODELS_DIR / "scaler_multiclass_cicids.pkl"))
MULTI_LABEL_ENCODER_PATH = Path(os.environ.get("ML_MULTI_LABEL_ENCODER", MODELS_DIR / "label_encoder_cicids.pkl"))

FEATURE_COLUMNS_PATH = Path(os.environ.get("ML_FEATURE_COLUMNS", MODELS_DIR / "feature_columns.json"))

ML_BINARY_MODEL_URL = os.environ.get("ML_BINARY_MODEL_URL")
ML_BINARY_SCALER_URL = os.environ.get("ML_BINARY_SCALER_URL")
ML_MULTI_MODEL_URL = os.environ.get("ML_MULTI_MODEL_URL")
ML_MULTI_SCALER_URL = os.environ.get("ML_MULTI_SCALER_URL")
ML_MULTI_LABEL_ENCODER_URL = os.environ.get("ML_MULTI_LABEL_ENCODER_URL")
ML_FEATURE_COLUMNS_URL = os.environ.get("ML_FEATURE_COLUMNS_URL")


class PredictRequest(BaseModel):
    mode: Literal["binary", "multiclass", "both"] = "both"
    features: Dict[str, float] = Field(..., description="CICIDS feature columns -> numeric values")


class PredictResponse(BaseModel):
    mode: str
    binary: Optional[Dict[str, Any]] = None
    multiclass: Optional[Dict[str, Any]] = None


def _load_feature_columns(
    scaler: Any | None,
) -> Optional[list[str]]:
    if FEATURE_COLUMNS_PATH.exists():
        try:
            return list(json.loads(FEATURE_COLUMNS_PATH.read_text(encoding="utf-8")))
        except Exception as e:
            raise RuntimeError(f"Failed to read feature columns from {FEATURE_COLUMNS_PATH}: {e}")

    if scaler is not None and hasattr(scaler, "feature_names_in_"):
        names = getattr(scaler, "feature_names_in_")
        if names is not None:
            return [str(x) for x in list(names)]

    return None


def _download_if_missing(dest: Path, url: Optional[str]) -> None:
    if dest.exists() or not url:
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    timeout_s = int(os.environ.get("ML_DOWNLOAD_TIMEOUT_SECONDS", "300"))
    tmp = dest.with_suffix(dest.suffix + ".tmp")
    try:
        # Stream to disk to avoid holding large .pkl files in memory.
        with urlopen(url, timeout=timeout_s) as r, tmp.open("wb") as f:
            shutil.copyfileobj(r, f, length=1024 * 1024)
        tmp.replace(dest)
    except Exception as e:
        try:
            if tmp.exists():
                tmp.unlink()
        except Exception:
            pass
        raise RuntimeError(f"Failed to download {dest.name} from {url}: {e}")


def _vectorize(features: Dict[str, float], feature_columns: list[str]) -> pd.DataFrame:
    missing = [c for c in feature_columns if c not in features]
    if missing:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Missing required features",
                "missing": missing,
                "expected_count": len(feature_columns),
                "provided_count": len(features),
            },
        )

    row = {c: float(features[c]) for c in feature_columns}
    return pd.DataFrame([row], columns=feature_columns)


def _proba_to_confidence(proba: Any) -> Tuple[float, int]:
    arr = np.asarray(proba)
    if arr.ndim == 1:
        # binary case: proba for class 1 only sometimes
        conf = float(np.max(arr))
        idx = int(np.argmax(arr))
        return conf, idx
    conf = float(np.max(arr, axis=1)[0])
    idx = int(np.argmax(arr, axis=1)[0])
    return conf, idx


app = FastAPI(title="CyberGuard ML Service", version="1.0.0")


# Lazy-loaded globals
_binary_model = None
_binary_scaler = None
_multi_model = None
_multi_scaler = None
_multi_le = None
_feature_columns = None


def _file_info(path: Path) -> Dict[str, Any]:
    try:
        exists = path.exists()
        size = path.stat().st_size if exists else None
        return {"path": str(path), "exists": exists, "size_bytes": size}
    except Exception as e:
        return {"path": str(path), "exists": False, "error": str(e)}


def _ensure_loaded() -> None:
    global _binary_model, _binary_scaler, _multi_model, _multi_scaler, _multi_le, _feature_columns

    # If running on free hosting, models may be provided via public URLs.
    _download_if_missing(BINARY_MODEL_PATH, ML_BINARY_MODEL_URL)
    _download_if_missing(BINARY_SCALER_PATH, ML_BINARY_SCALER_URL)
    _download_if_missing(MULTI_MODEL_PATH, ML_MULTI_MODEL_URL)
    _download_if_missing(MULTI_SCALER_PATH, ML_MULTI_SCALER_URL)
    _download_if_missing(MULTI_LABEL_ENCODER_PATH, ML_MULTI_LABEL_ENCODER_URL)
    _download_if_missing(FEATURE_COLUMNS_PATH, ML_FEATURE_COLUMNS_URL)

    if _binary_model is None and BINARY_MODEL_PATH.exists():
        _binary_model = joblib.load(BINARY_MODEL_PATH)
    if _binary_scaler is None and BINARY_SCALER_PATH.exists():
        _binary_scaler = joblib.load(BINARY_SCALER_PATH)

    if _multi_model is None and MULTI_MODEL_PATH.exists():
        _multi_model = joblib.load(MULTI_MODEL_PATH)
    if _multi_scaler is None and MULTI_SCALER_PATH.exists():
        _multi_scaler = joblib.load(MULTI_SCALER_PATH)
    if _multi_le is None and MULTI_LABEL_ENCODER_PATH.exists():
        _multi_le = joblib.load(MULTI_LABEL_ENCODER_PATH)

    if _feature_columns is None:
        # Prefer multiclass scaler if present; otherwise binary scaler.
        _feature_columns = _load_feature_columns(_multi_scaler or _binary_scaler)


@app.get("/health")
def health() -> Dict[str, Any]:
    from fastapi.responses import JSONResponse

    load_error: Optional[str] = None
    try:
        _ensure_loaded()
    except Exception as e:
        load_error = str(e)

    ok = load_error is None
    content: Dict[str, Any] = {
        "status": "ok" if ok else "error",
        "error": load_error,
        "models_dir": str(MODELS_DIR),
        "download_timeout_seconds": int(os.environ.get("ML_DOWNLOAD_TIMEOUT_SECONDS", "300")),
        "artifacts": {
            "binary_model": _file_info(BINARY_MODEL_PATH),
            "binary_scaler": _file_info(BINARY_SCALER_PATH),
            "multiclass_model": _file_info(MULTI_MODEL_PATH),
            "multiclass_scaler": _file_info(MULTI_SCALER_PATH),
            "label_encoder": _file_info(MULTI_LABEL_ENCODER_PATH),
            "feature_columns": _file_info(FEATURE_COLUMNS_PATH),
        },
        "env_urls_set": {
            "ML_BINARY_MODEL_URL": bool(ML_BINARY_MODEL_URL),
            "ML_BINARY_SCALER_URL": bool(ML_BINARY_SCALER_URL),
            "ML_MULTI_MODEL_URL": bool(ML_MULTI_MODEL_URL),
            "ML_MULTI_SCALER_URL": bool(ML_MULTI_SCALER_URL),
            "ML_MULTI_LABEL_ENCODER_URL": bool(ML_MULTI_LABEL_ENCODER_URL),
            "ML_FEATURE_COLUMNS_URL": bool(ML_FEATURE_COLUMNS_URL),
        },
        "binary_model_loaded": _binary_model is not None,
        "binary_scaler_loaded": _binary_scaler is not None,
        "multiclass_model_loaded": _multi_model is not None,
        "multiclass_scaler_loaded": _multi_scaler is not None,
        "label_encoder_loaded": _multi_le is not None,
        "feature_columns_known": _feature_columns is not None,
    }

    return JSONResponse(status_code=200 if ok else 503, content=content)


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    _ensure_loaded()

    if _feature_columns is None:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Feature column order not available",
                "hint": "Provide ml_service/models/feature_columns.json or use a newer scikit-learn scaler with feature_names_in_.",
            },
        )

    x_df = _vectorize(req.features, _feature_columns)

    out: Dict[str, Any] = {"mode": req.mode, "binary": None, "multiclass": None}

    if req.mode in ("binary", "both"):
        if _binary_model is None or _binary_scaler is None:
            raise HTTPException(status_code=500, detail={"error": "Binary model/scaler not loaded"})

        x_scaled = _binary_scaler.transform(x_df)
        pred = int(_binary_model.predict(x_scaled)[0])
        proba = None
        if hasattr(_binary_model, "predict_proba"):
            proba = _binary_model.predict_proba(x_scaled)[0].tolist()
            conf, idx = _proba_to_confidence([proba])
            conf = float(max(proba))
        else:
            conf = 1.0

        label = "ATTACK" if pred == 1 else "BENIGN"
        out["binary"] = {
            "prediction": pred,
            "label": label,
            "confidence": conf,
            "proba": proba,
        }

    if req.mode in ("multiclass", "both"):
        if _multi_model is None or _multi_scaler is None or _multi_le is None:
            raise HTTPException(status_code=500, detail={"error": "Multiclass model/scaler/label_encoder not loaded"})

        x_scaled = _multi_scaler.transform(x_df)
        class_id = int(_multi_model.predict(x_scaled)[0])
        label = str(_multi_le.inverse_transform([class_id])[0])

        confidence = 1.0
        top_k = None
        if hasattr(_multi_model, "predict_proba"):
            probs = _multi_model.predict_proba(x_scaled)[0]
            confidence = float(np.max(probs))
            # Top-3
            idxs = np.argsort(probs)[::-1][:3].tolist()
            top_k = [
                {
                    "class_id": int(i),
                    "label": str(_multi_le.inverse_transform([int(i)])[0]),
                    "prob": float(probs[int(i)]),
                }
                for i in idxs
            ]

        out["multiclass"] = {
            "class_id": class_id,
            "label": label,
            "confidence": confidence,
            "top_k": top_k,
        }

    return PredictResponse(**out)
