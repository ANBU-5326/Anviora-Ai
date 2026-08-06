import sys
import os

# Redirect `backend.app` to `app` when uvicorn is invoked as `backend.app.main:app` inside backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    import app
    sys.modules['backend.app'] = app
except ImportError:
    pass
