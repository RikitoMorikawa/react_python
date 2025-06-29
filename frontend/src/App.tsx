// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("未確認");

  const API_BASE = "http://localhost:8000/api";

  // API接続テスト
  const testConnection = async () => {
    try {
      setApiStatus("✅ 接続成功");
      return true;
    } catch (error) {
      console.error("API接続エラー:", error);
      setApiStatus("❌ 接続失敗");
      return false;
    }
  };

  // Todo一覧取得
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/core/todos/`);
      setTodos(response.data.todos || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
    }
    setLoading(false);
  };

  // Todo追加
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const response = await axios.post(`${API_BASE}/core/todos/`, {
        title: newTodo.title,
        description: newTodo.description,
        completed: false,
      });

      setTodos([response.data, ...todos]);
      setNewTodo({ title: "", description: "" });
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Todo完了状態切り替え
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const response = await axios.put(`${API_BASE}/core/todos/${id}/`, {
        ...todo,
        completed: !completed,
      });

      setTodos(todos.map((t) => (t.id === id ? response.data : t)));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Todo削除
  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/core/todos/${id}/`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // 初期化
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        fetchTodos();
      }
    });
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Todo アプリ</h1>
        <p>React + Django + MySQL のシンプルなTodoアプリ</p>

        {/* API接続状態 */}
        <div className="connection-status">
          <span>API接続状態: {apiStatus}</span>
          <button onClick={testConnection} className="test-btn small">
            🔄 再テスト
          </button>
        </div>

        {/* Todo統計 */}
        <div className="todo-stats">
          <div className="stat-item">
            <span className="stat-number">{todos.length}</span>
            <span className="stat-label">総タスク</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">未完了</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">完了済み</span>
          </div>
        </div>

        {/* Todo追加フォーム */}
        <div className="add-todo-section">
          <h3>➕ 新しいタスク</h3>
          <form onSubmit={addTodo} className="add-todo-form">
            <input
              type="text"
              placeholder="タスクのタイトル"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="todo-input"
              required
            />
            <textarea
              placeholder="詳細説明（任意）"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="todo-textarea"
              rows={3}
            />
            <button type="submit" className="add-btn">
              📝 タスクを追加
            </button>
          </form>
        </div>

        {/* Todo一覧 */}
        <div className="todos-section">
          <div className="section-header">
            <h3>📋 タスク一覧</h3>
            <button onClick={fetchTodos} className="refresh-btn" disabled={loading}>
              {loading ? "🔄" : "🔄"} 更新
            </button>
          </div>

          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <p>📭 タスクがありません</p>
              <p>上のフォームから新しいタスクを追加してみてください！</p>
            </div>
          ) : (
            <div className="todos-list">
              {todos.map((todo) => (
                <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                  <div className="todo-content">
                    <div className="todo-header">
                      <h4 className={todo.completed ? "completed-text" : ""}>{todo.title}</h4>
                      <span className="todo-date">{todo.created_at ? new Date(todo.created_at).toLocaleDateString("ja-JP") : ""}</span>
                    </div>
                    {todo.description && <p className={`todo-description ${todo.completed ? "completed-text" : ""}`}>{todo.description}</p>}
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => todo.id && toggleTodo(todo.id, todo.completed)} className={`toggle-btn ${todo.completed ? "completed" : "pending"}`}>
                      {todo.completed ? "✅" : "⭕"}
                    </button>
                    <button onClick={() => todo.id && deleteTodo(todo.id)} className="delete-btn">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API情報 */}
        <div className="api-info">
          <h3>🔧 API情報</h3>
          <div className="api-endpoints-info">
            <div className="endpoint-item">
              <code>GET /api/core/todos/</code>
              <span>Todo一覧取得</span>
            </div>
            <div className="endpoint-item">
              <code>POST /api/core/todos/</code>
              <span>Todo追加</span>
            </div>
            <div className="endpoint-item">
              <code>PUT /api/core/todos/:id/</code>
              <span>Todo更新</span>
            </div>
            <div className="endpoint-item">
              <code>DELETE /api/core/todos/:id/</code>
              <span>Todo削除</span>
            </div>
          </div>
        </div>

        {/* クイックリンク */}
        <div className="quick-links">
          <a href="http://localhost:8000/admin" target="_blank" rel="noopener noreferrer">
            🔧 Django Admin
          </a>
          <a href="http://localhost:8000/api/core/todos/" target="_blank" rel="noopener noreferrer">
            📡 Todo API
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
