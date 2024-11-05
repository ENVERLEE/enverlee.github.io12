document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadActiveProjects();
    
    async function loadDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();
            
            if (data.success) {
                updateDashboardUI(data.stats);
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }
    
    async function loadActiveProjects() {
        try {
            const response = await fetch('/api/dashboard/search?status=active');
            const data = await response.json();
            
            if (data.success) {
                updateProjectsGrid(data.projects);
            }
        } catch (error) {
            console.error('Failed to load active projects:', error);
        }
    }
    
    function updateDashboardUI(stats) {
        document.getElementById('total-projects').textContent = stats.total_projects;
        document.getElementById('completed-projects').textContent = stats.completed_projects;
        document.getElementById('completion-rate').textContent = `${Math.round(stats.completion_rate)}%`;
        
        // 월별 차트 업데이트 로직 추가
    }
    
    function updateProjectsGrid(projects) {
        const grid = document.getElementById('projects-list');
        grid.innerHTML = '';
        
        projects.forEach(project => {
            const card = createProjectCard(project);
            grid.appendChild(card);
        });
    }
    
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const progress = (project.completed_steps / project.total_steps) * 100;
        
        card.innerHTML = `
            <h3>${project.title}</h3>
            <p>Created: ${new Date(project.created_at).toLocaleDateString()}</p>
            <p>Progress: ${project.completed_steps}/${project.total_steps} steps</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
        `;
        
        return card;
    }
});