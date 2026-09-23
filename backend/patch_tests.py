import re

# Fix test_students.py
with open('tests/test_students.py', 'r') as f:
    content = f.read()

content = content.replace('headers=headers', '')
content = content.replace('"first_name": "Test",', '"student_identifier": "STU1001", "first_name": "Test",')

with open('tests/test_students.py', 'w') as f:
    f.write(content)
