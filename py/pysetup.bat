@echo off
cd py
python -m virtualenv venv
.\venv\Scripts\activate
pip install -r requirements.txt
deactivate