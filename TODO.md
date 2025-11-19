# TODO List for Chrome Extension Time Tracking and Productivity Analytics

## 1. Set up Project Structure and Dependencies
- [x] Create package.json with Node.js dependencies (express, mongoose, cors, body-parser)
- [x] Initialize npm and install dependencies

## 2. Create Chrome Extension Files
- [x] Create manifest.json with necessary permissions (tabs, storage, activeTab, alarms)
- [x] Create background.js for time tracking logic (track active tabs, record time, classify websites)
- [x] Create popup.html for extension popup UI
- [x] Create popup.js for popup functionality (display current session time, categories)

## 3. Create Backend Server
- [x] Create server.js with Express setup and MongoDB connection
- [x] Create models/TimeEntry.js for storing time data
- [x] Create models/Category.js for user-configurable website classifications
- [x] Create routes/time.js for API endpoints (POST time data, GET analytics)
- [x] Create routes/categories.js for category CRUD operations

## 4. Create Dashboard
- [x] Create dashboard.html with HTML structure and include Chart.js for visualizations
- [x] Create dashboard.js to fetch data from backend and render charts/analytics

## 5. Integration and Testing
- [x] Set up SQLite database
- [ ] Load Chrome extension in browser for testing
- [x] Run backend server locally
- [x] Open dashboard in browser and test data fetching/display
- [x] Test time tracking, classification, and weekly reports (API endpoints tested successfully)
- [x] Debug and refine based on testing

## Notes
- Ensure extension sends data to backend via fetch API.
- Dashboard should display time spent, productivity metrics, and weekly reports.
- Classification is user-configurable via categories.
