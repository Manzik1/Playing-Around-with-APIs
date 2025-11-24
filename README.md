JobHunt (Global Job Search Engine)

Project Information

Developer: Kevin Manzi

Demo:https://youtu.be/Shkyz59X5qU

Email: <k.manzi@alustudent.com>

API Used: JSearch API (RapidAPI)

File Structure

job-hunt/
├── index.html
├── style.css
├── script.js
├── config.js
├── .gitignore
└── README.md

Description

JobHunt is a powerful job search application designed to connect users with career opportunities worldwide. Utilizing the JSearch API, it aggregates job listings from multiple sources (LinkedIn, Indeed, Glassdoor, etc.) into a single, clean interface. It includes advanced filtering and a unique Salary Estimator feature.

Features

 Smart Search: Find jobs by title, keyword, or company.

 Global Filters: Filter by Country (US, UK, DE, etc.), Date Posted, and Remote status.

 Job Details: View comprehensive job descriptions, requirements, and apply links directly within the app.

 Salary Estimator: A unique feature that calculates estimated salary ranges for specific roles using real-time market data.

 User Auth: Simple client-side name/key authentication with session persistence.

Technologies Used

HTML5 / CSS3 (Inter font, Flexbox, Grid)

Vanilla JavaScript (ES6+, Async/Await)

JSearch API (Endpoints: /search, /company-job-salary)

LocalStorage (Caching & Session)

Setup & Usage

Clone the Repo:

git clone <repo-url>

Open the App:
Simply open index.html in your browser.

Login:

Enter your name.

Use the default API Key (pre-filled in code) or enter your own JSearch key.

Find a Job:

Enter "React Developer" or "Project Manager".

Select a country.

Click "Find Jobs".

Check Salary:

Click "View" on any job card.

Scroll down in the modal and click "Check Estimated Salary" to see market rates.

API Configuration

The application uses jsearch.p.rapidapi.com.

Search: GET /search?query={q}&country={c}...

Salary: GET /company-job-salary?job_title={t}&location={l}

Deployment

To deploy on Web01/Web02:

Upload all files to /var/www/html/.

Ensure Nginx is running.

Access via your Load Balancer IP.

License

Educational Project for ALU.

