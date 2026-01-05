# ML Service (CICIDS)

This folder provides a small inference API that loads the models trained in:
- `../../cicids_binary.ipynb`
- `../../cicids_multiclass.ipynb`

## 1) Put your trained artifacts here

After running the notebooks, copy the generated files into:

- `ml_service/models/random_forest_cicids.pkl`
- `ml_service/models/scaler_cicids.pkl`
- `ml_service/models/rf_multiclass_cicids.pkl`
- `ml_service/models/scaler_multiclass_cicids.pkl`
- `ml_service/models/label_encoder_cicids.pkl`

Optional (recommended): create `ml_service/models/feature_columns.json` containing the exact feature column order used during training.

### If you can't commit `.pkl` to GitHub (recommended for free hosting)

GitHub blocks files > 100MB. Large `.pkl` models should NOT be committed.

Instead, upload your model files somewhere with a public download URL (common choices for a demo):
- GitHub Releases (attach the `.pkl` as release assets)
- Google Drive direct download link

Then set these environment variables when deploying the ML service (e.g., on Render):
- `ML_BINARY_MODEL_URL`
- `ML_BINARY_SCALER_URL`
- `ML_MULTI_MODEL_URL`
- `ML_MULTI_SCALER_URL`
- `ML_MULTI_LABEL_ENCODER_URL`
- `ML_FEATURE_COLUMNS_URL` (optional)

The service will download missing artifacts into `ml_service/models/` at startup.

## 2) Install + run

From `cybersecurity-log-analysis-platform/`:

- `python -m venv .venv`
- `./.venv/Scripts/pip install -r ml_service/requirements.txt`
- `./.venv/Scripts/python -m uvicorn ml_service.app:app --host 0.0.0.0 --port 8000`

Health check: `http://localhost:8000/health`

## 3) API

- `POST /predict` accepts:

```json
{
  "features": {
    "dst_port": 80,
    "flow_duration": 123456,
    "tot_fwd_pkts": 10
  },
  "mode": "multiclass"
}
```

`features` must contain all CICIDS feature columns (78 columns in your notebook after dropping labels). The service will return a clear error listing missing columns if any are absent.
