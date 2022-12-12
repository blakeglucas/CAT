try { Set-Location py } catch {}
python -m virtualenv venv
.\venv\Scripts\activate
pip install -r requirements.txt
deactivate