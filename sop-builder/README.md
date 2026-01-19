# SOP Builder

A professional Standard Operating Procedure (SOP) builder using the proven 6-part Automate and Elevate framework.

## Features

### Template Library
- **Pre-built Templates**: Client Onboarding, Client Delivery, Sales Process, Invoicing & Payment, Content Creation, Email Management, Social Scheduling, Bookkeeping Handoff, Team Training
- **Custom Templates**: Start from scratch with a blank SOP
- **Visual Cards**: Each template has an icon and description

### 6-Part SOP Framework

Every SOP includes:

1. **Process Overview**: 2-3 sentence summary of the process
2. **Prerequisites**: Checklist of what's needed before starting
3. **Step-by-Step Instructions**: Numbered actions with time estimates and assignments
4. **Decision Trees**: IF/THEN logic for edge cases
5. **Common Mistakes**: What to avoid and how to fix issues
6. **Resources & Links**: Tools, templates, and contacts needed

### Builder Features

- **Progress Indicator**: Visual progress bar showing current section (1/6, 2/6, etc.)
- **Section Navigation**: Click to jump to any section
- **Live Preview**: Real-time preview of formatted SOP as you build
- **Auto-save**: Automatically saves every 2 seconds after editing
- **Drag-and-Drop**: Reorder steps by dragging (Step 3 only)
- **Inline Editing**: Click to edit any field
- **Dynamic Fields**: Add/remove items for prerequisites, steps, decisions, mistakes, and resources

### Dashboard & Organization

- **My SOPs Library**: View all created SOPs
- **Folder Organization**: Client, Revenue, Operations, Marketing, Admin
- **Search**: Find SOPs by title or content
- **Duplicate**: Create variations of existing SOPs
- **Edit/Delete**: Manage your SOP library

### Export Options

- **PDF**: Professional, print-ready format
- **Word Document**: Editable .docx format
- **Notion**: Formatted markdown ready to paste into Notion
- **Plain Text**: Copy and paste anywhere

## Design System

### Color Palette
- **Primary Navy**: #3B4A6B (headers, text)
- **Accent Fuchsia**: #D91E6B (CTAs, progress, highlights)
- **Gold**: #D4AF37 (section dividers, premium accents)
- **Teal**: #4DA6A0 (secondary actions, success states)
- **White**: #FFFFFF
- **Light Gray**: #F8F9FA (backgrounds)
- **Dark**: #2D2D3A (primary text)

### Typography
- **Font**: Inter from Google Fonts
- **Headers**: 600-700 weight
- **Body**: 400 weight
- **Preview**: 16-18px for readability

## Technical Stack

- HTML5
- CSS3 (modern grid and flexbox)
- Vanilla JavaScript (no frameworks)
- SortableJS for drag-and-drop
- html2pdf.js for PDF export
- LocalStorage for persistence
- Font Awesome icons

## Data Storage

All SOPs are stored in browser localStorage:
- **Key**: `completedSOPs`
- **Format**: JSON array of SOP objects

### SOP Data Structure

```javascript
{
  id: "sop_timestamp_random",
  title: "SOP Title",
  template: "template-id",
  folder: "Client|Revenue|Operations|Marketing|Admin",
  createdDate: "ISO timestamp",
  lastEdited: "ISO timestamp",
  sections: {
    overview: "Process overview text",
    prerequisites: ["Prerequisite 1", "Prerequisite 2"],
    steps: [
      {
        id: "step_id",
        order: 0,
        text: "Step description",
        time: "2 min",
        assignedTo: "You|VA|Team|Automation"
      }
    ],
    decisionTrees: [
      {
        condition: "IF condition",
        action: "THEN action"
      }
    ],
    mistakes: [
      {
        mistake: "What went wrong",
        fix: "How to avoid"
      }
    ],
    resources: [
      {
        category: "Templates|Tools|Contacts",
        name: "Resource name",
        link: "URL"
      }
    ]
  }
}
```

## Usage

1. **Choose a Template**: Select from pre-built templates or start from blank
2. **Build Your SOP**: Fill in each section with guided prompts
3. **Save Draft**: Auto-saves as you work, or manually save
4. **Export**: Download as PDF, Word, copy to Notion, or plain text
5. **Manage**: View, edit, duplicate, or delete SOPs from dashboard

## Mobile Responsive

- Stacked edit/preview panes on mobile
- Full-screen modals
- Larger touch targets
- Simplified drag-and-drop (move up/down buttons)
- Bottom sheet for options

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Privacy

All data is stored locally in your browser. No data is sent to any server. Clearing browser data will remove all SOPs.

## Credits

Built for Kendra Nix | Automate and Elevate

© 2025 All rights reserved
