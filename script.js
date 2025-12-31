let dataStructure = [];
let currentDS = 'stack';
let undoStack = [''];
let redoStack = [];
let isUndoRedo = false;

const editor = document.getElementById('textEditor');
const autoSync = document.getElementById('autoSync');

// Tab Switching Logic
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'visualizer') {
        syncFromEditor();
    }
}

// Theme Selection
document.getElementById('themeSelect').addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

// Data Structure Type Selection
document.getElementById('dsType').addEventListener('change', (e) => {
    currentDS = e.target.value;
    updateDSInfo();
    if (autoSync.checked) syncFromEditor();
});

// Editor Input Handler
editor.addEventListener('input', () => {
    const text = editor.value;
    document.getElementById('charCount').textContent = text.length;
    document.getElementById('wordCount').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    if (!isUndoRedo) {
        undoStack.push(text);
        redoStack = [];
        updateUndoRedoButtons();
    }
    
    if (autoSync.checked) {
        syncFromEditor();
    }
});

// Undo Function
function undo() {
    if (undoStack.length > 1) {
        isUndoRedo = true;
        redoStack.push(undoStack.pop());
        editor.value = undoStack[undoStack.length - 1];
        updateUndoRedoButtons();
        if (autoSync.checked) syncFromEditor();
        isUndoRedo = false;
    }
}

// Redo Function
function redo() {
    if (redoStack.length > 0) {
        isUndoRedo = true;
        const text = redoStack.pop();
        undoStack.push(text);
        editor.value = text;
        updateUndoRedoButtons();
        if (autoSync.checked) syncFromEditor();
        isUndoRedo = false;
    }
}

// Update Undo/Redo Buttons
function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length <= 1;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
    document.getElementById('undoCount').textContent = undoStack.length;
}

// Sync from Editor
function syncFromEditor() {
    const text = editor.value.trim();
    if (!text) {
        dataStructure = [];
    } else {
        dataStructure = text.split(/\s+/).slice(0, 30); // Limit for visual clarity
    }
    visualize();
}

// Update Data Structure Info
function updateDSInfo() {
    const info = document.getElementById('dsInfo');
    const descriptions = {
        stack: '<i class="fas fa-layer-group"></i> <strong>Stack (LIFO)</strong> - Last In, First Out. Items are added and removed from the top.',
        queue: '<i class="fas fa-arrow-right"></i> <strong>Queue (FIFO)</strong> - First In, First Out. Items are added at the rear and removed from the front.',
        linkedlist: '<i class="fas fa-link"></i> <strong>Linked List</strong> - A linear collection where each element points to the next.',
        tree: '<i class="fas fa-sitemap"></i> <strong>Binary Tree</strong> - A hierarchical structure where each node has at most two children.'
    };
    info.innerHTML = descriptions[currentDS];
}

// Visualize Data Structure
function visualize() {
    const area = document.getElementById('visualizationArea');
    
    if (dataStructure.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✨</div>
                <p>No data to display!</p>
                <p class="empty-state-hint">Write something in the Text Editor tab</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    switch(currentDS) {
        case 'stack':
            html = '<div class="stack-container">';
            html += '<div class="ds-label">⬆️ TOP</div>';
            for (let i = dataStructure.length - 1; i >= 0; i--) {
                html += `<div class="node" style="animation-delay: ${(dataStructure.length - 1 - i) * 0.1}s">${dataStructure[i]}</div>`;
            }
            html += '<div class="ds-label">⬇️ BOTTOM</div>';
            html += '</div>';
            break;
            
        case 'queue':
            html = '<div class="queue-container">';
            html += '<div class="ds-label">⬅️ FRONT</div>';
            dataStructure.forEach((item, i) => {
                html += `<div class="node" style="animation-delay: ${i * 0.1}s">${item}</div>`;
                if (i < dataStructure.length - 1) {
                    html += '<div class="arrow">→</div>';
                }
            });
            html += '<div class="ds-label">➡️ REAR</div>';
            html += '</div>';
            break;
            
        case 'linkedlist':
            html = '<div class="linkedlist-container">';
            html += '<div class="ds-label">🔗 HEAD</div>';
            dataStructure.forEach((item, i) => {
                html += `<div class="node" style="animation-delay: ${i * 0.1}s">${item}</div>`;
                if (i < dataStructure.length - 1) {
                    html += '<i class="fas fa-arrow-right arrow" style="animation-delay: ${i * 0.1}s"></i>';
                }
            });
            html += '<div class="ds-label">🔚 NULL</div>';
            html += '</div>';
            break;
            
        case 'tree':
            html = visualizeTree();
            break;
    }
    
    area.innerHTML = html;
}

// Visualize Binary Tree
function visualizeTree() {
    if (dataStructure.length === 0) return '';
    
    const levels = Math.ceil(Math.log2(dataStructure.length + 1));
    const width = Math.pow(2, levels) * 100;
    const height = levels * 150;
    
    let html = `<svg class="tree-svg" width="${width}" height="${height}">`;
    
    // Draw lines first
    dataStructure.forEach((_, i) => {
        const leftChild = 2 * i + 1;
        const rightChild = 2 * i + 2;
        
        if (leftChild < dataStructure.length) {
            const parentPos = getNodePosition(i, levels, width);
            const childPos = getNodePosition(leftChild, levels, width);
            html += `<line class="tree-line" x1="${parentPos.x}" y1="${parentPos.y}" x2="${childPos.x}" y2="${childPos.y}" stroke-dasharray="5,5"/>`;
        }
        
        if (rightChild < dataStructure.length) {
            const parentPos = getNodePosition(i, levels, width);
            const childPos = getNodePosition(rightChild, levels, width);
            html += `<line class="tree-line" x1="${parentPos.x}" y1="${parentPos.y}" x2="${childPos.x}" y2="${childPos.y}" stroke-dasharray="5,5"/>`;
        }
    });
    
    html += '</svg>';
    html += '<div class="tree-nodes-container">';
    
    // Draw nodes
    dataStructure.forEach((item, i) => {
        const pos = getNodePosition(i, levels, width);
        html += `<div class="tree-node" style="left: ${pos.x - 37.5}px; top: ${pos.y - 37.5}px; animation-delay: ${i * 0.15}s">${item}</div>`;
    });
    
    html += '</div>';
    
    return `<div class="tree-container" style="width: ${width}px; height: ${height}px;">${html}</div>`;
}

// Calculate Node Position for Tree
function getNodePosition(index, levels, width) {
    const level = Math.floor(Math.log2(index + 1));
    const posInLevel = index - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    
    const x = (width / (nodesInLevel + 1)) * (posInLevel + 1);
    const y = (level + 1) * 120;
    
    return { x, y };
}

// Search Element
function searchElement() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchTerm) return;
    
    const nodes = document.querySelectorAll('.node');
    let found = false;
    
    nodes.forEach(node => {
        node.classList.remove('highlight');
        if (node.textContent.toLowerCase() === searchTerm) {
            node.classList.add('highlight');
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        }
    });
    
    if (!found) {
        alert(`"${searchTerm}" not found in the data structure!`);
    }
}

// Clear Editor
function clearEditor() {
    if (editor.value && !confirm('Are you sure you want to clear everything?')) {
        return;
    }
    editor.value = '';
    undoStack = [''];
    redoStack = [];
    dataStructure = [];
    document.getElementById('charCount').textContent = '0';
    document.getElementById('wordCount').textContent = '0';
    updateUndoRedoButtons();
    visualize();
}

// Initialize
updateDSInfo();
visualize();