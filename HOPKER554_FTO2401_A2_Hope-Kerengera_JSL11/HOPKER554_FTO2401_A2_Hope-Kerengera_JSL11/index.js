//imported helper functions from utils file - D
//imported initialData and elements object i created from initialData file - D

import {
  getTasks,
  createNewTask,
  saveTasks,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
import { initialData, elements } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/
// localStorage.clear();
// Function checks if local storage already has data, if not it loads initialData to localStorage
const initializeData = () => {
  if (!localStorage.getItem("tasks")) {
    //if the tasks key does not exist...
    localStorage.setItem("tasks", JSON.stringify(initialData)); //set it to be the key, and convert initial data array into a JSON string to be the value
    localStorage.setItem("showSideBar", "true"); //set showSideBar to true
  } else {
    //if it exists
    console.log("Data already exists in localStorage");
  }
};

//calling the initializeData function to run immediately
initializeData();

let activeBoard = ""; //variable to keep track of the board that is active

// Extracts unique board names from tasks
// TASK: FIX BUGS - D
const fetchAndDisplayBoardsAndTasks = () => {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))]; //taking only unique board names and no falsy values
  displayBoards(boards); //displaying unique boards
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; //the active board will equal the 1st board (if a different one wasn't already selected in the local storage eg. Roadmap)
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
};

// Creates different boards in the DOM
// TASK: Fix Bugs - D
const displayBoards = (boards) => {
  const boardsLink = document.getElementById("boards-nav-links-div");
  boardsLink.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      // when the boardElement (board nav bar) is clclicked, headerBoardName changes to the current board name, the board is displayed and active board will = the board selected
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); //saving active board to localStorage (now remembers even when page refreshed)
      styleActiveBoard(activeBoard);
    });
    boardsLink.appendChild(boardElement); //attach board element to boardslink element
  });
};

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs - D
const filterAndDisplayTasksByBoard = (boardName) => {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName); // '===' instead of assignment '=' / group tasks according to board name

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    // setting inner HTML for column header
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status) //filter each task according to their status / used strict equality operator
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal

        taskElement.onclick = (e) => {
          e.preventDefault();
          openEditTaskModal(task);
        };

        tasksContainer.appendChild(taskElement); //put the task in the task task container (under the necessary column)
      });
  });
};

const refreshTasksUI = () => {
  filterAndDisplayTasksByBoard(activeBoard); // calling the filterAndDisplayTasksByBoard function to refresh tasks UI of the active board
};

// Styles the active board by adding an active class
// TASK: Fix Bugs - D
const styleActiveBoard = (boardName) => {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
};

const addTaskToUI = (task) => {
  const column = document.querySelector(
    '.column-div[data-status="${task.status}"]' //columns status = tasks status
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // setting the title of the task
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement); //append the task to the task container
};
//SETTING UP EVENT LISTENERS
const setupEventListeners = () => {
  // Cancel editing task event listener
  const cancelEditBtn = document.querySelector("#cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.querySelector("#cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener

  elements.hideSideBarBtn.onclick = () => toggleSidebar(false);
  elements.showSideBarBtn.onclick = () => toggleSidebar(true);

  // Theme switch event listener
  elements.themeChanger.onchange = () => toggleTheme();

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.onclick = () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  };

  elements.modalWindow.onsubmit = (event) => {
    addTask(event);
  };
};

// Toggles tasks modal
// Task: Fix bugs
//TOGGLE MODAL FUNCTION
const toggleModal = (show, modal = elements.modalWindow) => {
  modal.style.display = show ? "block" : "none"; // fixed ternary operator syntax / if show is true it will display, if not, it won't
};

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/
//ADD TASK FUNCTION
const addTask = (event) => {
  event.preventDefault();

  // Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
  };

  const newTask = createNewTask(task); //creating a new task using creatNewTask function
  if (newTask) {
    addTaskToUI(newTask); //add new task to ui
    toggleModal(false); //close the modal
    newTask.board = activeBoard; //task belongs to activeBoard
    initialData.push(newTask); //push the new task to the end of initial array
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    localStorage.setItem("tasks", JSON.stringify(initialData)); //save updated tasks to localStorage
    refreshTasksUI();
  }
};
//TOGGLE SIDE BAR FUNCTION
const toggleSidebar = (show) => {
  if (show) {
    //if show parameter true..
    elements.sideModal.style.display = "block"; // display the sidebar and hide the "showSideBarButton"
    elements.showSideBarBtn.style.display = "none";
  } else {
    elements.sideModal.style.display = "none"; // hide the sidebar and show the button
    elements.showSideBarBtn.style.display = "block";
  }
};
toggleSidebar(true);
//TOGGLE THEME FUNCTION
// Function to toggle the theme between light and dark mode
function toggleTheme() {
  document.body.classList.toggle("light-theme"); // toggle the 'light-theme' class on the body element
  localStorage.setItem(
    // save the theme preference to localStorage
    "light-theme",
    document.body.classList.contains("light-theme") ? "enabled" : "disabled"
  );
  const logo = document.getElementById("logo"); // getting the image element for the logo
  const isLightTheme = document.body.classList.contains("light-theme"); //checking if the body has the 'light-theme' class

  // update the src attribute of the logo based on the theme
  if (isLightTheme) {
    logo.src = "./assets/logo-light.svg"; // Change logo to light version
  } else {
    logo.src = "./assets/logo-dark.svg"; // Change logo to dark version
  }
}

//OPEN EDIT TASK MODAL FUNCTION
function openEditTaskModal(task) {
  // Set task details in modal inputs /grabbing input elements from the DOM and assigning it to variables
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Getting the user input values
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // getting save and delete button from HTML file
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  saveTaskChangesBtn.addEventListener("click", () => {
    //when save button clicked savetaskchanges function is called
    saveTaskChanges(task.id);
    //ui automatically refreshed instead of reloading page
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal); //toggle modal closes
  });

  // using a helper function
  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    //ui automatically refreshed instead of reloading page
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal); //toggle modal closes
  });

  toggleModal(true, elements.editTaskModal); // when function triggered, toggle modal is opened
}
//SAVE TASK CHANGES
// Function to save changes to a task
const saveTaskChanges = (taskId) => {
  // Get new user inputs
  const updatedTitle = document.querySelector("#edit-task-title-input").value;
  const updatedDescription = document.querySelector(
    "#edit-task-desc-input"
  ).value;
  const updatedStatus = document.querySelector("#edit-select-status").value;

  // get tasks from local storage
  let tasks = getTasks();

  // check if a task with the same ID already exists
  const duplicatedTask = tasks.findIndex((task) => task.id === taskId);

  if (duplicatedTask !== -1) {
    //(if it is not "-1" it is a dup)
    // If the task already exists, update its properties
    tasks[duplicatedTask].title = updatedTitle;
    tasks[duplicatedTask].description = updatedDescription;
    tasks[duplicatedTask].status = updatedStatus;
  } else {
    //if the task doesn't exist, create a new task object
    const newTask = {
      id: taskId,
      title: updatedTitle,
      description: updatedDescription,
      status: updatedStatus,
    };

    //add the new task to the tasks array
    tasks.push(newTask);
  }

  // save the updated tasks array back to local storage
  saveTasks(tasks);

  // invoke putTask to update the Database
  putTask(taskId, tasks[duplicatedTask]);

  refreshTasksUI(); // Refresh the UI to reflect the changes

  toggleModal(false, elements.editTaskModal); // Close the modal
};

/*************************************************************************************************************************************************/

const init = () => {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const LightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", LightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
};

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});
