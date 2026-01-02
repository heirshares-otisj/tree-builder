# Tree Builder - Property Ownership Visualization

An interactive visualization tool for tracking property ownership transfers through family trees, designed for North Carolina estate planning and inheritance tracking.

## Features

- **Interactive Family Tree View**: Visual representation of ownership at any point in time
- **Transfer Event Timeline**: Click on events to see detailed breakdowns of ownership transfers
- **Legal Statute References**: Links to relevant NC statutes governing each transfer
- **Detailed Explanations**: Clear explanations of how each transfer is calculated
- **Deed Documents**: View fictitious legal documents supporting transfers
- **Warning System**: Flags missing information needed for accurate calculations

## Live Demo

Visit the live demo at: `https://heirshares-otisj.github.io/tree-builder/`

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone this repository:
```bash
git clone https://github.com/YOUR-USERNAME/tree-builder.git
cd tree-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Deployment to GitHub Pages

### First Time Setup

1. Update `package.json`:
   - Replace `YOUR-USERNAME` with your GitHub username in the `homepage` field

2. Update `vite.config.js`:
   - Replace `/tree-builder/` with your repository name if different

3. Create a new repository on GitHub named `tree-builder`

4. Initialize git and push:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/tree-builder.git
git push -u origin main
```

5. Deploy to GitHub Pages:
```bash
npm run deploy
```

6. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select the `gh-pages` branch
   - Click "Save"

Your site will be live at `https://YOUR-USERNAME.github.io/tree-builder/` in a few minutes!

### Updating the Site

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
npm run deploy
```

## Project Structure

```
tree-builder/
├── src/
│   ├── App.jsx          # Main visualization component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind CSS
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **GitHub Pages**: Hosting

## Key Concepts

### Visualizer vs Calculator

This is the **Visualizer** component. It displays pre-calculated data provided by the **Calculator** (not included). The Calculator:
- Applies state-specific intestacy laws
- Computes ownership fractions
- Determines per stirpes distributions
- Flags missing data

The Visualizer simply displays this information in an intuitive, interactive format.

### Data Structure

Events contain:
- **Source**: Person transferring ownership
- **Recipients**: People receiving ownership with fractions and explanations
- **Legal Basis**: Statute references
- **Warnings**: Missing information flags
- **Preamble**: Context for the transfer

## Customization

### Changing the State

Currently configured for North Carolina. To change:
1. Update statute references in event data
2. Update header text in TreeView and TransferEventView components

### Adding More Events

Add new events to the `EVENTS` array in `App.jsx` with the same structure.

### Styling

Modify `tailwind.config.js` to customize colors, fonts, and other design tokens.

## Future Enhancements

- [ ] Add connecting lines between nodes
- [ ] Implement node collapse/expand with aggregated ownership
- [ ] Add CSV/JSON import for family data
- [ ] Support for multiple properties
- [ ] Will and deed document upload
- [ ] Print-friendly reports

## License

[Your License Here]

## Contact

[Your Contact Information]
