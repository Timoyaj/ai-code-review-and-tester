<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Code Review and Tester

A streamlined platform for running and deploying AI-powered code review and testing applications using AI Studio. This repository provides everything you need to set up, configure, and launch your app locally or in production.

[![View in AI Studio](https://img.shields.io/badge/View%20in-AI%20Studio-blue?logo=google)](https://ai.studio/apps/drive/1vv3jS5-yocVB42R7WbgIGXyZ-u5DmkKm)

---

## Features

- **Automated AI Code Review:** Leverage Gemini AI for intelligent code analysis and review.
- **Testing Suite Integration:** Easily run and monitor automated test cases for your projects.
- **Easy Configuration:** Simple setup with environment variables and familiar Node.js tooling.
- **AI Studio Ready:** Seamlessly view and manage your app in AI Studio.

---

## Getting Started

These instructions will help you set up and run the app locally for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or above recommended)
- An API key for Gemini (see [Gemini API Documentation](https://ai.google.dev/gemini-api/docs) for details)

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Timoyaj/ai-code-review-and-tester.git
    cd ai-code-review-and-tester
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment Variables**

    - Create a `.env.local` file in the root directory (if it doesn't already exist).
    - Add your Gemini API key:
        ```
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
    - *(Optional)* Add other configuration variables as needed.

4. **Run the App Locally**

    ```bash
    npm run dev
    ```

    The app will start in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## Deployment

For deploying your application to production, follow these steps:

1. Ensure all environment variables are correctly set in your production environment.
2. Build the application:

    ```bash
    npm run build
    ```

3. Start the production server:

    ```bash
    npm start
    ```

Refer to [AI Studio documentation](https://ai.studio/docs) for additional deployment and hosting options.

---

## Usage

- Access code review and test automation by navigating to your running instance.
- Review results and logs directly from the UI.
- For advanced configurations or integrations, refer to the source code and inline documentation.

---

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Timoyaj/ai-code-review-and-tester/issues) or submit a pull request.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Contact

For support, questions, or feedback:
- Open an issue in this repository
- Contact [@Timoyaj](https://github.com/Timoyaj) on GitHub

---

<div align="center">
    <sub>Developed with ❤️ using AI Studio and Gemini API</sub>
</div>
