// Workflow Mapper Application
class WorkflowMapper {
    constructor() {
        this.currentWorkflow = null;
        this.currentView = 'dashboard'; // 'dashboard' or 'editor'
        this.stage = null;
        this.layer = null;
        this.gridLayer = null;
        this.elements = [];
        this.connections = [];
        this.selectedElements = [];
        this.history = [];
        this.historyIndex = -1;
        this.dragElement = null;
        this.connectionStart = null;
        this.tempLine = null;
        this.gridEnabled = true;
        this.snapToGrid = true;
        this.gridSize = 20;
        this.zoom = 1;
        this.isDragging = false;
        this.lastPos = null;
        this.autoSaveInterval = null;

        this.init();
    }

    init() {
        // Load saved workflows
        this.loadWorkflows();

        // Show dashboard by default
        this.showDashboard();

        // Set up palette drag events
        this.setupPaletteDragEvents();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.currentView === 'editor' && this.currentWorkflow) {
                this.autoSave();
            }
        }, 30000);
    }

    // ============ VIEW MANAGEMENT ============

    showDashboard() {
        this.currentView = 'dashboard';
        document.getElementById('dashboard-view').classList.remove('hidden');
        document.getElementById('editor-view').classList.add('hidden');
        this.renderWorkflowGrid();
    }

    showEditor() {
        this.currentView = 'editor';
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('editor-view').classList.remove('hidden');

        if (!this.stage) {
            this.initCanvas();
        }

        this.updateWorkflowTitle();
        this.renderWorkflow();
    }

    backToDashboard() {
        if (this.currentWorkflow && this.hasUnsavedChanges()) {
            if (confirm('You have unsaved changes. Save before leaving?')) {
                this.saveWorkflow();
            }
        }
        this.showDashboard();
    }

    createNewWorkflow() {
        this.currentWorkflow = {
            id: this.generateId(),
            title: 'Untitled Workflow',
            folder: 'General',
            createdDate: new Date().toISOString(),
            lastEdited: new Date().toISOString(),
            elements: [],
            connections: [],
            viewport: { zoom: 1, offsetX: 0, offsetY: 0 }
        };

        this.elements = [];
        this.connections = [];
        this.history = [];
        this.historyIndex = -1;
        this.selectedElements = [];

        this.showEditor();
    }

    loadWorkflow(workflowId) {
        const workflows = this.getWorkflows();
        const workflow = workflows.find(w => w.id === workflowId);

        if (workflow) {
            this.currentWorkflow = workflow;
            this.elements = workflow.elements || [];
            this.connections = workflow.connections || [];
            this.history = [];
            this.historyIndex = -1;
            this.selectedElements = [];

            this.showEditor();
        }
    }

    deleteWorkflow(workflowId) {
        if (!confirm('Are you sure you want to delete this workflow?')) {
            return;
        }

        const workflows = this.getWorkflows();
        const filtered = workflows.filter(w => w.id !== workflowId);
        localStorage.setItem('savedWorkflows', JSON.stringify(filtered));
        this.renderWorkflowGrid();
    }

    duplicateWorkflow(workflowId) {
        const workflows = this.getWorkflows();
        const workflow = workflows.find(w => w.id === workflowId);

        if (workflow) {
            const duplicate = {
                ...workflow,
                id: this.generateId(),
                title: workflow.title + ' (Copy)',
                createdDate: new Date().toISOString(),
                lastEdited: new Date().toISOString()
            };

            workflows.push(duplicate);
            localStorage.setItem('savedWorkflows', JSON.stringify(workflows));
            this.renderWorkflowGrid();
        }
    }

    // ============ CANVAS INITIALIZATION ============

    initCanvas() {
        const container = document.getElementById('canvas');
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Create stage
        this.stage = new Konva.Stage({
            container: 'canvas',
            width: width,
            height: height,
            draggable: false
        });

        // Create grid layer
        this.gridLayer = new Konva.Layer();
        this.stage.add(this.gridLayer);
        this.drawGrid();

        // Create main layer for elements
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Set up canvas events
        this.setupCanvasEvents();

        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = container.offsetWidth;
            const newHeight = container.offsetHeight;
            this.stage.width(newWidth);
            this.stage.height(newHeight);
            this.drawGrid();
        });
    }

    drawGrid() {
        if (!this.gridLayer) return;

        this.gridLayer.destroyChildren();

        if (!this.gridEnabled) {
            this.gridLayer.batchDraw();
            return;
        }

        const width = this.stage.width();
        const height = this.stage.height();
        const gridSize = this.gridSize * this.zoom;

        // Draw vertical lines
        for (let i = 0; i < width / gridSize; i++) {
            this.gridLayer.add(new Konva.Line({
                points: [i * gridSize, 0, i * gridSize, height],
                stroke: '#E0E0E0',
                strokeWidth: 1
            }));
        }

        // Draw horizontal lines
        for (let i = 0; i < height / gridSize; i++) {
            this.gridLayer.add(new Konva.Line({
                points: [0, i * gridSize, width, i * gridSize],
                stroke: '#E0E0E0',
                strokeWidth: 1
            }));
        }

        this.gridLayer.batchDraw();
    }

    setupCanvasEvents() {
        // Click on empty space to deselect
        this.stage.on('click', (e) => {
            if (e.target === this.stage) {
                this.clearSelection();
                this.closeDetailPanel();
            }
        });

        // Canvas dragging (panning)
        this.stage.on('mousedown', (e) => {
            if (e.target !== this.stage) return;

            this.isDragging = true;
            this.lastPos = this.stage.getPointerPosition();
        });

        this.stage.on('mousemove', () => {
            if (!this.isDragging) return;

            const pos = this.stage.getPointerPosition();
            const dx = pos.x - this.lastPos.x;
            const dy = pos.y - this.lastPos.y;

            this.layer.x(this.layer.x() + dx);
            this.layer.y(this.layer.y() + dy);

            this.lastPos = pos;
            this.layer.batchDraw();
        });

        this.stage.on('mouseup', () => {
            this.isDragging = false;
        });

        // Zoom with mouse wheel
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();

            const oldScale = this.zoom;
            const pointer = this.stage.getPointerPosition();

            const scaleBy = 1.1;
            const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

            this.setZoom(newScale);
        });

        // Handle drop from palette
        const container = document.getElementById('canvas');
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCanvasDrop(e);
        });
    }

    // ============ PALETTE DRAG & DROP ============

    setupPaletteDragEvents() {
        const paletteItems = document.querySelectorAll('.palette-item');

        paletteItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const type = item.getAttribute('data-type');
                e.dataTransfer.setData('elementType', type);
                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
        });
    }

    handleCanvasDrop(e) {
        const elementType = e.dataTransfer.getData('elementType');
        if (!elementType) return;

        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const x = e.clientX - canvasRect.left - this.layer.x();
        const y = e.clientY - canvasRect.top - this.layer.y();

        this.addElement(elementType, x / this.zoom, y / this.zoom);
    }

    // ============ ELEMENT MANAGEMENT ============

    addElement(type, x, y) {
        const element = {
            id: this.generateId(),
            type: type,
            label: this.getDefaultLabel(type),
            x: this.snapToGrid ? Math.round(x / this.gridSize) * this.gridSize : x,
            y: this.snapToGrid ? Math.round(y / this.gridSize) * this.gridSize : y,
            details: {
                tool: '',
                time: '',
                assignedTo: 'Automation',
                description: '',
                notes: ''
            }
        };

        if (type === 'decision') {
            element.branches = {
                yes: { label: 'YES', color: '#10B981' },
                no: { label: 'NO', color: '#EF4444' }
            };
        }

        this.elements.push(element);
        this.saveState();
        this.renderWorkflow();
        this.updateStats();

        return element;
    }

    getDefaultLabel(type) {
        const labels = {
            trigger: 'New Trigger',
            action: 'New Action',
            decision: 'Decision?',
            end: 'End'
        };
        return labels[type] || 'New Element';
    }

    deleteElement(elementId) {
        // Remove connections
        this.connections = this.connections.filter(c =>
            c.from !== elementId && c.to !== elementId
        );

        // Remove element
        this.elements = this.elements.filter(e => e.id !== elementId);

        this.saveState();
        this.renderWorkflow();
        this.updateStats();
        this.closeDetailPanel();
    }

    deleteSelectedElements() {
        if (this.selectedElements.length === 0) return;

        const message = this.selectedElements.length === 1
            ? 'Delete this element?'
            : `Delete ${this.selectedElements.length} elements?`;

        if (!confirm(message)) return;

        this.selectedElements.forEach(id => {
            this.deleteElement(id);
        });

        this.selectedElements = [];
    }

    updateElement(elementId, updates) {
        const element = this.elements.find(e => e.id === elementId);
        if (element) {
            Object.assign(element, updates);
            this.saveState();
            this.renderWorkflow();
            this.updateStats();
        }
    }

    // ============ CONNECTION MANAGEMENT ============

    startConnection(elementId, anchorType = 'default') {
        this.connectionStart = { elementId, anchorType };
    }

    completeConnection(targetElementId) {
        if (!this.connectionStart) return;

        // Don't connect to self
        if (this.connectionStart.elementId === targetElementId) {
            this.connectionStart = null;
            return;
        }

        // Check if connection already exists
        const exists = this.connections.some(c =>
            c.from === this.connectionStart.elementId && c.to === targetElementId
        );

        if (!exists) {
            const connection = {
                id: this.generateId(),
                from: this.connectionStart.elementId,
                to: targetElementId,
                type: this.connectionStart.anchorType,
                label: this.connectionStart.anchorType === 'yes' ? 'YES' :
                       this.connectionStart.anchorType === 'no' ? 'NO' : ''
            };

            this.connections.push(connection);
            this.saveState();
            this.renderWorkflow();
        }

        this.connectionStart = null;
    }

    deleteConnection(connectionId) {
        this.connections = this.connections.filter(c => c.id !== connectionId);
        this.saveState();
        this.renderWorkflow();
    }

    // ============ RENDERING ============

    renderWorkflow() {
        if (!this.layer) return;

        this.layer.destroyChildren();

        // Render connections first (below elements)
        this.connections.forEach(conn => {
            this.renderConnection(conn);
        });

        // Render elements
        this.elements.forEach(element => {
            this.renderElement(element);
        });

        this.layer.batchDraw();
    }

    renderElement(element) {
        const group = new Konva.Group({
            x: element.x,
            y: element.y,
            draggable: true,
            id: element.id
        });

        let shape;
        const isSelected = this.selectedElements.includes(element.id);

        switch (element.type) {
            case 'trigger':
                shape = new Konva.Circle({
                    radius: 40,
                    fill: 'white',
                    stroke: '#4DA6A0',
                    strokeWidth: isSelected ? 4 : 3,
                    shadowColor: 'black',
                    shadowBlur: isSelected ? 12 : 8,
                    shadowOpacity: isSelected ? 0.2 : 0.1,
                    shadowOffset: { x: 0, y: 2 }
                });
                break;

            case 'action':
                shape = new Konva.Rect({
                    width: 160,
                    height: 80,
                    offsetX: 80,
                    offsetY: 40,
                    cornerRadius: 8,
                    fill: 'white',
                    stroke: '#D91E6B',
                    strokeWidth: isSelected ? 4 : 3,
                    shadowColor: 'black',
                    shadowBlur: isSelected ? 12 : 8,
                    shadowOpacity: isSelected ? 0.2 : 0.1,
                    shadowOffset: { x: 0, y: 2 }
                });
                break;

            case 'decision':
                shape = new Konva.Rect({
                    width: 85,
                    height: 85,
                    offsetX: 42.5,
                    offsetY: 42.5,
                    rotation: 45,
                    fill: 'white',
                    stroke: '#D4AF37',
                    strokeWidth: isSelected ? 4 : 3,
                    shadowColor: 'black',
                    shadowBlur: isSelected ? 12 : 8,
                    shadowOpacity: isSelected ? 0.2 : 0.1,
                    shadowOffset: { x: 0, y: 2 }
                });
                break;

            case 'end':
                shape = new Konva.Circle({
                    radius: 30,
                    fill: 'white',
                    stroke: '#3B4A6B',
                    strokeWidth: isSelected ? 4 : 3,
                    shadowColor: 'black',
                    shadowBlur: isSelected ? 12 : 8,
                    shadowOpacity: isSelected ? 0.2 : 0.1,
                    shadowOffset: { x: 0, y: 2 }
                });
                break;
        }

        if (isSelected) {
            shape.stroke('#D91E6B');
        }

        group.add(shape);

        // Add label text
        const maxWidth = element.type === 'action' ? 140 :
                        element.type === 'trigger' ? 70 :
                        element.type === 'decision' ? 80 : 50;

        const text = new Konva.Text({
            text: element.label,
            fontSize: 14,
            fontFamily: 'Inter',
            fontStyle: '600',
            fill: '#3B4A6B',
            align: 'center',
            verticalAlign: 'middle',
            width: maxWidth,
            offsetX: maxWidth / 2,
            offsetY: 7,
            ellipsis: true,
            wrap: 'none'
        });

        group.add(text);

        // Add connection anchors for decision elements
        if (element.type === 'decision') {
            this.addDecisionAnchors(group, element);
        }

        // Add event handlers
        group.on('click', (e) => {
            e.cancelBubble = true;

            if (e.evt.shiftKey) {
                this.toggleSelection(element.id);
            } else {
                this.selectElement(element.id);
            }

            this.openDetailPanel(element.id);
        });

        group.on('dragstart', () => {
            this.saveState();
        });

        group.on('dragmove', () => {
            const pos = group.position();

            if (this.snapToGrid) {
                group.position({
                    x: Math.round(pos.x / this.gridSize) * this.gridSize,
                    y: Math.round(pos.y / this.gridSize) * this.gridSize
                });
            }

            element.x = group.x();
            element.y = group.y();

            this.renderWorkflow();
        });

        group.on('dragend', () => {
            element.x = group.x();
            element.y = group.y();
            this.saveState();
        });

        group.on('mouseenter', () => {
            document.body.style.cursor = 'pointer';
            if (!isSelected) {
                shape.shadowBlur(12);
                shape.y(shape.y() - 2);
                this.layer.batchDraw();
            }
        });

        group.on('mouseleave', () => {
            document.body.style.cursor = 'default';
            if (!isSelected) {
                shape.shadowBlur(8);
                shape.y(shape.y() + 2);
                this.layer.batchDraw();
            }
        });

        this.layer.add(group);
    }

    addDecisionAnchors(group, element) {
        // YES anchor (top-right)
        const yesAnchor = new Konva.Circle({
            x: 35,
            y: -35,
            radius: 8,
            fill: '#10B981',
            stroke: 'white',
            strokeWidth: 2,
            opacity: 0.8
        });

        yesAnchor.on('click', (e) => {
            e.cancelBubble = true;
            this.startConnection(element.id, 'yes');
        });

        yesAnchor.on('mouseenter', () => {
            yesAnchor.scale({ x: 1.2, y: 1.2 });
            this.layer.batchDraw();
        });

        yesAnchor.on('mouseleave', () => {
            yesAnchor.scale({ x: 1, y: 1 });
            this.layer.batchDraw();
        });

        group.add(yesAnchor);

        // NO anchor (bottom-right)
        const noAnchor = new Konva.Circle({
            x: 35,
            y: 35,
            radius: 8,
            fill: '#EF4444',
            stroke: 'white',
            strokeWidth: 2,
            opacity: 0.8
        });

        noAnchor.on('click', (e) => {
            e.cancelBubble = true;
            this.startConnection(element.id, 'no');
        });

        noAnchor.on('mouseenter', () => {
            noAnchor.scale({ x: 1.2, y: 1.2 });
            this.layer.batchDraw();
        });

        noAnchor.on('mouseleave', () => {
            noAnchor.scale({ x: 1, y: 1 });
            this.layer.batchDraw();
        });

        group.add(noAnchor);
    }

    renderConnection(connection) {
        const fromElement = this.elements.find(e => e.id === connection.from);
        const toElement = this.elements.find(e => e.id === connection.to);

        if (!fromElement || !toElement) return;

        const color = connection.type === 'yes' ? '#10B981' :
                     connection.type === 'no' ? '#EF4444' : '#3B4A6B';

        // Calculate start and end points
        const startPos = { x: fromElement.x, y: fromElement.y };
        const endPos = { x: toElement.x, y: toElement.y };

        // Adjust for decision anchors
        if (fromElement.type === 'decision') {
            if (connection.type === 'yes') {
                startPos.y -= 35;
                startPos.x += 35;
            } else if (connection.type === 'no') {
                startPos.y += 35;
                startPos.x += 35;
            }
        }

        // Draw curved line
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;

        const line = new Konva.Line({
            points: [
                startPos.x, startPos.y,
                startPos.x + dx * 0.5, startPos.y,
                startPos.x + dx * 0.5, endPos.y,
                endPos.x, endPos.y
            ],
            stroke: color,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            tension: 0.5
        });

        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        const arrowSize = 10;

        const arrow = new Konva.Line({
            points: [
                0, 0,
                -arrowSize, -arrowSize / 2,
                -arrowSize, arrowSize / 2,
                0, 0
            ],
            fill: color,
            closed: true,
            x: endPos.x,
            y: endPos.y,
            rotation: (angle * 180 / Math.PI) + 90
        });

        // Add label for decision branches
        if (connection.label) {
            const labelX = startPos.x + dx * 0.25;
            const labelY = startPos.y + dy * 0.25;

            const label = new Konva.Text({
                x: labelX,
                y: labelY,
                text: connection.label,
                fontSize: 12,
                fontFamily: 'Inter',
                fontStyle: '600',
                fill: color,
                padding: 4,
                offsetX: 15,
                offsetY: 6
            });

            this.layer.add(label);
        }

        // Click to delete connection
        line.on('click', (e) => {
            e.cancelBubble = true;
            if (confirm('Delete this connection?')) {
                this.deleteConnection(connection.id);
            }
        });

        line.on('mouseenter', () => {
            line.strokeWidth(4);
            document.body.style.cursor = 'pointer';
            this.layer.batchDraw();
        });

        line.on('mouseleave', () => {
            line.strokeWidth(2);
            document.body.style.cursor = 'default';
            this.layer.batchDraw();
        });

        this.layer.add(line);
        this.layer.add(arrow);
    }

    // ============ SELECTION ============

    selectElement(elementId) {
        this.selectedElements = [elementId];
        this.renderWorkflow();
    }

    toggleSelection(elementId) {
        const index = this.selectedElements.indexOf(elementId);
        if (index > -1) {
            this.selectedElements.splice(index, 1);
        } else {
            this.selectedElements.push(elementId);
        }
        this.renderWorkflow();
    }

    clearSelection() {
        this.selectedElements = [];
        this.renderWorkflow();
    }

    selectAll() {
        this.selectedElements = this.elements.map(e => e.id);
        this.renderWorkflow();
    }

    // ============ DETAIL PANEL ============

    openDetailPanel(elementId) {
        const element = this.elements.find(e => e.id === elementId);
        if (!element) return;

        const panel = document.getElementById('detail-panel');
        const title = document.getElementById('detail-panel-title');
        const content = document.getElementById('detail-panel-content');

        title.textContent = this.capitalize(element.type) + ' Details';

        content.innerHTML = `
            <form id="element-form" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Name/Label *</label>
                    <input type="text" class="form-input" id="element-label"
                           value="${element.label}" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Tool/Platform</label>
                    <input type="text" class="form-input" id="element-tool"
                           value="${element.details.tool || ''}"
                           placeholder="e.g., Zapier, Gmail, Stripe">
                </div>

                ${element.type === 'action' ? `
                <div class="form-group">
                    <label class="form-label">Time Estimate</label>
                    <input type="text" class="form-input" id="element-time"
                           value="${element.details.time || ''}"
                           placeholder="e.g., 5 minutes, 2 hours">
                </div>

                <div class="form-group">
                    <label class="form-label">Assigned To</label>
                    <select class="form-select" id="element-assigned">
                        <option value="Automation" ${element.details.assignedTo === 'Automation' ? 'selected' : ''}>Automation</option>
                        <option value="Manual" ${element.details.assignedTo === 'Manual' ? 'selected' : ''}>Manual</option>
                        <option value="You" ${element.details.assignedTo === 'You' ? 'selected' : ''}>You</option>
                        <option value="Team" ${element.details.assignedTo === 'Team' ? 'selected' : ''}>Team</option>
                    </select>
                </div>
                ` : ''}

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="element-description"
                              placeholder="Describe what this step does...">${element.details.description || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-textarea" id="element-notes"
                              placeholder="Additional notes or instructions...">${element.details.notes || ''}</textarea>
                </div>
            </form>

            <div class="detail-actions">
                <button class="btn btn-primary" onclick="app.saveElementDetails('${elementId}')">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="btn btn-delete" onclick="app.deleteElement('${elementId}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        panel.classList.add('open');
    }

    closeDetailPanel() {
        const panel = document.getElementById('detail-panel');
        panel.classList.remove('open');
    }

    saveElementDetails(elementId) {
        const element = this.elements.find(e => e.id === elementId);
        if (!element) return;

        element.label = document.getElementById('element-label').value;
        element.details.tool = document.getElementById('element-tool')?.value || '';
        element.details.time = document.getElementById('element-time')?.value || '';
        element.details.assignedTo = document.getElementById('element-assigned')?.value || 'Automation';
        element.details.description = document.getElementById('element-description')?.value || '';
        element.details.notes = document.getElementById('element-notes')?.value || '';

        this.saveState();
        this.renderWorkflow();
        this.updateStats();
        this.closeDetailPanel();
    }

    // ============ ZOOM & PAN ============

    setZoom(newZoom) {
        this.zoom = Math.max(0.25, Math.min(3, newZoom));

        this.layer.scale({ x: this.zoom, y: this.zoom });
        this.drawGrid();
        this.layer.batchDraw();

        document.getElementById('zoom-display').textContent = Math.round(this.zoom * 100) + '%';
    }

    zoomIn() {
        this.setZoom(this.zoom * 1.2);
    }

    zoomOut() {
        this.setZoom(this.zoom / 1.2);
    }

    fitToScreen() {
        if (this.elements.length === 0) {
            this.setZoom(1);
            this.layer.position({ x: 0, y: 0 });
            this.layer.batchDraw();
            return;
        }

        // Calculate bounds
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.elements.forEach(el => {
            minX = Math.min(minX, el.x - 100);
            minY = Math.min(minY, el.y - 100);
            maxX = Math.max(maxX, el.x + 100);
            maxY = Math.max(maxY, el.y + 100);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        const scaleX = this.stage.width() / width;
        const scaleY = this.stage.height() / height;
        const newZoom = Math.min(scaleX, scaleY, 1) * 0.8;

        this.setZoom(newZoom);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.layer.position({
            x: this.stage.width() / 2 - centerX * this.zoom,
            y: this.stage.height() / 2 - centerY * this.zoom
        });

        this.layer.batchDraw();
    }

    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        this.drawGrid();

        const btn = document.getElementById('grid-toggle');
        btn.style.background = this.gridEnabled ? '#F8F9FA' : 'white';
    }

    // ============ STATISTICS ============

    updateStats() {
        let totalMinutes = 0;
        let manualCount = 0;
        let automatedCount = 0;

        this.elements.forEach(el => {
            if (el.type === 'action') {
                const time = el.details.time || '';
                const minutes = this.parseTimeToMinutes(time);
                totalMinutes += minutes;

                if (el.details.assignedTo === 'Manual' || el.details.assignedTo === 'You' || el.details.assignedTo === 'Team') {
                    manualCount++;
                } else {
                    automatedCount++;
                }
            }
        });

        document.getElementById('stat-total-time').textContent = this.formatMinutes(totalMinutes);
        document.getElementById('stat-manual').textContent = manualCount;
        document.getElementById('stat-automated').textContent = automatedCount;
        document.getElementById('stat-elements').textContent = this.elements.length;
    }

    parseTimeToMinutes(timeStr) {
        if (!timeStr) return 0;

        const hourMatch = timeStr.match(/(\d+)\s*h/i);
        const minMatch = timeStr.match(/(\d+)\s*m/i);

        let minutes = 0;
        if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
        if (minMatch) minutes += parseInt(minMatch[1]);

        return minutes;
    }

    formatMinutes(minutes) {
        if (minutes === 0) return '0m';

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}m`;
        }
    }

    toggleStats() {
        const content = document.getElementById('stats-content');
        const icon = document.getElementById('stats-toggle-icon');
        const panel = document.getElementById('stats-panel');

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.className = 'fas fa-chevron-up';
            panel.classList.remove('collapsed');
        } else {
            content.classList.add('hidden');
            icon.className = 'fas fa-chevron-down';
            panel.classList.add('collapsed');
        }
    }

    // ============ UNDO/REDO ============

    saveState() {
        const state = {
            elements: JSON.parse(JSON.stringify(this.elements)),
            connections: JSON.parse(JSON.stringify(this.connections))
        };

        // Remove future states if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Add new state
        this.history.push(state);

        // Limit history to 20 states
        if (this.history.length > 20) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex <= 0) return;

        this.historyIndex--;
        const state = this.history[this.historyIndex];

        this.elements = JSON.parse(JSON.stringify(state.elements));
        this.connections = JSON.parse(JSON.stringify(state.connections));

        this.renderWorkflow();
        this.updateStats();
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.historyIndex >= this.history.length - 1) return;

        this.historyIndex++;
        const state = this.history[this.historyIndex];

        this.elements = JSON.parse(JSON.stringify(state.elements));
        this.connections = JSON.parse(JSON.stringify(state.connections));

        this.renderWorkflow();
        this.updateStats();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    // ============ KEYBOARD SHORTCUTS ============

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.currentView !== 'editor') return;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                this.deleteSelectedElements();
            }

            // Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Redo
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
                e.preventDefault();
                this.redo();
            }

            // Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveWorkflow();
            }

            // Select All
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }

            // Escape
            if (e.key === 'Escape') {
                this.clearSelection();
                this.closeDetailPanel();
            }

            // Arrow keys for panning
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();

                const step = 20;
                const layer = this.layer;

                switch (e.key) {
                    case 'ArrowUp': layer.y(layer.y() + step); break;
                    case 'ArrowDown': layer.y(layer.y() - step); break;
                    case 'ArrowLeft': layer.x(layer.x() + step); break;
                    case 'ArrowRight': layer.x(layer.x() - step); break;
                }

                layer.batchDraw();
            }
        });
    }

    // ============ SAVE/LOAD ============

    saveWorkflow() {
        if (!this.currentWorkflow) return;

        this.currentWorkflow.elements = this.elements;
        this.currentWorkflow.connections = this.connections;
        this.currentWorkflow.lastEdited = new Date().toISOString();
        this.currentWorkflow.viewport = {
            zoom: this.zoom,
            offsetX: this.layer.x(),
            offsetY: this.layer.y()
        };

        const workflows = this.getWorkflows();
        const index = workflows.findIndex(w => w.id === this.currentWorkflow.id);

        if (index > -1) {
            workflows[index] = this.currentWorkflow;
        } else {
            workflows.push(this.currentWorkflow);
        }

        localStorage.setItem('savedWorkflows', JSON.stringify(workflows));

        // Show success message
        this.showToast('Workflow saved successfully!');
    }

    autoSave() {
        if (this.elements.length > 0 || this.connections.length > 0) {
            this.saveWorkflow();
        }
    }

    loadWorkflows() {
        // Workflows are loaded from localStorage
    }

    getWorkflows() {
        const data = localStorage.getItem('savedWorkflows');
        return data ? JSON.parse(data) : [];
    }

    hasUnsavedChanges() {
        // Simple check - compare current state with saved state
        return this.historyIndex > 0;
    }

    // ============ WORKFLOW DASHBOARD ============

    renderWorkflowGrid() {
        const grid = document.getElementById('workflow-grid');
        const emptyState = document.getElementById('empty-state');
        const workflows = this.getWorkflows();

        if (workflows.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        grid.innerHTML = workflows.map(workflow => `
            <div class="workflow-card" onclick="app.loadWorkflow('${workflow.id}')">
                <div class="workflow-card-header">
                    <h3 class="workflow-card-title">${workflow.title}</h3>
                    <button class="workflow-card-menu" onclick="event.stopPropagation(); app.showWorkflowMenu('${workflow.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                <div class="workflow-card-info">
                    Last edited: ${this.formatDate(workflow.lastEdited)}
                </div>
                <div class="workflow-card-stats">
                    <span><i class="fas fa-project-diagram"></i> ${workflow.elements?.length || 0} elements</span>
                    <span><i class="fas fa-link"></i> ${workflow.connections?.length || 0} connections</span>
                </div>
                <span class="folder-badge">${workflow.folder}</span>
            </div>
        `).join('');
    }

    showWorkflowMenu(workflowId) {
        const options = prompt('Choose an option:\n1. Duplicate\n2. Delete\n\nEnter number:');

        if (options === '1') {
            this.duplicateWorkflow(workflowId);
        } else if (options === '2') {
            this.deleteWorkflow(workflowId);
        }
    }

    searchWorkflows(query) {
        const workflows = this.getWorkflows();
        const filtered = workflows.filter(w =>
            w.title.toLowerCase().includes(query.toLowerCase())
        );

        const grid = document.getElementById('workflow-grid');

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6B7280; padding: 40px;">No workflows found</p>';
            return;
        }

        grid.innerHTML = filtered.map(workflow => `
            <div class="workflow-card" onclick="app.loadWorkflow('${workflow.id}')">
                <div class="workflow-card-header">
                    <h3 class="workflow-card-title">${workflow.title}</h3>
                    <button class="workflow-card-menu" onclick="event.stopPropagation(); app.showWorkflowMenu('${workflow.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                <div class="workflow-card-info">
                    Last edited: ${this.formatDate(workflow.lastEdited)}
                </div>
                <div class="workflow-card-stats">
                    <span><i class="fas fa-project-diagram"></i> ${workflow.elements?.length || 0} elements</span>
                    <span><i class="fas fa-link"></i> ${workflow.connections?.length || 0} connections</span>
                </div>
                <span class="folder-badge">${workflow.folder}</span>
            </div>
        `).join('');
    }

    updateWorkflowTitle() {
        if (this.currentWorkflow) {
            document.getElementById('workflow-title').textContent = this.currentWorkflow.title;
        }
    }

    // ============ TEMPLATES ============

    openTemplates() {
        const modal = document.getElementById('templates-modal');
        modal.classList.add('open');
        this.loadTemplates();
    }

    closeTemplatesModal() {
        const modal = document.getElementById('templates-modal');
        modal.classList.remove('open');
    }

    loadTemplates() {
        const templates = this.getTemplates();
        const grid = document.getElementById('template-grid');

        grid.innerHTML = templates.map((template, index) => `
            <div class="template-card" onclick="app.loadTemplate(${index})">
                <div class="template-title">
                    <i class="fas ${template.icon}"></i> ${template.title}
                </div>
                <div class="template-desc">${template.description}</div>
            </div>
        `).join('');
    }

    getTemplates() {
        return [
            {
                title: 'Client Onboarding',
                description: 'Automate client welcome process from contract to first meeting',
                icon: 'fa-handshake',
                workflow: this.createClientOnboardingTemplate()
            },
            {
                title: 'Email Nurture Sequence',
                description: 'Multi-step email campaign with engagement tracking',
                icon: 'fa-envelope',
                workflow: this.createEmailNurtureTemplate()
            },
            {
                title: 'Payment Follow-Up',
                description: 'Automated reminders and payment processing workflow',
                icon: 'fa-credit-card',
                workflow: this.createPaymentFollowUpTemplate()
            },
            {
                title: 'Social Media Automation',
                description: 'Schedule and cross-post content across platforms',
                icon: 'fa-share-alt',
                workflow: this.createSocialMediaTemplate()
            },
            {
                title: 'Content Repurposing',
                description: 'Turn one piece of content into multiple formats',
                icon: 'fa-recycle',
                workflow: this.createContentRepurposingTemplate()
            },
            {
                title: 'Lead Qualification',
                description: 'Score and route leads based on engagement',
                icon: 'fa-filter',
                workflow: this.createLeadQualificationTemplate()
            }
        ];
    }

    createClientOnboardingTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'Contract Signed', x: 400, y: 100, details: { tool: 'DocuSign', description: 'Webhook when contract completed', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Create Client Folder', x: 400, y: 220, details: { tool: 'Google Drive', description: 'Set up folder structure', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e3', type: 'action', label: 'Send Welcome Email', x: 400, y: 340, details: { tool: 'Gmail', description: 'Welcome email with next steps', assignedTo: 'Automation', time: '2 min', notes: '' } },
                { id: 'e4', type: 'action', label: 'Schedule Kickoff Call', x: 400, y: 460, details: { tool: 'Calendly', description: 'Book initial meeting', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e5', type: 'end', label: 'End', x: 400, y: 580, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e3', to: 'e4', type: 'default', label: '' },
                { id: 'c4', from: 'e4', to: 'e5', type: 'default', label: '' }
            ]
        };
    }

    createEmailNurtureTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'Lead Subscribed', x: 400, y: 100, details: { tool: 'ConvertKit', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Send Email 1', x: 400, y: 220, details: { tool: 'ConvertKit', description: 'Welcome email', assignedTo: 'Automation', time: '2 min', notes: '' } },
                { id: 'e3', type: 'action', label: 'Wait 3 Days', x: 400, y: 340, details: { tool: 'ConvertKit', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e4', type: 'action', label: 'Send Email 2', x: 400, y: 460, details: { tool: 'ConvertKit', description: 'Value email', assignedTo: 'Automation', time: '2 min', notes: '' } },
                { id: 'e5', type: 'decision', label: 'Opened Email?', x: 400, y: 600, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' }, branches: { yes: { label: 'YES', color: '#10B981' }, no: { label: 'NO', color: '#EF4444' } } },
                { id: 'e6', type: 'action', label: 'Send Offer', x: 250, y: 740, details: { tool: 'ConvertKit', description: '', assignedTo: 'Automation', time: '2 min', notes: '' } },
                { id: 'e7', type: 'action', label: 'Re-engage Sequence', x: 550, y: 740, details: { tool: 'ConvertKit', description: '', assignedTo: 'Automation', time: '5 min', notes: '' } },
                { id: 'e8', type: 'end', label: 'End', x: 400, y: 860, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e3', to: 'e4', type: 'default', label: '' },
                { id: 'c4', from: 'e4', to: 'e5', type: 'default', label: '' },
                { id: 'c5', from: 'e5', to: 'e6', type: 'yes', label: 'YES' },
                { id: 'c6', from: 'e5', to: 'e7', type: 'no', label: 'NO' },
                { id: 'c7', from: 'e6', to: 'e8', type: 'default', label: '' },
                { id: 'c8', from: 'e7', to: 'e8', type: 'default', label: '' }
            ]
        };
    }

    createPaymentFollowUpTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'Invoice Sent', x: 400, y: 100, details: { tool: 'Stripe', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Wait 7 Days', x: 400, y: 220, details: { tool: 'Zapier', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e3', type: 'decision', label: 'Payment Received?', x: 400, y: 360, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' }, branches: { yes: { label: 'YES', color: '#10B981' }, no: { label: 'NO', color: '#EF4444' } } },
                { id: 'e4', type: 'action', label: 'Send Thank You', x: 250, y: 500, details: { tool: 'Gmail', description: '', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e5', type: 'action', label: 'Send Reminder', x: 550, y: 500, details: { tool: 'Gmail', description: 'Friendly reminder', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e6', type: 'end', label: 'End', x: 250, y: 620, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e7', type: 'action', label: 'Escalate to Team', x: 550, y: 620, details: { tool: 'Slack', description: '', assignedTo: 'Manual', time: '10 min', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e3', to: 'e4', type: 'yes', label: 'YES' },
                { id: 'c4', from: 'e3', to: 'e5', type: 'no', label: 'NO' },
                { id: 'c5', from: 'e4', to: 'e6', type: 'default', label: '' },
                { id: 'c6', from: 'e5', to: 'e7', type: 'default', label: '' }
            ]
        };
    }

    createSocialMediaTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'New Blog Post', x: 400, y: 100, details: { tool: 'WordPress', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Create Social Posts', x: 400, y: 220, details: { tool: 'Buffer', description: 'Format for each platform', assignedTo: 'Automation', time: '5 min', notes: '' } },
                { id: 'e3', type: 'action', label: 'Post to Twitter', x: 250, y: 360, details: { tool: 'Buffer', description: '', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e4', type: 'action', label: 'Post to LinkedIn', x: 400, y: 360, details: { tool: 'Buffer', description: '', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e5', type: 'action', label: 'Post to Facebook', x: 550, y: 360, details: { tool: 'Buffer', description: '', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e6', type: 'end', label: 'End', x: 400, y: 500, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e2', to: 'e4', type: 'default', label: '' },
                { id: 'c4', from: 'e2', to: 'e5', type: 'default', label: '' },
                { id: 'c5', from: 'e3', to: 'e6', type: 'default', label: '' },
                { id: 'c6', from: 'e4', to: 'e6', type: 'default', label: '' },
                { id: 'c7', from: 'e5', to: 'e6', type: 'default', label: '' }
            ]
        };
    }

    createContentRepurposingTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'New Video Posted', x: 400, y: 100, details: { tool: 'YouTube', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Extract Audio', x: 400, y: 220, details: { tool: 'Descript', description: '', assignedTo: 'Automation', time: '10 min', notes: '' } },
                { id: 'e3', type: 'action', label: 'Create Podcast Episode', x: 250, y: 360, details: { tool: 'Anchor', description: '', assignedTo: 'Manual', time: '30 min', notes: '' } },
                { id: 'e4', type: 'action', label: 'Generate Transcript', x: 550, y: 360, details: { tool: 'Descript', description: '', assignedTo: 'Automation', time: '5 min', notes: '' } },
                { id: 'e5', type: 'action', label: 'Create Blog Post', x: 550, y: 500, details: { tool: 'WordPress', description: '', assignedTo: 'Manual', time: '60 min', notes: '' } },
                { id: 'e6', type: 'end', label: 'End', x: 400, y: 620, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e2', to: 'e4', type: 'default', label: '' },
                { id: 'c4', from: 'e4', to: 'e5', type: 'default', label: '' },
                { id: 'c5', from: 'e3', to: 'e6', type: 'default', label: '' },
                { id: 'c6', from: 'e5', to: 'e6', type: 'default', label: '' }
            ]
        };
    }

    createLeadQualificationTemplate() {
        return {
            elements: [
                { id: 'e1', type: 'trigger', label: 'Form Submitted', x: 400, y: 100, details: { tool: 'Typeform', description: '', assignedTo: 'Automation', time: '', notes: '' } },
                { id: 'e2', type: 'action', label: 'Calculate Lead Score', x: 400, y: 220, details: { tool: 'Zapier', description: 'Based on answers', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e3', type: 'decision', label: 'Score > 70?', x: 400, y: 360, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' }, branches: { yes: { label: 'YES', color: '#10B981' }, no: { label: 'NO', color: '#EF4444' } } },
                { id: 'e4', type: 'action', label: 'Notify Sales Team', x: 250, y: 500, details: { tool: 'Slack', description: 'Hot lead alert', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e5', type: 'action', label: 'Add to Nurture', x: 550, y: 500, details: { tool: 'ConvertKit', description: 'Educational sequence', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e6', type: 'action', label: 'Schedule Call', x: 250, y: 640, details: { tool: 'Calendly', description: '', assignedTo: 'Automation', time: '1 min', notes: '' } },
                { id: 'e7', type: 'end', label: 'End', x: 400, y: 760, details: { tool: '', description: '', assignedTo: 'Automation', time: '', notes: '' } }
            ],
            connections: [
                { id: 'c1', from: 'e1', to: 'e2', type: 'default', label: '' },
                { id: 'c2', from: 'e2', to: 'e3', type: 'default', label: '' },
                { id: 'c3', from: 'e3', to: 'e4', type: 'yes', label: 'YES' },
                { id: 'c4', from: 'e3', to: 'e5', type: 'no', label: 'NO' },
                { id: 'c5', from: 'e4', to: 'e6', type: 'default', label: '' },
                { id: 'c6', from: 'e6', to: 'e7', type: 'default', label: '' },
                { id: 'c7', from: 'e5', to: 'e7', type: 'default', label: '' }
            ]
        };
    }

    loadTemplate(index) {
        const templates = this.getTemplates();
        const template = templates[index];

        if (confirm(`Load the "${template.title}" template? This will replace your current workflow.`)) {
            this.elements = JSON.parse(JSON.stringify(template.workflow.elements));
            this.connections = JSON.parse(JSON.stringify(template.workflow.connections));

            if (!this.currentWorkflow) {
                this.currentWorkflow = {
                    id: this.generateId(),
                    title: template.title,
                    folder: 'General',
                    createdDate: new Date().toISOString(),
                    lastEdited: new Date().toISOString(),
                    elements: [],
                    connections: [],
                    viewport: { zoom: 1, offsetX: 0, offsetY: 0 }
                };
            } else {
                this.currentWorkflow.title = template.title;
            }

            this.saveState();
            this.renderWorkflow();
            this.updateStats();
            this.updateWorkflowTitle();
            this.closeTemplatesModal();
        }
    }

    // ============ EXPORT ============

    openExportModal() {
        const modal = document.getElementById('export-modal');
        modal.classList.add('open');
    }

    closeExportModal() {
        const modal = document.getElementById('export-modal');
        modal.classList.remove('open');
    }

    async exportPNG() {
        this.closeExportModal();
        this.showToast('Generating PNG...');

        // Temporarily fit to screen and hide UI elements
        const statsPanel = document.getElementById('stats-panel');
        const detailPanel = document.getElementById('detail-panel');

        statsPanel.style.display = 'none';
        detailPanel.style.display = 'none';

        this.fitToScreen();

        setTimeout(async () => {
            try {
                const canvas = await html2canvas(document.getElementById('canvas'), {
                    scale: 2,
                    backgroundColor: '#F8F9FA'
                });

                const link = document.createElement('a');
                link.download = `${this.currentWorkflow?.title || 'workflow'}.png`;
                link.href = canvas.toDataURL();
                link.click();

                this.showToast('PNG exported successfully!');
            } catch (error) {
                console.error('Export error:', error);
                this.showToast('Export failed. Please try again.');
            }

            statsPanel.style.display = 'block';
            detailPanel.style.display = 'block';
        }, 500);
    }

    async exportPDF() {
        this.closeExportModal();
        this.showToast('Generating PDF...');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text(this.currentWorkflow?.title || 'Workflow', 20, 20);

        // Add date
        doc.setFontSize(12);
        doc.text(`Created: ${this.formatDate(new Date().toISOString())}`, 20, 30);

        // Add statistics
        doc.setFontSize(14);
        doc.text('Statistics:', 20, 45);
        doc.setFontSize(11);
        doc.text(`Elements: ${this.elements.length}`, 30, 55);
        doc.text(`Connections: ${this.connections.length}`, 30, 62);
        doc.text(`Total Time: ${document.getElementById('stat-total-time').textContent}`, 30, 69);
        doc.text(`Manual Steps: ${document.getElementById('stat-manual').textContent}`, 30, 76);
        doc.text(`Automated Steps: ${document.getElementById('stat-automated').textContent}`, 30, 83);

        // Add workflow diagram
        const statsPanel = document.getElementById('stats-panel');
        const detailPanel = document.getElementById('detail-panel');

        statsPanel.style.display = 'none';
        detailPanel.style.display = 'none';

        this.fitToScreen();

        setTimeout(async () => {
            try {
                const canvas = await html2canvas(document.getElementById('canvas'), {
                    scale: 1.5,
                    backgroundColor: '#F8F9FA'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', 20, 95, imgWidth, imgHeight);

                doc.save(`${this.currentWorkflow?.title || 'workflow'}.pdf`);

                this.showToast('PDF exported successfully!');
            } catch (error) {
                console.error('Export error:', error);
                this.showToast('Export failed. Please try again.');
            }

            statsPanel.style.display = 'block';
            detailPanel.style.display = 'block';
        }, 500);
    }

    exportGuide() {
        this.closeExportModal();

        const guide = this.generateImplementationGuide();
        const blob = new Blob([guide], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${this.currentWorkflow?.title || 'workflow'}-guide.txt`;
        link.href = url;
        link.click();

        this.showToast('Implementation guide exported!');
    }

    generateImplementationGuide() {
        let guide = `IMPLEMENTATION GUIDE\n`;
        guide += `===================\n\n`;
        guide += `Workflow: ${this.currentWorkflow?.title || 'Untitled'}\n`;
        guide += `Generated: ${this.formatDate(new Date().toISOString())}\n\n`;

        guide += `OVERVIEW\n`;
        guide += `--------\n`;
        guide += `Total Steps: ${this.elements.length}\n`;
        guide += `Automated Steps: ${document.getElementById('stat-automated').textContent}\n`;
        guide += `Manual Steps: ${document.getElementById('stat-manual').textContent}\n`;
        guide += `Estimated Time: ${document.getElementById('stat-total-time').textContent}\n\n`;

        guide += `REQUIRED TOOLS\n`;
        guide += `--------------\n`;
        const tools = new Set(this.elements.map(e => e.details.tool).filter(t => t));
        tools.forEach(tool => {
            guide += `- ${tool}\n`;
        });
        guide += `\n`;

        guide += `STEP-BY-STEP INSTRUCTIONS\n`;
        guide += `-------------------------\n\n`;

        this.elements.forEach((element, index) => {
            guide += `${index + 1}. ${element.label}\n`;
            guide += `   Type: ${this.capitalize(element.type)}\n`;
            if (element.details.tool) {
                guide += `   Tool: ${element.details.tool}\n`;
            }
            if (element.details.assignedTo) {
                guide += `   Assigned To: ${element.details.assignedTo}\n`;
            }
            if (element.details.time) {
                guide += `   Time: ${element.details.time}\n`;
            }
            if (element.details.description) {
                guide += `   Description: ${element.details.description}\n`;
            }
            if (element.details.notes) {
                guide += `   Notes: ${element.details.notes}\n`;
            }
            guide += `\n`;
        });

        guide += `DECISION LOGIC\n`;
        guide += `-------------\n`;
        const decisions = this.elements.filter(e => e.type === 'decision');
        if (decisions.length > 0) {
            decisions.forEach(decision => {
                guide += `- ${decision.label}\n`;
                const yesConnection = this.connections.find(c => c.from === decision.id && c.type === 'yes');
                const noConnection = this.connections.find(c => c.from === decision.id && c.type === 'no');

                if (yesConnection) {
                    const yesElement = this.elements.find(e => e.id === yesConnection.to);
                    guide += `  YES → ${yesElement?.label || 'Unknown'}\n`;
                }
                if (noConnection) {
                    const noElement = this.elements.find(e => e.id === noConnection.to);
                    guide += `  NO → ${noElement?.label || 'Unknown'}\n`;
                }
                guide += `\n`;
            });
        } else {
            guide += `No decision points in this workflow.\n\n`;
        }

        guide += `TESTING CHECKLIST\n`;
        guide += `----------------\n`;
        guide += `☐ Test trigger activation\n`;
        guide += `☐ Verify all connections work\n`;
        guide += `☐ Test decision branches (if applicable)\n`;
        guide += `☐ Confirm notifications are sent\n`;
        guide += `☐ Review output data format\n`;
        guide += `☐ Run end-to-end test\n\n`;

        guide += `TROUBLESHOOTING\n`;
        guide += `--------------\n`;
        const notes = this.elements.map(e => e.details.notes).filter(n => n);
        if (notes.length > 0) {
            notes.forEach(note => {
                guide += `- ${note}\n`;
            });
        } else {
            guide += `No troubleshooting notes provided.\n`;
        }

        return guide;
    }

    exportJSON() {
        this.closeExportModal();

        const blueprint = {
            workflow: {
                id: this.currentWorkflow?.id,
                title: this.currentWorkflow?.title,
                created: this.currentWorkflow?.createdDate,
                trigger: this.elements.find(e => e.type === 'trigger'),
                actions: this.elements.filter(e => e.type === 'action'),
                decisions: this.elements.filter(e => e.type === 'decision'),
                connections: this.connections,
                stats: {
                    totalTime: document.getElementById('stat-total-time').textContent,
                    manualSteps: parseInt(document.getElementById('stat-manual').textContent),
                    automatedSteps: parseInt(document.getElementById('stat-automated').textContent),
                    totalElements: this.elements.length
                }
            }
        };

        const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${this.currentWorkflow?.title || 'workflow'}-blueprint.json`;
        link.href = url;
        link.click();

        this.showToast('JSON blueprint exported!');
    }

    // ============ UTILITIES ============

    generateId() {
        return 'elem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #3B4A6B;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the app
const app = new WorkflowMapper();
