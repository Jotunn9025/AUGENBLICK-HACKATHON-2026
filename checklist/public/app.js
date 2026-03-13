const socket = io();

const tasksContainer = document.getElementById('tasks');
const progressElement = document.getElementById('progress');
let localTasks = [];

// Load tasks from server
socket.on('loadTasks', (tasks) => {
  localTasks = tasks;
  renderTasks(tasks);
  updateProgress(tasks);
});

// Update task when received from server
socket.on('taskUpdated', (updatedTask) => {
  const index = localTasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    localTasks[index] = updatedTask;
  }
  updateTaskInDOM(updatedTask);
  updateProgress(localTasks);
});

function renderTasks(tasks) {
  tasksContainer.innerHTML = '';
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    tasksContainer.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = `task ${task.status}`;
  div.innerHTML = `
    <h2>Task ${task.id}: ${task.title}</h2>
    <div class="task-content">
      <div class="status">
        <label><input type="radio" name="status-${task.id}" value="not-started" ${task.status === 'not-started' ? 'checked' : ''}> Not Started</label>
        <label><input type="radio" name="status-${task.id}" value="in-progress" ${task.status === 'in-progress' ? 'checked' : ''}> In Progress</label>
        <label><input type="radio" name="status-${task.id}" value="completed" ${task.status === 'completed' ? 'checked' : ''}> Completed</label>
      </div>
      <pre>${task.description}</pre>
      <div class="notes">
        <label>Notes:</label>
        <textarea>${task.notes}</textarea>
      </div>
    </div>
  `;

  // Add event listeners
  const h2 = div.querySelector('h2');
  h2.addEventListener('click', () => {
    div.classList.toggle('collapsed');
  });

  const radios = div.querySelectorAll(`input[name="status-${task.id}"]`);
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      task.status = radio.value;
      div.className = `task ${task.status}`;
      const index = localTasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        localTasks[index].status = task.status;
      }
      updateProgress(localTasks);
      socket.emit('updateTask', task);
    });
  });

  const textarea = div.querySelector('textarea');
  textarea.addEventListener('input', () => {
    task.notes = textarea.value;
    const index = localTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      localTasks[index].notes = task.notes;
    }
    socket.emit('updateTask', task);
  });

  return div;
}

function updateTaskInDOM(updatedTask) {
  const taskElements = document.querySelectorAll('.task');
  for (let el of taskElements) {
    if (el.querySelector('h2').textContent.startsWith(`Task ${updatedTask.id}:`)) {
      el.className = `task ${updatedTask.status}`;
      const radios = el.querySelectorAll(`input[name="status-${updatedTask.id}"]`);
      radios.forEach(radio => {
        radio.checked = radio.value === updatedTask.status;
      });
      const textarea = el.querySelector('textarea');
      textarea.value = updatedTask.notes;
      break;
    }
  }
}

function updateProgress(tasks) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const percentage = Math.round((completed / total) * 100);
  progressElement.textContent = `Progress: ${percentage}% (${completed}/${total} completed)`;
}