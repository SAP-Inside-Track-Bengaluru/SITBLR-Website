# SITBLR Event Agenda Website

A beautiful, responsive one-page website displaying the agenda for SITBLR 3rd Edition event.

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Search**: Real-time search across sessions, speakers, and tracks
- **Advanced Filtering**: Filter by session type and track/location
- **Tab Navigation**: Separate views for Sessions and Demo Pods
- **Dark/Light Theme**: Toggle between themes with preference saving
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: Clean design with smooth animations and transitions

## 📱 Live Demo

Visit the live site: [SITBLR Event Agenda](https://yourusername.github.io/SITBLR-Website/)

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: No frameworks, pure ES6+ code
- **GitHub Pages**: Automated deployment

## 📂 Project Structure

```
event-agenda-website/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css      # All styles and responsive design
│   ├── data/
│   │   └── events_3rdedition.json  # Event data
│   └── js/
│       ├── app.js          # Main application logic
│       └── utils.js        # Utility functions
├── LICENSE
└── README.md
```

## 🔧 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/SITBLR-Website.git
   cd SITBLR-Website
   ```

2. Navigate to the website directory:
   ```bash
   cd event-agenda-website
   ```

3. Serve the files locally (using any local server):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. Open your browser and visit `http://localhost:8000`

## 📅 Data Format

The event data is structured in JSON format with the following main sections:

- **lectures**: Main sessions with time slots and multiple tracks
- **demopods**: Demo pod sessions with speakers and descriptions
- **handson**: Hands-on workshop sessions (if any)

Each session includes:
- Session title and description
- Speaker information (primary and secondary speakers)
- Track/location information  
- Time slot and sequence
- Session type (Lecture, Demo Pod, Break)

## 🎨 Customization

### Themes
The website supports both dark and light themes. Users can toggle between themes, and their preference is saved locally.

### Colors
You can customize the color scheme by modifying the CSS custom properties in `styles.css`:

```css
:root {
  --accent: #2563eb;        /* Primary accent color */
  --bg-panel: #ffffff;      /* Panel background */
  --text-muted: #5e6b80;    /* Muted text color */
  /* ... more variables */
}
```

### Content
Update the event data by editing `assets/data/events_3rdedition.json` with your event information.

## 🚀 Deployment

The website is automatically deployed to GitHub Pages using GitHub Actions. Any push to the main branch triggers a new deployment.

### Manual Deployment

1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. Push your changes to the main branch

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive Design**: Works on all screen sizes from 320px to 2560px+

## ♿ Accessibility Features

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion support for users with vestibular disorders

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the development team.

---

**SITBLR 3rd Edition** - Built with ❤️ for the SAP community
