# Event Agenda Website

## Overview
This project is a responsive and searchable event agenda website designed to display the schedule of events, including lectures, demo pods, and hands-on sessions. The website is built using HTML, CSS, and JavaScript, and it utilizes a JSON file to manage event data.

## Features
- **Responsive Design**: The website is designed to work on various screen sizes, ensuring a good user experience on both desktop and mobile devices.
- **Search Functionality**: Users can search for specific events by title or speaker, making it easy to find relevant sessions.
- **Dynamic Data Loading**: The event agenda is populated dynamically from a JSON file, allowing for easy updates and maintenance.

## Project Structure
```
event-agenda-website
├── index.html          # Main HTML file for the website
├── assets
│   ├── css
│   │   └── styles.css  # CSS styles for the website
│   ├── js
│   │   ├── app.js      # Main JavaScript logic for the website
│   │   └── utils.js    # Utility functions for data manipulation
│   └── data
│       └── events_3rdedition.json  # Event agenda data in JSON format
├── .github
│   └── workflows
│       └── pages.yml   # GitHub Actions workflow for deployment
├── README.md           # Documentation for the project
└── LICENSE             # Licensing information for the project
```

## Setup Instructions
1. **Clone the Repository**: 
   ```bash
   git clone https://github.com/yourusername/event-agenda-website.git
   cd event-agenda-website
   ```

2. **Open the Project**: Open `index.html` in your web browser to view the event agenda.

3. **Modify Event Data**: To update the event agenda, edit the `assets/data/events_3rdedition.json` file with the new event details.

## Contributing
Contributions are welcome! If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.