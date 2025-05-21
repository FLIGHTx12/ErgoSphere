# ErgoSphere Quarterly Games Implementation

This document describes the implementation of the quarterly games feature for the ErgoSphere website.

## Overview

The quarterly games feature allows administrators to set a specific solo game for each quarter of the year, which will be displayed on the homepage. Additionally, the ErgoArt subject is now editable through the admin panel.

## Database Structure

The feature adds the following columns to the `weekly_selections` table:

- `q1_game`: The solo game for Q1 (January-March)
- `q2_game`: The solo game for Q2 (April-June)
- `q3_game`: The solo game for Q3 (July-September)
- `q4_game`: The solo game for Q4 (October-December)
- `ergoart_subject`: The current ErgoArt subject

## API Endpoints

### GET /api/selections

Returns all current selections, including:
- Weekly champions
- Current meals
- Movie night selection
- YouTube theater selections
- Quarterly games (in a `quarterlyGames` object)
- ErgoArt subject

### POST /api/selections

Updates all selections with new values. Requires the following fields:
- `bingwaChampion`: The current Bingwa Champion
- `atleticoChamp`: The current Atletico Champion
- `movieNight`: The current movie night selection
- Optional fields:
  - `banquetMeal`: The current banquet meal selection
  - `brunchMeal`: The current brunch meal selection
  - `youtubeTheater`: An array of YouTube theater selections
  - `quarterlyGames`: An object containing quarterly games (`q1`, `q2`, `q3`, `q4`)
  - `ergoArtSubject`: The current ErgoArt subject

## Frontend Implementation

### Admin Panel

The admin panel (`manage-selections.html`) includes:
- Dropdowns for selecting quarterly games for each quarter
- An input field for setting the ErgoArt subject
- Preview functionality to see the chosen values before submission

### Homepage Display

The homepage (`index.html`) displays:
- The current quarter's solo game in the "Quarter begins" card
- The current ErgoArt subject in the ErgoArt challenge card
- The current quarter number (1-4) based on the current date

## Backup Mechanism

Two scripts have been added for syncing between the database and the `selections.json` file:

1. `syncSelectionsFromDb.js`: Syncs the database values to `selections.json`
2. `syncSelectionsToDb.js`: Syncs from `selections.json` to the database

## Migration

A database migration script (`add_quarterly_games_ergoart_to_weekly_selections_fixed.sql`) has been added to create the required columns in the database.

## Error Handling

The implementation includes fallback mechanisms:
- If API calls fail, falls back to `selections.json`
- If the quarterly game for the current quarter is not set, falls back to games with purple status
- Provides default values for ErgoArt subject and other fields if they are not available

## Notes

- The current quarter is determined automatically based on the current date
- The admin panel validates input and provides feedback
- All changes are logged to the console for debugging
