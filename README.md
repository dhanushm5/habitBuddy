# HabitBuddy

HabitBuddy is an application designed to help you build and maintain good habits. Track daily activities, set goals, and monitor progress over time.
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Detailed Installation Guide](#detailed-installation-guide)
    - [Prerequisites](#prerequisites)
    - [Steps to Install](#steps-to-install)
    - [Building for Production](#building-for-production)
    - [Running Tests](#running-tests)
    - [Troubleshooting](#troubleshooting)

## Features

- Add and manage habits
- Set personal goals
- View progress with charts
- Receive reminders and notifications

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/habitbuddy.git
```

Navigate to the project directory:

```bash
cd habitbuddy
```

Install dependencies:

```bash
npm install
```

## Usage

Start the application:

```bash
npm start
```

Access the app at `http://localhost:3000` in a web browser.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
## Detailed Installation Guide

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher): [Download Node.js](https://nodejs.org/)
- **npm**: Comes bundled with Node.js
- **Git**: [Download Git](https://git-scm.com/downloads)

### Steps to Install

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/habitbuddy.git
    ```

2. **Navigate to the Project Directory**

    ```bash
    cd habitbuddy
    ```

3. **Install Dependencies**

    ```bash
    npm install
    ```

4. **Set Up Environment Variables**

    Create a `.env` file in the root directory and configure necessary variables.

5. **Run Migrations (If Applicable)**

    ```bash
    npm run migrate
    ```

6. **Start the Application**

    ```bash
    npm start
    ```

    The app should now be running at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

### Running Tests

To execute tests:

```bash
npm test
```

### Troubleshooting

- **Common Issues**: Ensure all dependencies are installed and versions are compatible.
- **Need Help?**: Open an issue on GitHub or contact the maintainers.
