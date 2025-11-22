# Document Converter

A modern web application for converting documents between multiple formats using Pandoc. Built with Next.js and FastAPI.

## Features

-   Convert between multiple document formats
-   Clean, modern UI inspired by Linear
-   File upload or direct text input
-   Fast processing with Pandoc
-   Automatic file download
-   Secure and private

## Supported Conversions

### Input Formats

-   LaTeX (.tex)
-   Markdown (.md)
-   HTML (.html)
-   reStructuredText (.rst)
-   Org Mode (.org)
-   DocBook (.xml)
-   EPUB (.epub)

### Output Formats

-   DOCX (Microsoft Word)
-   PDF
-   HTML
-   LaTeX
-   Markdown
-   EPUB
-   Plain Text
-   reStructuredText
-   Org Mode

## System Requirements

### Backend

-   Python 3.8+
-   Pandoc (must be installed separately)

### Frontend

-   Node.js 18+
-   npm or yarn

## Installation

### 1. Install Pandoc

Pandoc is required for document conversion. Choose your installation method:

**Windows:**

-   Download installer from: https://github.com/jgm/pandoc/releases
-   Or use Chocolatey:

```bash
choco install pandoc
```

-   Or use Winget:

```bash
winget install --source winget --exact --id JohnMacFarlane.Pandoc
```

**macOS:**

-   Use Homebrew:

```bash
brew install pandoc
```

-   Or download from: https://github.com/jgm/pandoc/releases

**Linux:**

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install pandoc
```

Fedora:

```bash
sudo dnf install pandoc
```

Arch Linux:

```bash
sudo pacman -S pandoc
```

Or download binary from: https://github.com/jgm/pandoc/releases

**Verify Installation:**

```bash
pandoc --version
```

For more installation options and details, visit: https://github.com/jgm/pandoc

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend

```bash
cd backend
python main.py
```

Backend runs at: http://localhost:6464

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:6565

## Usage

1. Open browser and navigate to http://localhost:6565
2. Select conversion type (input and output formats)
3. Choose input method: Upload file or Paste text
4. Provide your document content
5. Click Convert button
6. Converted file downloads automatically

## Project Structure

```
document-converter/
├── frontend/              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx      # Main page
│   │   ├── layout.tsx    # Layout
│   │   └── globals.css   # Global styles
│   ├── package.json
│   └── tsconfig.json
├── backend/               # FastAPI backend
│   ├── main.py           # API server
│   └── requirements.txt
└── README.md
```

## API Endpoints

### GET /

API information and available endpoints

### POST /api/convert

Convert document between formats

**Request:**

-   Method: POST
-   Content-Type: multipart/form-data
-   Body:
    -   file: Document file
    -   from_format: Input format
    -   to_format: Output format

**Response:**

-   Content-Type: Varies by output format
-   Body: Converted file
