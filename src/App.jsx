import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  Check, 
  Sun, 
  Moon, 
  Palette, 
  Clock, 
  Calendar,
  RotateCcw,
  Minus,
  X,
  GripVertical,
  CornerRightDown
} from 'lucide-react';

// DND Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

const isElectron = window && window.process && window.process.type;
const ipcRenderer = isElectron ? window.require('electron').ipcRenderer : null;

const QUOTES = [
  "എടാ മോനെ, സ്റ്റാർട്ട് ചെയ്! 🦁",
  "പിന്നല്ല, കലക്ക്! 🔥",
  "ഭാവിയെക്കുറിച്ച് പേടിയുണ്ടോ? പണിയെടുക്ക്! 🎓",
  "കുറച്ചു കൂടി ഇരുന്നാൽ തടി നന്നാകുമെന്ന് തോന്നുന്നുണ്ടോ? 🐖",
  "എന്തൊക്കെ ബഹളമായിരുന്നു, ഇപ്പോൾ ഒന്ന് ആക്ടീവ് ആകൂ! 😂",
  "തീർത്തിട്ട് പോയാൽ പോരെ? 🚶",
  "മടിയന് മനസ്സങ്കടമോ? വേഗത്തിലാകട്ടെ! 💪",
  "സൂക്ഷിച്ചാൽ ദുഃഖിക്കേണ്ടല്ലോ! ✍️",
  "എല്ലാം ശരിയാകും... ഇത് തീർത്താൽ! 🛠️",
  "ലക്ഷ്യം മാത്രം നോക്കുക! 🎯",
  "സ്വപ്നങ്ങൾ മാത്രം കണ്ടിട്ട് കാര്യമില്ല, എഴുന്നേറ്റ് പണിയെടുക്ക്! 🛌",
  "മടിയുടെ മറുപേര് നിങ്ങളുടെ പേരാണോ? 🐢",
  "നമ്മളൊക്കെ പാവങ്ങളല്ലേ... പണിയെടുത്ത് പണക്കാരാകൂ! 💰",
  "ഇന്നത്തെ പണി നാളത്തേക്ക് മാറ്റിവെക്കരുത്! ⏳",
  "മടിച്ചിരുന്നാൽ മണ്ണുണ്ണാം! 🏜️",
  "വിജയം ദൂരെയല്ല, ഇതാ ഇവിടെ തന്നെ! 🏁",
  "നിർത്തരുത്, തുടർന്നു കൊണ്ടിരിക്കുക! 🚀",
  "ഇതാണ് സമയം, ഇപ്പോൾ അല്ലെങ്കിൽ എപ്പോൾ? ⏰",
  "ചെയ്യാം എന്ന് പറഞ്ഞാൽ ചെയ്യണം! 😤",
  "ചിരിക്കൂ, പക്ഷെ പണിയെടുത്ത് ചിരിക്കൂ! 😄"
];

const THEMES = ['classic', 'dark', 'pastel'];
const PRIORITIES = ['low', 'medium', 'high']; // Gray, Blue, Red

// --- Sortable Task Item Sub-component ---
const SortableTask = ({ todo, toggleTodo, cyclePriority, deleteTodo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2000 : 'auto',
    opacity: isDragging ? 0.6 : 1,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="item-left">
        <div className="dnd-handle" {...attributes} {...listeners}>
          <GripVertical size={14} opacity={0.4} />
        </div>
        <div className="priority-indicator" onClick={() => cyclePriority(todo.id)} title="Cycle Priority" />
        <div className={`custom-checkbox ${todo.completed ? 'checked' : ''}`} onClick={() => toggleTodo(todo.id)}>
          {todo.completed && <Check size={12} color="white" />}
        </div>
      </div>
      <div className="item-content">
        <span className="item-text" onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
        {todo.createdAt && <span className="item-time">{todo.createdAt}</span>}
      </div>
      <div className="item-actions">
        <button className="action-btn" onClick={() => deleteTodo(todo.id)}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

const App = () => {
  // --- Core State ---
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('sn-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('sn-theme') || 'classic');
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('sn-position');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('sn-size');
    return saved ? JSON.parse(saved) : { width: 350, height: 520 };
  });
  const [isMini, setIsMini] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [inputValue, setInputValue] = useState('');
  const [time, setTime] = useState(new Date());

  const nodeRef = useRef(null);
  const inputRef = useRef(null);
  const tickAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'));

  // --- DND Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Persistence & Sync ---
  useEffect(() => {
    localStorage.setItem('sn-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('sn-theme', theme);
  }, [theme]);

  // Mini-mode resize & Persistence
  useEffect(() => {
    if (isElectron) {
      if (isMini) {
        ipcRenderer.send('window-resize', { width: 80, height: 80 });
      } else {
        ipcRenderer.send('window-resize', size);
      }
    }
    localStorage.setItem('sn-size', JSON.stringify(size));
  }, [isMini, size]);

  // --- Clock ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsMini((prev) => !prev);
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        clearCompleted();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Handlers ---
  const handleDragStop = (e, data) => {
    const newPos = { x: data.x, y: data.y };
    setPosition(newPos);
    localStorage.setItem('sn-position', JSON.stringify(newPos));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addTask = () => {
    if (!inputValue.trim()) return;
    const now = new Date();
    const newTodo = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      priority: 'low',
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          tickAudio.current.play().catch(() => {});
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ffbed1', '#ff0000', '#ffd700'] });
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const cyclePriority = (id) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        const nextIdx = (PRIORITIES.indexOf(t.priority) + 1) % PRIORITIES.length;
        return { ...t, priority: PRIORITIES[nextIdx] };
      }
      return t;
    }));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const rotateTheme = () => {
    const nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length;
    setTheme(THEMES[nextIdx]);
  };

  const refreshQuote = () => {
    let next;
    do { next = QUOTES[Math.floor(Math.random() * QUOTES.length)]; } while (next === currentQuote);
    setCurrentQuote(next);
  };

  const handleResizeInit = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (mmE) => {
      const newWidth = Math.max(300, startWidth + (mmE.clientX - startX));
      const newHeight = Math.max(400, startHeight + (mmE.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // --- View Utils ---
  const formatDate = (date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (date) => date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const progress = todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0;

  return (
    <>
      <Draggable
        nodeRef={nodeRef}
        handle=".widget-drag-handle"
        defaultPosition={position}
        onStop={handleDragStop}
        scale={1}
        disabled={isMini}
      >
        <div ref={nodeRef} className={`sticky-note theme-${theme} ${isMini ? 'mini-mode' : ''}`}>
          {isMini ? (
            <div className="mini-content" onClick={() => setIsMini(false)} title="Restore">
              <div className="mini-drag-handle">
                <GripVertical size={16} />
              </div>
              <div className="mini-info">
                <span className="mini-count">{todos.filter(t => !t.completed).length}</span>
                <span className="mini-label">tasks</span>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="note-header">
                <div className="header-top">
                  <div className="date-time">
                    <div className="widget-drag-handle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GripVertical size={12} opacity={0.6} />
                      <Calendar size={12} />
                      {formatDate(time)}
                    </div>
                    <div className="time-display">
                      <Clock size={12} />
                      {formatTime(time)}
                    </div>
                  </div>
                  <div className="header-actions">
                    {isElectron && (
                      <>
                        <button className="action-icon-btn" onClick={() => setIsMini(true)} title="Mini Mode (Esc)">
                          <Minus size={14} />
                        </button>
                        <button className="action-icon-btn close-btn" onClick={() => ipcRenderer.send('window-close')} title="Close">
                          <X size={14} />
                        </button>
                      </>
                    )}
                    <button className="action-icon-btn" onClick={refreshQuote} title="New Quote">
                      <RotateCcw size={14} />
                    </button>
                    <button className="action-icon-btn" onClick={rotateTheme} title="Change Theme">
                      {theme === 'classic' && <Sun size={14} />}
                      {theme === 'dark' && <Moon size={14} />}
                      {theme === 'pastel' && <Palette size={14} />}
                    </button>
                  </div>
                </div>

                <div className="quote-bubble" onClick={refreshQuote} style={{ cursor: 'pointer' }} title="Click for new quote">
                  {currentQuote}
                </div>
              </header>

              {/* Todo List with DND */}
              <div className="todo-list">
                {todos.length === 0 ? (
                  <div className="empty-state">
                    No tasks yet.<br/>Type and press Enter! 🚀
                  </div>
                ) : (
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  >
                    <SortableContext 
                      items={todos.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {todos.map(todo => (
                        <SortableTask 
                          key={todo.id} 
                          todo={todo}
                          toggleTodo={toggleTodo}
                          cyclePriority={cyclePriority}
                          deleteTodo={deleteTodo}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              {/* Progress Bar */}
              <div className="progress-container" title="Daily Progress">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* Add Input */}
              <div className="add-container">
                <input 
                  ref={inputRef}
                  type="text" 
                  className="add-input" 
                  placeholder="What's next? (Ctrl+N)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button className="add-btn" onClick={addTask}>
                  <Plus size={18} />
                </button>
              </div>

              {/* Resize Handle for Electron */}
              {isElectron && !isMini && (
                <div 
                  className="resize-handle" 
                  onMouseDown={handleResizeInit}
                  title="Drag to resize"
                >
                  <CornerRightDown size={12} opacity={0.5} />
                </div>
              )}
            </>
          )}
        </div>
      </Draggable>
    </>
  );
};

export default App;
