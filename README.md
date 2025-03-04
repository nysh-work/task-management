# Task Management Application with Location Reminders

A modern task management application built with Next.js that includes location-based reminders and robust calendar features, ensuring you never forget tasks when arriving at or leaving specific locations.

![Task Management App Screenshot](public/app-screenshot.png)

## Features

- **Task Management**: Create, edit, and delete tasks with due dates and priorities
- **Location-based Reminders**: Set reminders for tasks that trigger when you arrive at or leave specific locations
- **Enhanced Calendar Views**: 
  - **Day View**: Focus on tasks for a specific day with a date picker
  - **Month View**: Visualize all tasks in a monthly grid calendar
  - **Task Details**: Click on any day to see detailed task information
- **Statistics**: Track your productivity with task completion statistics
- **Mobile-friendly**: Responsive design works on all devices
- **Offline Support**: Progressive Web App (PWA) capabilities for offline use
- **Notifications**: Browser notifications for task reminders

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: Shadcn UI (based on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Storage**: Local Storage (client-side)
- **Geolocation**: Browser Geolocation API
- **Notifications**: Web Notifications API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A modern web browser with support for geolocation and notifications

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/task-management.git
   cd task-management
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```
npm run build
npm start
```

## Usage

### Managing Tasks

1. Click "Add Task" to create a new task
2. Fill in the task details including title, description, due date, and priority
3. To add a location reminder, toggle "Add location reminder" and set the location details
4. Click "Save" to add the task
5. Edit or delete tasks using the action buttons on each task card

### Using Calendar Views

1. Navigate to the Calendar tab in the dashboard
2. Choose between Day View and Month View using the toggle at the top
3. In Day View:
   - Use the calendar widget to select specific dates
   - View tasks scheduled for the selected date in the right panel
4. In Month View:
   - Navigate between months using the arrow buttons or jump to Today
   - Tasks are displayed directly on the calendar days
   - The number badge shows how many tasks are scheduled for each day
   - Click on any day to view detailed task information in a popup

### Location Reminders

1. When creating or editing a task, toggle "Add location reminder"
2. Enter a name for the location
3. Set the radius (in meters) for the geofence
4. Choose whether to be notified on arrival, departure, or both
5. Enter a custom reminder message (optional)
6. Enable location monitoring in the dashboard to activate reminders

### Permissions

The application requires the following permissions:

- **Geolocation**: To track your location for location-based reminders
- **Notifications**: To send reminder notifications

You will be prompted to grant these permissions when you first use the related features.

## Deployment

For detailed deployment instructions, please see the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Project Structure

```
task-management/
├── app/                      # Next.js app router files
│   ├── api/                  # API routes
│   ├── components/           # Global components
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── ...
├── components/               # React components
│   ├── ui/                   # UI components from shadcn
│   ├── task-item.tsx         # Task component
│   ├── task-form.tsx         # Task creation/edit form
│   ├── calendar-view.tsx     # Calendar view component
│   ├── simple-task-calendar.tsx # Monthly calendar grid
│   ├── location-reminder-fields.tsx # Location reminder fields
│   └── ...
├── contexts/                 # React contexts
│   ├── task-context.tsx      # Task state management
│   └── ...
├── lib/                      # Utility functions
│   ├── location-service.ts   # Location monitoring service
│   └── ...
├── types/                    # TypeScript type definitions
│   ├── task.ts               # Task type definitions
│   └── ...
├── public/                   # Static files
├── styles/                   # Global styles
├── next.config.js            # Next.js configuration
└── package.json              # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the beautiful component library
- Next.js team for the amazing framework
- All contributors who have helped shape this project 