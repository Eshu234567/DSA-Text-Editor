let dataStructure = [];
let currentDS = 'stack';
let undoStack = [''];
let redoStack = [];
let isUndoRedo = false;
let currentFindIndex = -1;
let findMatches = [];
let findReplaceActive = false;

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
    
    // Update find matches if find is active
    if (findReplaceActive) {
        updateFindMatches();
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
        stack: '<i class="fas fa-layer-group"></i> <strong>Stack (LIFO)</strong> - Last In, First Out. Items are added and removed from the top.<br><span class="usage-hint">💡 Text Editor Usage: Undo/Redo operations use stacks to track edit history!</span>',
        queue: '<i class="fas fa-arrow-right"></i> <strong>Queue (FIFO)</strong> - First In, First Out. Items are added at the rear and removed from the front.<br><span class="usage-hint">💡 Text Editor Usage: Print queue and auto-save operations process changes in order!</span>',
        linkedlist: '<i class="fas fa-link"></i> <strong>Linked List</strong> - A linear collection where each element points to the next.<br><span class="usage-hint">💡 Text Editor Usage: Text buffers often use linked lists for efficient insertion/deletion of characters!</span>',
        tree: '<i class="fas fa-sitemap"></i> <strong>Binary Tree</strong> - A hierarchical structure where each node has at most two children.<br><span class="usage-hint">💡 Text Editor Usage: Syntax trees and document outlines use tree structures for hierarchical organization!</span>'
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
                html += `<div class="node" data-word="${dataStructure[i]}" style="animation-delay: ${(dataStructure.length - 1 - i) * 0.1}s">${dataStructure[i]}</div>`;
            }
            html += '<div class="ds-label">⬇️ BOTTOM</div>';
            html += '</div>';
            break;
            
        case 'queue':
            html = '<div class="queue-container">';
            html += '<div class="ds-label">⬅️ FRONT</div>';
            dataStructure.forEach((item, i) => {
                html += `<div class="node" data-word="${item}" style="animation-delay: ${i * 0.1}s">${item}</div>`;
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
                html += `<div class="node" data-word="${item}" style="animation-delay: ${i * 0.1}s">${item}</div>`;
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
        html += `<div class="tree-node" data-word="${item}" style="left: ${pos.x - 37.5}px; top: ${pos.y - 37.5}px; animation-delay: ${i * 0.15}s">${item}</div>`;
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

// Search Element - Fixed to work with both .node and .tree-node
function searchElement() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchTerm) return;
    
    // Search both regular nodes and tree nodes
    const nodes = document.querySelectorAll('.node, .tree-node');
    let found = false;
    
    nodes.forEach(node => {
        node.classList.remove('highlight');
        const nodeText = node.textContent.trim().toLowerCase();
        if (nodeText === searchTerm) {
            node.classList.add('highlight');
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        }
    });
    
    if (!found) {
        alert(`"${searchTerm}" not found in the data structure!`);
    }
}

// Find and Replace Functions
function toggleFindReplace() {
    const panel = document.getElementById('findReplacePanel');
    findReplaceActive = !findReplaceActive;
    
    if (findReplaceActive) {
        panel.classList.add('active');
        document.getElementById('findInput').focus();
        updateFindMatches();
    } else {
        panel.classList.remove('active');
        clearHighlights();
    }
}

function updateFindMatches() {
    const findText = document.getElementById('findInput').value.trim();
    const info = document.getElementById('findReplaceInfo');
    
    if (!findText) {
        findMatches = [];
        currentFindIndex = -1;
        info.textContent = '';
        clearHighlights();
        return;
    }
    
    const text = editor.value;
    const regex = new RegExp(escapeRegex(findText), 'gi');
    findMatches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        findMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0]
        });
    }
    
    if (findMatches.length > 0) {
        info.textContent = `${findMatches.length} match${findMatches.length > 1 ? 'es' : ''} found`;
        highlightMatches();
        currentFindIndex = 0;
        scrollToMatch(0);
    } else {
        info.textContent = 'No matches found';
        currentFindIndex = -1;
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatches() {
    const findText = document.getElementById('findInput').value.trim();
    if (!findText) return;
    
    const text = editor.value;
    const regex = new RegExp(escapeRegex(findText), 'gi');
    let highlightedText = text;
    let offset = 0;
    
    findMatches.forEach((match, index) => {
        const before = highlightedText.substring(0, match.start + offset);
        const matchText = highlightedText.substring(match.start + offset, match.end + offset);
        const after = highlightedText.substring(match.end + offset);
        
        const className = index === currentFindIndex ? 'find-highlight current' : 'find-highlight';
        highlightedText = before + `<mark class="${className}">${matchText}</mark>` + after;
        offset += `<mark class="${className}">${matchText}</mark>`.length - matchText.length;
    });
    
    // We can't directly set HTML in textarea, so we'll use a different approach
    // Instead, we'll highlight in the visualization
    highlightInVisualization(findText);
}

function highlightInVisualization(searchText) {
    const nodes = document.querySelectorAll('.node, .tree-node');
    nodes.forEach(node => {
        const nodeText = node.textContent.trim().toLowerCase();
        if (nodeText === searchText.toLowerCase()) {
            node.classList.add('find-highlight-viz');
        } else {
            node.classList.remove('find-highlight-viz');
        }
    });
}

function clearHighlights() {
    const nodes = document.querySelectorAll('.node, .tree-node');
    nodes.forEach(node => {
        node.classList.remove('find-highlight-viz');
    });
    document.getElementById('findReplaceInfo').textContent = '';
}

function scrollToMatch(index) {
    if (index < 0 || index >= findMatches.length) return;
    
    const match = findMatches[index];
    editor.focus();
    editor.setSelectionRange(match.start, match.end);
    
    // Scroll editor to show the match
    const textBeforeMatch = editor.value.substring(0, match.start);
    const lines = textBeforeMatch.split('\n');
    const lineNumber = lines.length - 1;
    const lineHeight = 24; // Approximate line height
    editor.scrollTop = lineNumber * lineHeight;
}

function handleFindKeyup(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            findPrevious();
        } else {
            findNext();
        }
    } else {
        updateFindMatches();
    }
}

function findNext() {
    if (findMatches.length === 0) {
        updateFindMatches();
        return;
    }
    currentFindIndex = (currentFindIndex + 1) % findMatches.length;
    scrollToMatch(currentFindIndex);
    highlightInVisualization(document.getElementById('findInput').value.trim());
}

function findPrevious() {
    if (findMatches.length === 0) {
        updateFindMatches();
        return;
    }
    currentFindIndex = (currentFindIndex - 1 + findMatches.length) % findMatches.length;
    scrollToMatch(currentFindIndex);
    highlightInVisualization(document.getElementById('findInput').value.trim());
}

function replaceCurrent() {
    if (currentFindIndex < 0 || currentFindIndex >= findMatches.length) {
        alert('No match selected. Use Find Next/Previous first.');
        return;
    }
    
    const replaceText = document.getElementById('replaceInput').value;
    const match = findMatches[currentFindIndex];
    
    const text = editor.value;
    const newText = text.substring(0, match.start) + replaceText + text.substring(match.end);
    editor.value = newText;
    
    // Trigger input event to update everything
    editor.dispatchEvent(new Event('input'));
    
    // Animate removal in visualization
    animateReplaceInVisualization(match.text, replaceText);
    
    // Update matches
    updateFindMatches();
}

function replaceAll() {
    const findText = document.getElementById('findInput').value.trim();
    const replaceText = document.getElementById('replaceInput').value;
    
    if (!findText) {
        alert('Please enter text to find.');
        return;
    }
    
    if (findMatches.length === 0) {
        updateFindMatches();
        if (findMatches.length === 0) {
            alert('No matches found.');
            return;
        }
    }
    
    const text = editor.value;
    const regex = new RegExp(escapeRegex(findText), 'g');
    const newText = text.replace(regex, replaceText);
    editor.value = newText;
    
    // Trigger input event
    editor.dispatchEvent(new Event('input'));
    
    // Animate all replacements in visualization
    animateReplaceAllInVisualization(findText, replaceText);
    
    // Clear find matches
    findMatches = [];
    currentFindIndex = -1;
    document.getElementById('findReplaceInfo').textContent = `Replaced ${findMatches.length} occurrences`;
}

function animateReplaceInVisualization(oldText, newText) {
    const nodes = document.querySelectorAll('.node, .tree-node');
    nodes.forEach((node, index) => {
        const nodeText = node.textContent.trim();
        if (nodeText.toLowerCase() === oldText.toLowerCase()) {
            // Animate removal
            node.style.animation = 'nodeRemove 0.6s ease forwards';
            setTimeout(() => {
                node.textContent = newText;
                node.style.animation = 'nodeAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => {
                    node.style.animation = '';
                }, 600);
            }, 600);
        }
    });
}

function animateReplaceAllInVisualization(oldText, newText) {
    const nodes = document.querySelectorAll('.node, .tree-node');
    let delay = 0;
    
    nodes.forEach((node) => {
        const nodeText = node.textContent.trim();
        if (nodeText.toLowerCase() === oldText.toLowerCase()) {
            setTimeout(() => {
                node.style.animation = 'nodeRemove 0.6s ease forwards';
                setTimeout(() => {
                    node.textContent = newText;
                    node.style.animation = 'nodeAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    setTimeout(() => {
                        node.style.animation = '';
                    }, 600);
                }, 600);
            }, delay);
            delay += 100; // Stagger animations
        }
    });
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
    findMatches = [];
    currentFindIndex = -1;
    document.getElementById('charCount').textContent = '0';
    document.getElementById('wordCount').textContent = '0';
    updateUndoRedoButtons();
    visualize();
}

// Initialize
updateDSInfo();
visualize();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+F or Cmd+F for find
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (!findReplaceActive) {
            toggleFindReplace();
        }
    }
    // Escape to close find/replace
    if (e.key === 'Escape' && findReplaceActive) {
        toggleFindReplace();
    }
});
