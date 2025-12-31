let dataStructure = [];
let currentDS = 'stack';
let undoStack = [''];
let redoStack = [];
let isUndoRedo = false;
let searchHistory = [];
const MAX_HISTORY = 5;

const editor = document.getElementById('textEditor');
const autoSync = document.getElementById('autoSync');

const dsDescriptions = {
    stack: {
        title: 'Stack Visualization (LIFO)',
        description: '<strong>Stack (LIFO - Last In, First Out)</strong> - Used for the Undo/Redo functionality. Each text change is pushed onto the undo stack. When you undo, items are popped from the undo stack and pushed to the redo stack.'
    },
    queue: {
        title: 'Queue Visualization (FIFO)',
        description: '<strong>Queue (FIFO - First In, First Out)</strong> - Used for the Search History feature. New searches are enqueued at the rear, and when the limit (5) is reached, the oldest search is dequeued from the front.'
    },
    linkedlist: {
        title: 'Linked List Visualization',
        description: '<strong>Linked List</strong> - A linear data structure where each element (node) points to the next. Words from your text are stored sequentially, demonstrating how data can be dynamically linked together.'
    },
    tree: {
        title: 'Binary Tree Visualization',
        description: '<strong>Binary Tree</strong> - A hierarchical structure where each node has at most two children. Words are arranged level by level, showing parent-child relationships useful for searching and sorting operations.'
    }
};

// Initialize
updateDSInfo();
displaySearchHistory();
updateUndoRedoButtons();

document.getElementById('themeSelect').addEventListener('change', function(e) {
    document.body.className = e.target.value;
});

document.getElementById('dsType').addEventListener('change', function(e) {
    currentDS = e.target.value;
    updateDSInfo();
    if (autoSync.checked) {
        syncFromEditor();
    } else {
        visualize();
    }
});

function updateDSInfo() {
    const info = dsDescriptions[currentDS];
    document.getElementById('vizTitle').textContent = info.title;
    document.getElementById('dsInfo').innerHTML = info.description;
}

editor.addEventListener('input', function(e) {
    const text = editor.value;
    document.getElementById('charCount').textContent = text.length;
    document.getElementById('wordCount').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('lineCount').textContent = text.split('\n').length;
    
    if (!isUndoRedo) {
        undoStack.push(text);
        redoStack = [];
        if (undoStack.length > 50) {
            undoStack.shift();
        }
    }
    
    updateUndoRedoButtons();
    if (autoSync.checked) {
        syncFromEditor();
    }
});

function undo() {
    if (undoStack.length <= 1) return;
    isUndoRedo = true;
    const current = undoStack.pop();
    redoStack.push(current);
    const previous = undoStack[undoStack.length - 1] || '';
    editor.value = previous;
    
    // Update stats manually
    const text = editor.value;
    document.getElementById('charCount').textContent = text.length;
    document.getElementById('wordCount').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('lineCount').textContent = text.split('\n').length;
    
    isUndoRedo = false;
    updateUndoRedoButtons();
    if (autoSync.checked) {
        syncFromEditor();
    }
}

function redo() {
    if (redoStack.length === 0) return;
    isUndoRedo = true;
    const next = redoStack.pop();
    undoStack.push(next);
    editor.value = next;
    
    // Update stats manually
    const text = editor.value;
    document.getElementById('charCount').textContent = text.length;
    document.getElementById('wordCount').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('lineCount').textContent = text.split('\n').length;
    
    isUndoRedo = false;
    updateUndoRedoButtons();
    if (autoSync.checked) {
        syncFromEditor();
    }
}

function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length <= 1;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
    document.getElementById('undoCount').textContent = undoStack.length;
}

function clearEditor() {
    editor.value = '';
    undoStack = [''];
    redoStack = [];
    
    // Update stats
    document.getElementById('charCount').textContent = '0';
    document.getElementById('wordCount').textContent = '0';
    document.getElementById('lineCount').textContent = '0';
    
    updateUndoRedoButtons();
    if (autoSync.checked) {
        syncFromEditor();
    }
}

function clearVisualization() {
    dataStructure = [];
    visualize();
}

function syncFromEditor() {
    const text = editor.value.trim();
    if (!text) {
        dataStructure = [];
        visualize();
        return;
    }
    const words = text.split(/\s+/).filter(word => word.length > 0);
    dataStructure = words.slice(0, 20);
    visualize();
}

function searchElement() {
    const input = document.getElementById('searchInput');
    const searchTerm = input.value.trim();
    if (!searchTerm) return;
    
    addToSearchHistory(searchTerm);
    const indices = [];
    dataStructure.forEach((item, index) => {
        if (item.toLowerCase().includes(searchTerm.toLowerCase())) {
            indices.push(index);
        }
    });
    
    if (indices.length > 0) {
        alert(`Found "${searchTerm}" at ${indices.length} position(s): ${indices.map(i => i + 1).join(', ')}`);
        visualize(indices);
    } else {
        alert(`"${searchTerm}" not found in the data structure`);
    }
    input.value = '';
}

function addToSearchHistory(term) {
    const timestamp = new Date().toLocaleTimeString();
    const result = dataStructure.filter(item => 
        item.toLowerCase().includes(term.toLowerCase())
    ).length;
    searchHistory.push({ term, timestamp, result });
    if (searchHistory.length > MAX_HISTORY) {
        searchHistory.shift();
    }
    displaySearchHistory();
}

function displaySearchHistory() {
    const historyDiv = document.getElementById('searchHistory');
    if (searchHistory.length === 0) {
        historyDiv.innerHTML = '<div style="color: var(--text-secondary); font-size: 13px;">No searches yet</div>';
        return;
    }
    let html = '';
    searchHistory.forEach((item, index) => {
        html += `
            <div class="history-item" style="animation-delay: ${index * 0.05}s">
                <span class="history-term">"${item.term}"</span>
                <span class="history-result">${item.result} found • ${item.timestamp}</span>
            </div>
        `;
    });
    historyDiv.innerHTML = html;
}

function clearSearchHistory() {
    searchHistory = [];
    displaySearchHistory();
}

function visualize(highlightIndices = []) {
    const area = document.getElementById('visualizationArea');
    if (dataStructure.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                Type text in the editor! Words will automatically appear in the selected data structure.
            </div>
        `;
        return;
    }

    switch(currentDS) {
        case 'stack':
            visualizeStack(area, highlightIndices);
            break;
        case 'queue':
            visualizeQueue(area, highlightIndices);
            break;
        case 'linkedlist':
            visualizeLinkedList(area, highlightIndices);
            break;
        case 'tree':
            visualizeTree(area, highlightIndices);
            break;
    }
}

function visualizeStack(area, highlightIndices) {
    if (dataStructure.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                Type text in the editor! Words will automatically appear in the selected data structure.
            </div>
        `;
        return;
    }
    let html = '<div class="stack-container">';
    html += '<div class="ds-label">↓ Top</div>';
    for (let i = dataStructure.length - 1; i >= 0; i--) {
        const highlight = highlightIndices.includes(i) ? 'highlight' : '';
        html += `<div class="node ${highlight}" style="animation-delay: ${(dataStructure.length - i) * 0.08}s">${dataStructure[i]}</div>`;
    }
    html += '<div class="ds-label" style="margin-top: 8px;">↑ Bottom</div>';
    html += '</div>';
    area.innerHTML = html;
}

function visualizeQueue(area, highlightIndices) {
    if (dataStructure.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                Type text in the editor! Words will automatically appear in the selected data structure.
            </div>
        `;
        return;
    }
    let html = '<div class="queue-container">';
    html += '<div class="ds-label" style="writing-mode: vertical-rl; text-orientation: mixed;">Front</div>';
    dataStructure.forEach((item, i) => {
        const highlight = highlightIndices.includes(i) ? 'highlight' : '';
        html += `<div class="node ${highlight}" style="animation-delay: ${i * 0.08}s">${item}</div>`;
        if (i < dataStructure.length - 1) {
            html += '<div class="arrow">→</div>';
        }
    });
    html += '<div class="ds-label" style="writing-mode: vertical-rl; text-orientation: mixed;">Rear</div>';
    html += '</div>';
    area.innerHTML = html;
}

function visualizeLinkedList(area, highlightIndices) {
    if (dataStructure.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                Type text in the editor! Words will automatically appear in the selected data structure.
            </div>
        `;
        return;
    }
    let html = '<div class="linked-list">';
    html += '<div class="ds-label">Head →</div>';
    dataStructure.forEach((item, i) => {
        const highlight = highlightIndices.includes(i) ? 'highlight' : '';
        html += `<div class="node ${highlight}" style="animation-delay: ${i * 0.08}s">${item}</div>`;
        if (i < dataStructure.length - 1) {
            html += '<div class="arrow">→</div>';
        }
    });
    html += '<div class="ds-label" style="margin-left: 8px;">NULL</div>';
    html += '</div>';
    area.innerHTML = html;
}

function visualizeTree(area, highlightIndices) {
    if (dataStructure.length === 0) return;
    const containerWidth = area.clientWidth;
    const containerHeight = area.clientHeight;
    
    let html = '<div class="tree-container" style="position: relative; width: 100%; height: 100%;">';
    html += '<svg class="tree-svg" width="100%" height="100%">';
    
    const levels = Math.ceil(Math.log2(dataStructure.length + 1));
    const positions = [];
    let index = 0;
    
    for (let level = 0; level < levels && index < dataStructure.length; level++) {
        const nodesInLevel = Math.pow(2, level);
        const levelY = 80 + level * 120;
        
        for (let i = 0; i < nodesInLevel && index < dataStructure.length; i++) {
            const totalWidth = containerWidth - 100;
            const x = 50 + (totalWidth / (nodesInLevel + 1)) * (i + 1);
            positions.push({ x, y: levelY, index });
            
            // Draw line to parent
            if (level > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                if (parentIndex >= 0 && positions[parentIndex]) {
                    const parent = positions[parentIndex];
                    html += `<line class="tree-line" x1="${parent.x}" y1="${parent.y}" x2="${x}" y2="${levelY}" stroke-dasharray="1000" />`;
                }
            }
            
            index++;
        }
    }
    
    html += '</svg>';
    
    // Add nodes
    positions.forEach((pos, i) => {
        const highlight = highlightIndices.includes(i) ? 'highlight' : '';
        html += `<div class="tree-node ${highlight}" style="left: ${pos.x - 32.5}px; top: ${pos.y - 32.5}px; animation-delay: ${i * 0.1}s">${dataStructure[i]}</div>`;
    });
    
    html += '</div>';
    area.innerHTML = html;
}