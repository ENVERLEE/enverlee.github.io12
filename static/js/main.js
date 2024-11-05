// main.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('research-form');
    
    // 파일 업로드 처리
    async function handleFileUpload(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        try {
            const response = await fetch('/api/process-file', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                return data;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }
    
    // 폼 제출 처리
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            evaluation_plan: document.getElementById('evaluation-plan').value,
            submission_format: document.getElementById('submission-format').value
        };
        
        try {
            const response = await fetch('/api/project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                window.location.href = `/dashboard?project=${data.project_id}`;
            } else {
                alert(data.message || 'Error creating project');
            }
        } catch (error) {
            console.error('Project creation error:', error);
            alert('Failed to create project');
        }
    });
    
    // 파일 입력 처리
    ['evaluation-plan-file', 'submission-format-file'].forEach(id => {
        const input = document.getElementById(id);
        const textArea = document.getElementById(id.replace('-file', ''));
        
        input.addEventListener('change', async (e) => {
            try {
                const file = e.target.files[0];
                if (file) {
                    const result = await handleFileUpload(file, id.replace('-file', ''));
                    textArea.value = result.text;
                }
            } catch (error) {
                alert('File upload failed: ' + error.message);
            }
        });
    });
});