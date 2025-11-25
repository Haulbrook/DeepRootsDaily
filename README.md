# Deep Roots Daily - Crew Scheduler

A Google Apps Script-based crew scheduling application for Deep Roots Operations.

## Overview

This is a standalone crew scheduling tool that runs as a Google Apps Script web app. It allows you to:

- Assign team members, trucks, equipment, and jobs to 8 crews
- Track absent employees and out-of-service equipment
- Save schedules to Google Sheets for historical tracking
- Load previous day's schedules as templates

## Files

- `code.gs` - Google Apps Script backend code
- `index.html` - Frontend web application with Deep Roots theme

## Setup

### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy the contents of `code.gs` into the default `Code.gs` file
4. Create a new HTML file named `index` and paste the contents of `index.html`

### 2. Link to Google Sheet

1. Open your Google Spreadsheet
2. Go to Extensions > Apps Script
3. This will create a bound script - paste the code there instead

### 3. Deploy as Web App

1. In Apps Script, click Deploy > New deployment
2. Select "Web app" as the type
3. Set "Execute as" to your account
4. Set "Who has access" to your preference
5. Click Deploy and authorize the app

## Color Theme

The application uses the Deep Roots Operations color scheme:

- **Primary (Forest Green)**: `#3A7D5C`
- **Secondary (Earth/Clay)**: `#8B5A3C`
- **Accent (Coffee/Bark)**: `#5D4037`

## Google Sheet Structure

The script creates and manages these sheets:

- **Current_Schedule**: Active schedules for the last 7 days
- **Schedule_History**: Full history (30-day retention)
- **Tags_Master**: Master list of people, trucks, equipment, and jobs

## Links

- **Google Sheet**: [Crew Scheduler Data](https://docs.google.com/spreadsheets/d/1y89_Bq4O_bG_MKn3E9ZnJ4jngn9puDHrNKWcuOLpgN4/edit?gid=101243881#gid=101243881)
- **Web App**: [Crew Scheduler](https://script.google.com/macros/s/AKfycbwV8EIR7jPTZn0bZ7Jgv3Pj-sn13q_Nz4kueZ9pppX_PGZrRbYjieUfkZWA41WLD2c/exec)

## License

Proprietary - Deep Roots Operations
