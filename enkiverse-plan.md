# ENKIVERSE Foundation Website - Development Plan

## Project Overview
create files for enki-verse.com . a foundation website showcasing the ENKIVERSE Foundation's mission, supported artists, projects, and community initiatives.

## Core Values & Mission
- **Freedom**
- **Fertility** 
- **Creativity**

*ENKIVERSE takes its name from Enki, a forerunner of Prometheus, who gave humanity the keys to elevate ourselves to the position of gods*

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: Netlify connected to GitHub repository
- **Version Control**: GitHub https://github.com/enki-verse/enkiverse-website/
- **Development**: Visual Studio Code
- **Image Processing**: Client-side JavaScript libraries (e.g., canvas-based resizing)
- **Data Storage**: JSON files in repository for content management

## Site Structure

### Public Pages
```
/
├── index.html (Landing Page)
├── about.html (Foundation Info)
├── artists.html (Supported Artists)
├── projects.html (Current Projects)
├── events.html (Past & Upcoming Events)
├── community.html (Community Vision & Land Project)
├── contact.html (Contact & Email Signup)
└── admin.html (Admin Panel - password protected)
```

### Assets Structure
```
/assets
├── css/
│   ├── main.css
│   ├── admin.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── admin.js
│   ├── image-processor.js
│   └── github-api.js
├── images/
│   ├── large/
│   └── thumbnails/
└── data/
    ├── artists.json
    ├── projects.json
    ├── events.json
    └── config.json
```

## Page Content Specifications

### Landing Page (index.html)
- Hero section with ENKIVERSE branding
- Core values prominently displayed
- Brief foundation mission statement
- Links to key sections
- Email signup form
- "Supported by ENKIVERSE" section featuring arized.art

### Artists Page (artists.html)
- Featured artist: Arized with link to arized.art
- Grid layout of supported artists
- Individual artist profile cards with images
- Bio snippets and portfolio links

### Projects Page (projects.html)
- "The Great I Am" project featured prominently
- Other foundation projects
- Project timelines and objectives
- Image galleries for each project

### Community Page (community.html)
- Vision for intentional community
- Land acquisition goals
- Human potential development initiatives
- Community building events and workshops

## Admin Panel Features

### Authentication
- GitHub Personal Access Token authentication only
- Token validation against GitHub API
- Session management with localStorage (stores validated token)

### Admin Panel Features

### Authentication
- GitHub Personal Access Token authentication only
- Token validation against GitHub API
- Session management with localStorage (stores validated token)

### Tabbed Interface
- **Artists Tab**: Manage artist profiles and portfolios
- **Projects Tab**: Handle project content and timelines  
- **Events Tab**: Create and edit event information
- **Images Tab**: Upload, organize, and manage all site images
- **Settings Tab**: Site configuration and token management

### Content Management
- Add/Edit/Delete profiles (artists, projects, events)
- Image upload with automatic thumbnail generation
- Drag-and-drop image reordering within profiles
- Rich text editor for descriptions
- GitHub integration for automated commits

### Image Management System
- Upload to `/assets/images/large/`
- Auto-generate thumbnails to `/assets/images/thumbnails/`
- Associate images with specific profiles/events/projects
- Remove/reassign images as needed
- Image ordering within collections

### GitHub Integration
- GitHub token input field
- Automatic commit creation for content updates
- File upload via GitHub API
- Commit messages with timestamps and change descriptions



### Initial Setup


# Create basic file structure
mkdir -p assets/{css,js,images/{large,thumbnails},data}
touch index.html about.html artists.html projects.html events.html community.html contact.html admin.html
touch assets/css/{main.css,admin.css,responsive.css}
touch assets/js/{main.js,admin.js,image-processor.js,github-api.js}
touch assets/data/{artists.json,projects.json,events.json,config.json}
```

### Required JavaScript Libraries
Include these CDN links in your HTML:
- **Image Processing**: `https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js`
- **Rich Text Editor**: `https://cdn.quilljs.com/1.3.6/quill.min.js`
- **GitHub API**: Native fetch() API (no external library needed)

### Key Development Tasks

#### 1. Create Base HTML Templates
- Semantic HTML5 structure
- Responsive meta tags
- Consistent navigation
- Footer with social links

#### 2. Implement CSS Framework
- Mobile-first responsive design
- CSS Grid/Flexbox layouts
- Custom color palette reflecting brand
- Typography hierarchy
- Component-based styles

#### 3. Build Admin Panel
```javascript
// Key admin.js functions to implement:
- authenticateAdmin()
- loadContent()
- saveContent()  
- uploadImage()
- generateThumbnail()
- commitToGitHub()
- reorderImages()
```

#### 4. Content Management System
- JSON-based data structure
- Dynamic page generation
- CRUD operations for all content types
- Image association and management

#### 5. GitHub API Integration
```javascript
// github-api.js core functions:
- authenticateGitHub(token)
- createFile(path, content, message)
- updateFile(path, content, message, sha)
- uploadBinaryFile(path, file, message)
```

### Data Structure Examples

#### artists.json
```json
{
  "artists": [
    {
      "id": "arized",
      "name": "Arized",
      "bio": "Primary artist supported by ENKIVERSE Foundation",
      "website": "https://arized.art",
      "images": ["artist1_1.jpg", "artist1_2.jpg"],
      "featured": true
    }
  ]
}
```

#### projects.json
```json
{
  "projects": [
    {
      "id": "great-i-am",
      "title": "The Great I Am",
      "description": "Project description here",
      "status": "active",
      "images": ["project1_hero.jpg"],
      "timeline": "2024-2025"
    }
  ]
}
```

## Deployment Workflow


## Email Signup Integration
mailchimp

## Future Enhancements

- Advanced image gallery with lightbox


## Testing Checklist
- [ ] All pages load correctly
- [ ] Admin panel authentication works
- [ ] Image upload and thumbnail generation
- [ ] GitHub API integration functions
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Email signup form submission
- [ ] Navigation and internal linking
- [ ] Content CRUD operations
- [ ] Cross-browser compatibility

## Launch Preparation
1. Final content review and proofreading
2. SEO optimization (meta tags, alt text, etc.)
3. Performance optimization (image compression, minification)
4. DNS configuration for enki-verse.com
5. Netlify deployment settings
6. Analytics setup (Google Analytics/Plausible)
7. Social media integration
8. Contact form testing

---

**Next Steps**: Begin with creating the basic HTML structure and CSS framework, then implement the admin panel functionality for content management.
