# Backend

A lightweight REST API built using FastAPI to serve Lock Genius's frontend. It allows users to store and manage their login credentials securely.

## Prerequisites

Before running the application, make sure you have the following installed:

- Python 3.11
- Pipenv (or Pyenv or similar)
- Docker
- Docker Compose

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/iguit0/lock-genius.git
    cd lock-genius
    ```

2. Build and run the Docker containers:

    ```bash
    docker-compose up --build
    ```

3. The API will be accessible at `http://localhost:8000`.

## Configuration

1. Create a virtual environment

```shell
    make build-venv
```

2. Activate the virtual environment

```shell
    source venv/bin/activate
```

3. Configure env file

```shell
    make load-env
```

4. Install dependencies

```shell
    make requirements-dev 
```

### Linting

Run lint and type checkers to reformat files before commit

```shell
    make lint
```

### Running

```shell
    make run-dev
```

To open documentation navigate to `http://localhost:8000/docs`

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/). Refer to the [LICENSE](../LICENSE) file for more information.