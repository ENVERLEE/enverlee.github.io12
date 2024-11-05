// project.js
class ProjectManager {
    constructor(projectId) {
        this.projectId = projectId;
        this.currentStep = 1;
        this.researchSteps = [];
        this.references = [];
    }

    async initialize() {
        await this.loadProjectDetails();
        await this.loadResearchSteps();
        this.initializeEventListeners();
        this.updateUI();
    }

    async loadProjectDetails() {
        try {
            const response = await fetch(`/api/research/${this.projectId}`);
            const data = await response.json();
            if (data.success) {
                this.projectDetails = data.project;
                document.getElementById('project-title').textContent = this.projectDetails.title;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to load project details:', error);
            this.showError('Failed to load project details');
        }
    }

    async loadResearchSteps() {
        try {
            const response = await fetch(`/api/research/${this.projectId}/steps`);
            const data = await response.json();
            if (data.success) {
                this.researchSteps = data.steps;
                this.updateStepsUI();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to load research steps:', error);
            this.showError('Failed to load research steps');
        }
    }

    async executeStep(stepNumber) {
        try {
            const response = await fetch(`/api/research/${this.projectId}/step/${stepNumber}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.researchSteps[stepNumber - 1].result = data.result;
                this.updateStepResult(stepNumber);
                await this.loadReferences();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error(`Failed to execute step ${stepNumber}:`, error);
            this.showError(`Failed to execute research step ${stepNumber}`);
        }
    }

    async loadReferences() {
        try {
            const response = await fetch(`/api/research/${this.projectId}/references`);
            const data = await response.json();
            if (data.success) {
                this.references = data.references;
                this.updateReferencesUI();
            }
        } catch (error) {
            console.error('Failed to load references:', error);
            this.showError('Failed to load references');
        }
    }

    async finalizeProject() {
        try {
            const response = await fetch(`/api/research/${this.projectId}/finalize`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.showFinalReport(data.final_report);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to finalize project:', error);
            this.showError('Failed to generate final report');
        }
    }

    initializeEventListeners() {
        document.getElementById('execute-step').addEventListener('click', () => {
            this.executeStep(this.currentStep);
        });

        document.getElementById('next-step').addEventListener('click', () => {
            if (this.currentStep < this.researchSteps.length) {
                this.currentStep++;
                this.updateUI();
            }
        });

        document.getElementById('previous-step').addEventListener('click', () => {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.updateUI();
            }
        });

        document.getElementById('finalize-project').addEventListener('click', () => {
            this.finalizeProject();
        });
    }

    updateUI() {
        this.updateStepNavigation();
        this.updateCurrentStepDisplay();
        this.updateProgressBar();
    }

    updateStepsUI() {
        const stepsContainer = document.getElementById('research-steps');
        stepsContainer.innerHTML = '';
        
        this.researchSteps.forEach((step, index) => {
            const stepElement = this.createStepElement(step, index + 1);
            stepsContainer.appendChild(stepElement);
        });
    }

    createStepElement(step, stepNumber) {
        const div = document.createElement('div');
        div.className = 'research-step';
        div.classList.toggle('active', stepNumber === this.currentStep);
        
        div.innerHTML = `
            <div class="step-header">
                <h3>Step ${stepNumber}</h3>
                <span class="step-status ${step.result ? 'completed' : 'pending'}">
                    ${step.result ? 'Completed' : 'Pending'}
                </span>
            </div>
            <div class="step-content">
                <p><strong>Description:</strong> ${step.description}</p>
                <p><strong>Methodology:</strong> ${step.methodology}</p>
                <p><strong>Keywords:</strong> ${step.keywords}</p>
                ${step.result ? `
                    <div class="step-result">
                        <h4>Result:</h4>
                        <div class="result-content">${step.result}</div>
                    </div>
                ` : ''}
            </div>
        `;

        return div;
    }

    updateStepNavigation() {
        const prevButton = document.getElementById('previous-step');
        const nextButton = document.getElementById('next-step');
        const executeButton = document.getElementById('execute-step');
        const finalizeButton = document.getElementById('finalize-project');

        prevButton.disabled = this.currentStep === 1;
        nextButton.disabled = this.currentStep === this.researchSteps.length;
        executeButton.disabled = this.researchSteps[this.currentStep - 1]?.result != null;
        finalizeButton.disabled = !this.allStepsCompleted();
    }

    updateCurrentStepDisplay() {
        const currentStep = this.researchSteps[this.currentStep - 1];
        if (!currentStep) return;

        document.getElementById('current-step-number').textContent = this.currentStep;
        document.getElementById('current-step-description').textContent = currentStep.description;
        document.getElementById('current-step-methodology').textContent = currentStep.methodology;
        document.getElementById('current-step-keywords').textContent = currentStep.keywords;
    }

    updateProgressBar() {
        const completedSteps = this.researchSteps.filter(step => step.result).length;
        const progress = (completedSteps / this.researchSteps.length) * 100;
        
        const progressBar = document.getElementById('progress-bar-fill');
        progressBar.style.width = `${progress}%`;
        document.getElementById('progress-percentage').textContent = `${Math.round(progress)}%`;
    }

    updateReferencesUI() {
        const referencesContainer = document.getElementById('references-list');
        referencesContainer.innerHTML = '';

        this.references.forEach(ref => {
            const refElement = document.createElement('div');
            refElement.className = 'reference-item';
            refElement.innerHTML = `
                <h4>${ref.title}</h4>
                <p>${ref.content}</p>
                <a href="${ref.url}" target="_blank" rel="noopener noreferrer">View Source</a>
            `;
            referencesContainer.appendChild(refElement);
        });
    }

    updateStepResult(stepNumber) {
        const stepElement = document.querySelector(`.research-step:nth-child(${stepNumber})`);
        if (stepElement) {
            const result = this.researchSteps[stepNumber - 1].result;
            stepElement.querySelector('.step-status').textContent = 'Completed';
            stepElement.querySelector('.step-status').classList.replace('pending', 'completed');
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'step-result';
            resultDiv.innerHTML = `
                <h4>Result:</h4>
                <div class="result-content">${result}</div>
            `;
            
            const existingResult = stepElement.querySelector('.step-result');
            if (existingResult) {
                existingResult.replaceWith(resultDiv);
            } else {
                stepElement.querySelector('.step-content').appendChild(resultDiv);
            }
        }
    }

    showFinalReport(report) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Final Research Report</h2>
                <div class="report-content">${report}</div>
                <div class="modal-actions">
                    <button onclick="this.closest('.modal').remove()">Close</button>
                    <button onclick="window.print()">Print Report</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    allStepsCompleted() {
        return this.researchSteps.every(step => step.result != null);
    }
}

// Initialize project manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    if (projectId) {
        const projectManager = new ProjectManager(projectId);
        projectManager.initialize();
    } else {
        console.error('No project ID provided');
    }
});