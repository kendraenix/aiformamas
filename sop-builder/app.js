// SOP Builder App - Main JavaScript

class SOPBuilder {
    constructor() {
        this.currentSOP = null;
        this.currentSection = 0;
        this.autoSaveInterval = null;
        this.templates = this.getTemplates();
        this.folders = ['All', 'Client', 'Revenue', 'Operations', 'Marketing', 'Admin'];
        this.currentFolder = 'All';

        this.init();
    }

    init() {
        this.loadTemplateLibrary();
        this.loadDashboard();
        this.setupAutoSave();
    }

    getTemplates() {
        return [
            {
                id: 'client-onboarding',
                name: 'Client Onboarding',
                icon: 'fa-user-plus',
                description: 'Complete workflow for onboarding new clients from contract to kickoff',
                folder: 'Client'
            },
            {
                id: 'client-delivery',
                name: 'Client Delivery',
                icon: 'fa-box',
                description: 'Process for delivering projects and managing client expectations',
                folder: 'Client'
            },
            {
                id: 'sales-process',
                name: 'Sales Process',
                icon: 'fa-handshake',
                description: 'End-to-end sales workflow from lead to closed deal',
                folder: 'Revenue'
            },
            {
                id: 'invoicing',
                name: 'Invoicing & Payment',
                icon: 'fa-file-invoice-dollar',
                description: 'Billing, invoicing, and payment collection procedures',
                folder: 'Revenue'
            },
            {
                id: 'content-creation',
                name: 'Content Creation',
                icon: 'fa-pen-fancy',
                description: 'Content ideation, creation, editing, and publishing workflow',
                folder: 'Marketing'
            },
            {
                id: 'email-management',
                name: 'Email Management',
                icon: 'fa-envelope',
                description: 'System for processing, responding to, and organizing emails',
                folder: 'Operations'
            },
            {
                id: 'social-scheduling',
                name: 'Social Scheduling',
                icon: 'fa-calendar-alt',
                description: 'Social media content planning and scheduling process',
                folder: 'Marketing'
            },
            {
                id: 'bookkeeping',
                name: 'Bookkeeping Handoff',
                icon: 'fa-calculator',
                description: 'Monthly bookkeeping prep and accountant handoff',
                folder: 'Admin'
            },
            {
                id: 'team-training',
                name: 'Team Training',
                icon: 'fa-chalkboard-teacher',
                description: 'Onboarding and training process for new team members',
                folder: 'Operations'
            },
            {
                id: 'custom',
                name: 'Start from Blank',
                icon: 'fa-file',
                description: 'Create a custom SOP from scratch',
                folder: 'All'
            }
        ];
    }

    loadTemplateLibrary() {
        const grid = document.getElementById('templateGrid');
        grid.innerHTML = '';

        this.templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.onclick = () => this.selectTemplate(template);
            card.innerHTML = `
                <div class="template-icon">
                    <i class="fas ${template.icon}"></i>
                </div>
                <h3>${template.name}</h3>
                <p>${template.description}</p>
            `;
            grid.appendChild(card);
        });
    }

    selectTemplate(template) {
        this.currentSOP = {
            id: this.generateId(),
            title: template.name === 'Start from Blank' ? 'Untitled SOP' : template.name,
            template: template.id,
            folder: template.folder,
            createdDate: new Date().toISOString(),
            lastEdited: new Date().toISOString(),
            sections: {
                overview: '',
                prerequisites: [],
                steps: [],
                decisionTrees: [],
                mistakes: [],
                resources: []
            }
        };

        this.showBuilder();
    }

    showBuilder() {
        document.getElementById('templateLibrary').classList.remove('active');
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('builderView').classList.add('active');
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('bottomBar').style.display = 'flex';

        this.currentSection = 0;
        this.renderSection();
        this.updateProgressBar();
    }

    showTemplates() {
        document.getElementById('builderView').classList.remove('active');
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('templateLibrary').classList.add('active');
        document.getElementById('progressBar').style.display = 'none';
        document.getElementById('bottomBar').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('builderView').classList.remove('active');
        document.getElementById('templateLibrary').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('progressBar').style.display = 'none';
        document.getElementById('bottomBar').style.display = 'none';

        this.loadDashboard();
    }

    createNewSOP() {
        this.showTemplates();
    }

    renderSection() {
        const sections = [
            this.renderOverview,
            this.renderPrerequisites,
            this.renderSteps,
            this.renderDecisionTrees,
            this.renderMistakes,
            this.renderResources
        ];

        const editPane = document.getElementById('editPane');
        editPane.innerHTML = '';
        sections[this.currentSection].call(this, editPane);

        this.updatePreview();
        this.updateNavigationButtons();
    }

    renderOverview(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-info-circle"></i>
                <h2>Part 1: Process Overview</h2>
            </div>
            <p class="section-description">What is this process? When do you do it? What's the end result?</p>
            <div class="form-group">
                <label class="form-label">SOP Title</label>
                <input type="text" class="form-input" id="sopTitle"
                    value="${this.currentSOP.title}"
                    oninput="app.updateSOPTitle(this.value)"
                    placeholder="e.g., Client Onboarding Workflow">
            </div>
            <div class="form-group">
                <label class="form-label">Process Overview (2-3 sentences)</label>
                <textarea class="form-textarea" id="overview"
                    oninput="app.updateOverview(this.value)"
                    placeholder="Example: This SOP covers client onboarding from signed contract to project kickoff. Use this process every time a new client signs. The end result is a fully onboarded client ready to begin project work.">${this.currentSOP.sections.overview}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Folder</label>
                <select class="form-input" id="sopFolder" onchange="app.updateFolder(this.value)">
                    ${this.folders.filter(f => f !== 'All').map(f =>
                        `<option value="${f}" ${this.currentSOP.folder === f ? 'selected' : ''}>${f}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }

    renderPrerequisites(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-check-square"></i>
                <h2>Part 2: Prerequisites</h2>
            </div>
            <p class="section-description">What needs to exist before you start this process? (Tools, documents, information, people)</p>
            <div class="checklist-items" id="prerequisitesList"></div>
            <button class="btn btn-add" onclick="app.addPrerequisite()">
                <i class="fas fa-plus"></i> Add Prerequisite
            </button>
        `;

        this.renderPrerequisitesList();
    }

    renderPrerequisitesList() {
        const list = document.getElementById('prerequisitesList');
        if (!list) return;

        list.innerHTML = '';
        this.currentSOP.sections.prerequisites.forEach((prereq, index) => {
            const item = document.createElement('div');
            item.className = 'checklist-item';
            item.innerHTML = `
                <input type="text" class="form-input"
                    value="${prereq}"
                    oninput="app.updatePrerequisite(${index}, this.value)"
                    placeholder="e.g., Signed contract in DocuSign">
                <button class="icon-btn" onclick="app.removePrerequisite(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(item);
        });
    }

    renderSteps(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-list-ol"></i>
                <h2>Part 3: Step-by-Step Instructions</h2>
            </div>
            <p class="section-description">Number every step. Be specific. Use action verbs.</p>
            <div class="steps-list" id="stepsList"></div>
            <button class="btn btn-add" onclick="app.addStep()">
                <i class="fas fa-plus"></i> Add Step
            </button>
        `;

        this.renderStepsList();
        this.initializeDragAndDrop();
    }

    renderStepsList() {
        const list = document.getElementById('stepsList');
        if (!list) return;

        list.innerHTML = '';
        this.currentSOP.sections.steps.forEach((step, index) => {
            const card = document.createElement('div');
            card.className = 'step-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="step-header">
                    <i class="fas fa-grip-vertical drag-handle"></i>
                    <div class="step-number">${index + 1}</div>
                    <div class="step-actions">
                        <button class="icon-btn" onclick="app.removeStep(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="step-content">
                    <input type="text" class="form-input step-text"
                        value="${step.text}"
                        oninput="app.updateStep(${index}, 'text', this.value)"
                        placeholder="e.g., Verify payment in Stripe">
                    <div class="step-meta">
                        <div>
                            <label style="font-size: 0.8rem; color: #666;">Time estimate:</label>
                            <input type="text" class="form-input small-input"
                                value="${step.time || ''}"
                                oninput="app.updateStep(${index}, 'time', this.value)"
                                placeholder="e.g., 2 min"
                                style="display: inline-block; width: 100px; margin-left: 0.5rem;">
                        </div>
                        <div>
                            <label style="font-size: 0.8rem; color: #666;">Assigned to:</label>
                            <select class="select-input"
                                onchange="app.updateStep(${index}, 'assignedTo', this.value)"
                                style="display: inline-block; margin-left: 0.5rem;">
                                <option value="" ${!step.assignedTo ? 'selected' : ''}>None</option>
                                <option value="You" ${step.assignedTo === 'You' ? 'selected' : ''}>You</option>
                                <option value="VA" ${step.assignedTo === 'VA' ? 'selected' : ''}>VA</option>
                                <option value="Team" ${step.assignedTo === 'Team' ? 'selected' : ''}>Team</option>
                                <option value="Automation" ${step.assignedTo === 'Automation' ? 'selected' : ''}>Automation</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    renderDecisionTrees(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-code-branch"></i>
                <h2>Part 4: Decision Trees</h2>
            </div>
            <p class="section-description">What if scenarios. Use IF/THEN format.</p>
            <div class="decision-items" id="decisionList"></div>
            <button class="btn btn-add" onclick="app.addDecision()">
                <i class="fas fa-plus"></i> Add Decision Tree
            </button>
        `;

        this.renderDecisionList();
    }

    renderDecisionList() {
        const list = document.getElementById('decisionList');
        if (!list) return;

        list.innerHTML = '';
        this.currentSOP.sections.decisionTrees.forEach((decision, index) => {
            const item = document.createElement('div');
            item.className = 'decision-item';
            item.innerHTML = `
                <div class="decision-item-header">
                    <strong>Decision ${index + 1}</strong>
                    <button class="icon-btn" onclick="app.removeDecision(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label class="form-label">IF (Condition)</label>
                    <input type="text" class="form-input"
                        value="${decision.condition}"
                        oninput="app.updateDecision(${index}, 'condition', this.value)"
                        placeholder="e.g., IF payment not received within 48 hours">
                </div>
                <div class="form-group">
                    <label class="form-label">THEN (Action)</label>
                    <input type="text" class="form-input"
                        value="${decision.action}"
                        oninput="app.updateDecision(${index}, 'action', this.value)"
                        placeholder="e.g., THEN send payment reminder email and pause onboarding">
                </div>
            `;
            list.appendChild(item);
        });
    }

    renderMistakes(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Part 5: Common Mistakes</h2>
            </div>
            <p class="section-description">What errors have you made? How can others avoid them?</p>
            <div class="mistake-items" id="mistakeList"></div>
            <button class="btn btn-add" onclick="app.addMistake()">
                <i class="fas fa-plus"></i> Add Mistake
            </button>
        `;

        this.renderMistakeList();
    }

    renderMistakeList() {
        const list = document.getElementById('mistakeList');
        if (!list) return;

        list.innerHTML = '';
        this.currentSOP.sections.mistakes.forEach((mistake, index) => {
            const item = document.createElement('div');
            item.className = 'mistake-item';
            item.innerHTML = `
                <div class="mistake-item-header">
                    <strong>Mistake ${index + 1}</strong>
                    <button class="icon-btn" onclick="app.removeMistake(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label class="form-label">❌ Mistake</label>
                    <input type="text" class="form-input"
                        value="${mistake.mistake}"
                        oninput="app.updateMistake(${index}, 'mistake', this.value)"
                        placeholder="e.g., Sending welcome email before payment confirmed">
                </div>
                <div class="form-group">
                    <label class="form-label">✅ Fix</label>
                    <input type="text" class="form-input"
                        value="${mistake.fix}"
                        oninput="app.updateMistake(${index}, 'fix', this.value)"
                        placeholder="e.g., Always verify payment in Stripe first">
                </div>
            `;
            list.appendChild(item);
        });
    }

    renderResources(container) {
        container.innerHTML = `
            <div class="section-header">
                <i class="fas fa-link"></i>
                <h2>Part 6: Resources & Links</h2>
            </div>
            <p class="section-description">List everything needed to complete the process.</p>
            <div class="resource-items" id="resourceList"></div>
            <button class="btn btn-add" onclick="app.addResource()">
                <i class="fas fa-plus"></i> Add Resource
            </button>
        `;

        this.renderResourceList();
    }

    renderResourceList() {
        const list = document.getElementById('resourceList');
        if (!list) return;

        list.innerHTML = '';
        this.currentSOP.sections.resources.forEach((resource, index) => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            item.innerHTML = `
                <div class="resource-item-header">
                    <strong>Resource ${index + 1}</strong>
                    <button class="icon-btn" onclick="app.removeResource(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="resource-fields">
                    <select class="select-input" onchange="app.updateResource(${index}, 'category', this.value)">
                        <option value="Templates" ${resource.category === 'Templates' ? 'selected' : ''}>Templates</option>
                        <option value="Tools" ${resource.category === 'Tools' ? 'selected' : ''}>Tools</option>
                        <option value="Contacts" ${resource.category === 'Contacts' ? 'selected' : ''}>Contacts</option>
                    </select>
                    <input type="text" class="form-input"
                        value="${resource.name}"
                        oninput="app.updateResource(${index}, 'name', this.value)"
                        placeholder="Resource name">
                    <input type="text" class="form-input"
                        value="${resource.link}"
                        oninput="app.updateResource(${index}, 'link', this.value)"
                        placeholder="URL">
                </div>
            `;
            list.appendChild(item);
        });
    }

    // Update methods
    updateSOPTitle(value) {
        this.currentSOP.title = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    updateOverview(value) {
        this.currentSOP.sections.overview = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    updateFolder(value) {
        this.currentSOP.folder = value;
        this.triggerAutoSave();
    }

    addPrerequisite() {
        this.currentSOP.sections.prerequisites.push('');
        this.renderPrerequisitesList();
        this.updatePreview();
    }

    updatePrerequisite(index, value) {
        this.currentSOP.sections.prerequisites[index] = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    removePrerequisite(index) {
        this.currentSOP.sections.prerequisites.splice(index, 1);
        this.renderPrerequisitesList();
        this.updatePreview();
        this.triggerAutoSave();
    }

    addStep() {
        this.currentSOP.sections.steps.push({
            id: this.generateId(),
            order: this.currentSOP.sections.steps.length,
            text: '',
            time: '',
            assignedTo: ''
        });
        this.renderStepsList();
        this.initializeDragAndDrop();
        this.updatePreview();
    }

    updateStep(index, field, value) {
        this.currentSOP.sections.steps[index][field] = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    removeStep(index) {
        this.currentSOP.sections.steps.splice(index, 1);
        this.renderStepsList();
        this.initializeDragAndDrop();
        this.updatePreview();
        this.triggerAutoSave();
    }

    addDecision() {
        this.currentSOP.sections.decisionTrees.push({
            condition: '',
            action: ''
        });
        this.renderDecisionList();
        this.updatePreview();
    }

    updateDecision(index, field, value) {
        this.currentSOP.sections.decisionTrees[index][field] = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    removeDecision(index) {
        this.currentSOP.sections.decisionTrees.splice(index, 1);
        this.renderDecisionList();
        this.updatePreview();
        this.triggerAutoSave();
    }

    addMistake() {
        this.currentSOP.sections.mistakes.push({
            mistake: '',
            fix: ''
        });
        this.renderMistakeList();
        this.updatePreview();
    }

    updateMistake(index, field, value) {
        this.currentSOP.sections.mistakes[index][field] = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    removeMistake(index) {
        this.currentSOP.sections.mistakes.splice(index, 1);
        this.renderMistakeList();
        this.updatePreview();
        this.triggerAutoSave();
    }

    addResource() {
        this.currentSOP.sections.resources.push({
            category: 'Tools',
            name: '',
            link: ''
        });
        this.renderResourceList();
        this.updatePreview();
    }

    updateResource(index, field, value) {
        this.currentSOP.sections.resources[index][field] = value;
        this.updatePreview();
        this.triggerAutoSave();
    }

    removeResource(index) {
        this.currentSOP.sections.resources.splice(index, 1);
        this.renderResourceList();
        this.updatePreview();
        this.triggerAutoSave();
    }

    // Drag and drop
    initializeDragAndDrop() {
        const list = document.getElementById('stepsList');
        if (!list || !window.Sortable) return;

        new Sortable(list, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: (evt) => {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                const [movedItem] = this.currentSOP.sections.steps.splice(oldIndex, 1);
                this.currentSOP.sections.steps.splice(newIndex, 0, movedItem);

                this.renderStepsList();
                this.initializeDragAndDrop();
                this.updatePreview();
                this.triggerAutoSave();
            }
        });
    }

    // Preview
    updatePreview() {
        const preview = document.getElementById('previewContent');
        const sop = this.currentSOP;

        let html = `<div class="preview-title">${sop.title}</div>`;

        // Overview
        if (sop.sections.overview) {
            html += `
                <div class="preview-section">
                    <h3>1. Process Overview</h3>
                    <p>${sop.sections.overview}</p>
                </div>
            `;
        }

        // Prerequisites
        if (sop.sections.prerequisites.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>2. Prerequisites</h3>
                    <ul class="preview-checklist">
                        ${sop.sections.prerequisites.filter(p => p).map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Steps
        if (sop.sections.steps.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>3. Step-by-Step Instructions</h3>
                    <ol class="preview-steps">
                        ${sop.sections.steps.filter(s => s.text).map(s => {
                            let meta = '';
                            if (s.time || s.assignedTo) {
                                const parts = [];
                                if (s.time) parts.push(`${s.time}`);
                                if (s.assignedTo) parts.push(`Assigned to: ${s.assignedTo}`);
                                meta = ` <span style="color: #666; font-size: 0.9rem;">(${parts.join(', ')})</span>`;
                            }
                            return `<li>${s.text}${meta}</li>`;
                        }).join('')}
                    </ol>
                </div>
            `;
        }

        // Decision Trees
        if (sop.sections.decisionTrees.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>4. Decision Trees</h3>
                    ${sop.sections.decisionTrees.filter(d => d.condition && d.action).map(d => `
                        <div class="preview-decision">
                            <div class="condition">${d.condition}</div>
                            <div class="action">→ ${d.action}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Mistakes
        if (sop.sections.mistakes.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>5. Common Mistakes</h3>
                    ${sop.sections.mistakes.filter(m => m.mistake && m.fix).map(m => `
                        <div class="preview-mistake">
                            <div class="mistake-text">${m.mistake}</div>
                            <div class="fix-text">${m.fix}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Resources
        if (sop.sections.resources.length > 0) {
            const byCategory = {
                Templates: [],
                Tools: [],
                Contacts: []
            };

            sop.sections.resources.filter(r => r.name).forEach(r => {
                byCategory[r.category].push(r);
            });

            html += `<div class="preview-section"><h3>6. Resources & Links</h3>`;

            Object.keys(byCategory).forEach(category => {
                if (byCategory[category].length > 0) {
                    html += `
                        <div class="resource-category">${category}</div>
                        <ul class="preview-resources">
                            ${byCategory[category].map(r =>
                                `<li><a href="${r.link}" target="_blank">${r.name}</a></li>`
                            ).join('')}
                        </ul>
                    `;
                }
            });

            html += `</div>`;
        }

        preview.innerHTML = html;
    }

    // Navigation
    updateProgressBar() {
        document.getElementById('currentStep').textContent = this.currentSection + 1;

        const progressBar = document.getElementById('progressBarFill');
        progressBar.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const segment = document.createElement('div');
            segment.className = 'progress-segment';

            if (i < this.currentSection) {
                segment.classList.add('completed');
            } else if (i === this.currentSection) {
                segment.classList.add('current');
            }

            segment.onclick = () => this.goToSection(i);
            progressBar.appendChild(segment);
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentSection === 0;
        prevBtn.style.opacity = this.currentSection === 0 ? '0.5' : '1';

        if (this.currentSection === 5) {
            nextBtn.innerHTML = '<i class="fas fa-download"></i> Export';
            nextBtn.onclick = () => this.openExportModal();
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            nextBtn.onclick = () => this.nextSection();
        }
    }

    nextSection() {
        if (this.currentSection < 5) {
            this.currentSection++;
            this.renderSection();
            this.updateProgressBar();
        }
    }

    previousSection() {
        if (this.currentSection > 0) {
            this.currentSection--;
            this.renderSection();
            this.updateProgressBar();
        }
    }

    goToSection(index) {
        this.currentSection = index;
        this.renderSection();
        this.updateProgressBar();
    }

    // Auto-save
    setupAutoSave() {
        this.autoSaveTimeout = null;
    }

    triggerAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveDraft();
        }, 2000); // Auto-save 2 seconds after last edit
    }

    saveDraft() {
        if (!this.currentSOP) return;

        this.currentSOP.lastEdited = new Date().toISOString();

        // Get existing SOPs
        let sops = JSON.parse(localStorage.getItem('completedSOPs') || '[]');

        // Update or add current SOP
        const index = sops.findIndex(s => s.id === this.currentSOP.id);
        if (index >= 0) {
            sops[index] = this.currentSOP;
        } else {
            sops.push(this.currentSOP);
        }

        localStorage.setItem('completedSOPs', JSON.stringify(sops));

        // Show save indicator
        const indicator = document.getElementById('saveIndicator');
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    // Dashboard
    loadDashboard() {
        this.renderFolderTabs();
        this.renderSOPGrid();
    }

    renderFolderTabs() {
        const tabs = document.getElementById('folderTabs');
        tabs.innerHTML = '';

        this.folders.forEach(folder => {
            const tab = document.createElement('div');
            tab.className = 'folder-tab';
            if (folder === this.currentFolder) {
                tab.classList.add('active');
            }
            tab.textContent = folder;
            tab.onclick = () => {
                this.currentFolder = folder;
                this.loadDashboard();
            };
            tabs.appendChild(tab);
        });
    }

    renderSOPGrid() {
        const grid = document.getElementById('sopGrid');
        const sops = JSON.parse(localStorage.getItem('completedSOPs') || '[]');

        // Filter by folder and search
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        let filtered = sops;

        if (this.currentFolder !== 'All') {
            filtered = filtered.filter(s => s.folder === this.currentFolder);
        }

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(searchTerm) ||
                s.sections.overview.toLowerCase().includes(searchTerm)
            );
        }

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No SOPs found. Create your first one!</p>
                </div>
            `;
            return;
        }

        filtered.forEach(sop => {
            const card = document.createElement('div');
            card.className = 'sop-card';

            const lastEdited = new Date(sop.lastEdited);
            const daysAgo = Math.floor((Date.now() - lastEdited) / (1000 * 60 * 60 * 24));
            let timeText = 'Today';
            if (daysAgo === 1) timeText = '1 day ago';
            else if (daysAgo > 1) timeText = `${daysAgo} days ago`;

            card.innerHTML = `
                <h3>${sop.title}</h3>
                <div class="meta">
                    <i class="fas fa-folder"></i> ${sop.folder} |
                    <i class="fas fa-clock"></i> ${timeText}
                </div>
                <div class="actions">
                    <button class="btn btn-primary" onclick="app.editSOP('${sop.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="app.duplicateSOP('${sop.id}')">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                    <button class="btn btn-ghost" onclick="app.deleteSOP('${sop.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    searchSOPs() {
        this.renderSOPGrid();
    }

    editSOP(id) {
        const sops = JSON.parse(localStorage.getItem('completedSOPs') || '[]');
        this.currentSOP = sops.find(s => s.id === id);
        if (this.currentSOP) {
            this.showBuilder();
        }
    }

    duplicateSOP(id) {
        const sops = JSON.parse(localStorage.getItem('completedSOPs') || '[]');
        const original = sops.find(s => s.id === id);
        if (original) {
            const duplicate = JSON.parse(JSON.stringify(original));
            duplicate.id = this.generateId();
            duplicate.title = original.title + ' (Copy)';
            duplicate.createdDate = new Date().toISOString();
            duplicate.lastEdited = new Date().toISOString();

            sops.push(duplicate);
            localStorage.setItem('completedSOPs', JSON.stringify(sops));
            this.loadDashboard();
        }
    }

    deleteSOP(id) {
        if (confirm('Are you sure you want to delete this SOP?')) {
            let sops = JSON.parse(localStorage.getItem('completedSOPs') || '[]');
            sops = sops.filter(s => s.id !== id);
            localStorage.setItem('completedSOPs', JSON.stringify(sops));
            this.loadDashboard();
        }
    }

    // Export
    openExportModal() {
        this.saveDraft();
        document.getElementById('exportModal').classList.add('active');
    }

    closeExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    }

    exportPDF() {
        const element = document.getElementById('previewContent');
        const opt = {
            margin: 1,
            filename: `${this.currentSOP.title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
        this.closeExportModal();
    }

    exportWord() {
        // For simplicity, we'll export as HTML that can be opened in Word
        const content = document.getElementById('previewContent').innerHTML;
        const blob = new Blob([`
            <html>
            <head>
                <meta charset="utf-8">
                <title>${this.currentSOP.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; }
                    h1 { color: #3B4A6B; border-bottom: 3px solid #D4AF37; padding-bottom: 10px; }
                    h3 { color: #3B4A6B; border-bottom: 2px solid #D4AF37; padding-bottom: 5px; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `], { type: 'application/msword' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSOP.title}.doc`;
        a.click();
        URL.revokeObjectURL(url);

        this.closeExportModal();
    }

    exportNotion() {
        const sop = this.currentSOP;
        let markdown = `# ${sop.title}\n\n`;

        if (sop.sections.overview) {
            markdown += `## 1. Process Overview\n\n${sop.sections.overview}\n\n`;
        }

        if (sop.sections.prerequisites.length > 0) {
            markdown += `## 2. Prerequisites\n\n`;
            sop.sections.prerequisites.forEach(p => {
                if (p) markdown += `- [ ] ${p}\n`;
            });
            markdown += '\n';
        }

        if (sop.sections.steps.length > 0) {
            markdown += `## 3. Step-by-Step Instructions\n\n`;
            sop.sections.steps.forEach((s, i) => {
                if (s.text) {
                    markdown += `${i + 1}. ${s.text}`;
                    const meta = [];
                    if (s.time) meta.push(s.time);
                    if (s.assignedTo) meta.push(`Assigned to: ${s.assignedTo}`);
                    if (meta.length > 0) markdown += ` *(${meta.join(', ')})*`;
                    markdown += '\n';
                }
            });
            markdown += '\n';
        }

        if (sop.sections.decisionTrees.length > 0) {
            markdown += `## 4. Decision Trees\n\n`;
            sop.sections.decisionTrees.forEach(d => {
                if (d.condition && d.action) {
                    markdown += `**${d.condition}**\n→ ${d.action}\n\n`;
                }
            });
        }

        if (sop.sections.mistakes.length > 0) {
            markdown += `## 5. Common Mistakes\n\n`;
            sop.sections.mistakes.forEach(m => {
                if (m.mistake && m.fix) {
                    markdown += `❌ **Mistake:** ${m.mistake}\n✅ **Fix:** ${m.fix}\n\n`;
                }
            });
        }

        if (sop.sections.resources.length > 0) {
            markdown += `## 6. Resources & Links\n\n`;
            const byCategory = { Templates: [], Tools: [], Contacts: [] };
            sop.sections.resources.forEach(r => {
                if (r.name) byCategory[r.category].push(r);
            });

            Object.keys(byCategory).forEach(cat => {
                if (byCategory[cat].length > 0) {
                    markdown += `### ${cat}\n\n`;
                    byCategory[cat].forEach(r => {
                        markdown += `- [${r.name}](${r.link})\n`;
                    });
                    markdown += '\n';
                }
            });
        }

        // Copy to clipboard
        navigator.clipboard.writeText(markdown).then(() => {
            alert('Notion-formatted content copied to clipboard! Paste it into your Notion page.');
            this.closeExportModal();
        });
    }

    exportPlainText() {
        const sop = this.currentSOP;
        let text = `${sop.title}\n${'='.repeat(sop.title.length)}\n\n`;

        if (sop.sections.overview) {
            text += `1. PROCESS OVERVIEW\n\n${sop.sections.overview}\n\n`;
        }

        if (sop.sections.prerequisites.length > 0) {
            text += `2. PREREQUISITES\n\n`;
            sop.sections.prerequisites.forEach(p => {
                if (p) text += `☐ ${p}\n`;
            });
            text += '\n';
        }

        if (sop.sections.steps.length > 0) {
            text += `3. STEP-BY-STEP INSTRUCTIONS\n\n`;
            sop.sections.steps.forEach((s, i) => {
                if (s.text) {
                    text += `${i + 1}. ${s.text}`;
                    const meta = [];
                    if (s.time) meta.push(s.time);
                    if (s.assignedTo) meta.push(`Assigned to: ${s.assignedTo}`);
                    if (meta.length > 0) text += ` (${meta.join(', ')})`;
                    text += '\n';
                }
            });
            text += '\n';
        }

        if (sop.sections.decisionTrees.length > 0) {
            text += `4. DECISION TREES\n\n`;
            sop.sections.decisionTrees.forEach(d => {
                if (d.condition && d.action) {
                    text += `${d.condition}\n→ ${d.action}\n\n`;
                }
            });
        }

        if (sop.sections.mistakes.length > 0) {
            text += `5. COMMON MISTAKES\n\n`;
            sop.sections.mistakes.forEach(m => {
                if (m.mistake && m.fix) {
                    text += `❌ ${m.mistake}\n✅ ${m.fix}\n\n`;
                }
            });
        }

        if (sop.sections.resources.length > 0) {
            text += `6. RESOURCES & LINKS\n\n`;
            const byCategory = { Templates: [], Tools: [], Contacts: [] };
            sop.sections.resources.forEach(r => {
                if (r.name) byCategory[r.category].push(r);
            });

            Object.keys(byCategory).forEach(cat => {
                if (byCategory[cat].length > 0) {
                    text += `${cat}:\n`;
                    byCategory[cat].forEach(r => {
                        text += `- ${r.name}: ${r.link}\n`;
                    });
                    text += '\n';
                }
            });
        }

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Plain text copied to clipboard!');
            this.closeExportModal();
        });
    }

    // Utilities
    generateId() {
        return 'sop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize app
const app = new SOPBuilder();
