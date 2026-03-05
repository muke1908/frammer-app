# Photo Framing App

A minimal, elegant web application for framing photos with customizable borders and aspect ratios. Built with React, Vite, and HTML5 Canvas.

## Features

- **Upload Photos**: Drag & drop or click to upload (supports JPG, PNG, HEIC, WebP up to 50MB)
- **Crop Presets**: Choose from None, 16:9, or 9:16 aspect ratio crops
- **Frame Controls**: Toggle between 16:9 and 9:16 frame sizes
- **Background Options**: Black or white frame backgrounds
- **High-Quality Export**: Download framed images in high resolution PNG format
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Minimal UI**: Clean, distraction-free interface

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Usage

1. **Upload**: Drag and drop an image or click to browse and select
2. **Customize**:
   - Select a crop preset (None, 16:9, or 9:16)
   - Toggle frame aspect ratio (16:9 ⟷ 9:16)
   - Toggle background color (Black ⟷ White)
3. **Export**: Click "Download" to save your framed photo
4. **New Photo**: Click "Upload New Photo" to start over

## Project Structure

```
src/
├── components/
│   ├── layout/          # App layout components
│   ├── upload/          # File upload components
│   ├── canvas/          # Canvas rendering components
│   ├── controls/        # Control panel components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── utils/
│   ├── canvas/          # Canvas rendering utilities
│   ├── validators.js    # File validation
│   └── constants.js     # App constants
└── styles/              # CSS styles
```

## Architecture Highlights

- **State Management**: useReducer for predictable state updates
- **Canvas Rendering**: HTML5 Canvas API for pixel-perfect image manipulation
- **High-Quality Export**: 2x resolution scaling for crisp exports
- **Minimal Dependencies**: Only React + Vite for maximum portability
- **Future-Ready**: Architecture designed for easy React Native conversion

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Canvas rendering optimized for 60fps
- Retina display support
- High-quality image smoothing
- Efficient re-rendering with React memoization

## Future Enhancements

- Custom crop with drag handles
- Zoom/pan within frame
- Additional frame styles and colors
- Image filters (grayscale, sepia)
- Batch processing
- iOS/Android app via React Native

## License

MIT

## Tech Stack

- React 19
- Vite 7
- HTML5 Canvas API
- CSS Custom Properties
- Modern JavaScript (ES2022+)
