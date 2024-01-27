FROM python:3.10.5-slim


# Set the working directory in the container
WORKDIR /nutrisnap-backend

# Copy the dependencies file to the working directory
COPY pyproject.toml poetry.lock /nutrisnap-backend/
COPY requirements.txt requirements.txt


# Install Poetry
RUN pip install poetry

# Install dependencies
RUN poetry install 

RUN pip3 install -r requirements.txt

# Copy the Flask app code to the working directory
COPY nutrisnap /nutrisnap-backend

# Expose port 5000 to the outside world
EXPOSE 5000

# Command to run the Flask application
CMD ["python", "app.py"]
