import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

//import {
//    getFirestore,
//    collection,
//    addDoc,
//    getDocs,
//    query,
//    doc,
//    updateDoc,
//    deleteDoc,
//    orderBy,
//    serverTimestamp
//} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// personal firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqnrddxP12NkFjVFmMgzbHIRLUf0SX2rQ",
  authDomain: "fortodolist-9e4aa.firebaseapp.com",
  projectId: "fortodolist-9e4aa",
  storageBucket: "fortodolist-9e4aa.firebasestorage.app",
  messagingSenderId: "316230168384",
  appId: "1:316230168384:web:3f767a6c322ca5a8f4d4a5",
  measurementId: "G-SW1X07D2RV",
};

// inicia o firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//to create nice advices
function advices(advice, type) {
  const adviceDiv = document.getElementById("advices");

  if (adviceDiv.firstChild) {
    adviceDiv.removeChild(adviceDiv.firstChild);
  }

  const message = document.createElement("p");
  message.innerText = advice;

  if (type === "success") {
    message.classList.add("success-color");
  } else if (type === "error") {
    message.classList.add("error-color");
  }

  adviceDiv.appendChild(message);
}

//to register
const buttonRegister = document.getElementById("buttonRegister");

if (buttonRegister) {
  buttonRegister.onclick = (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    window.createAccount(email, password, confirmPassword);
  };
}

window.createAccount = (email, password, confirmPassword) => {
  if (password !== confirmPassword) {
    const message = "Passwords must match!";
    advices(message, "success");
    return;
  }

  if (password.length < 6) {
    const errorMessage = "Please use at least 6 characters for your password.";
    advices(errorMessage, "error");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const message = "Account created successfully!";
      advices(message, "success");

      console.log("User:", userCredential.user);

      setTimeout(() => {
        window.location.href = "app.html";
      }, 1700);
    })
    .catch((error) => {
      console.error(error.code);

      const errorMessage = "Error: Account couldn't be created";
      advices(errorMessage, "error");

      console.log(error.message);
    });
};

// --- login ---
const buttonLogin = document.getElementById("buttonLogin");

if (buttonLogin) {
  buttonLogin.onclick = (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    window.LogIn(email, password);
  };
}

window.LogIn = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const message = "Login successful!";
      advices(message, "success");

      setTimeout(() => {
        window.location.href = "app.html";
      }, 2000);
    })
    .catch((error) => {
      const errorMessage =
        "Login failed: Please check your email and password.";

      advices(errorMessage, "error");
    });
};

// --- to know if user is loged in---

onAuthStateChanged(auth, (user) => {
  const isAppPage = window.location.pathname.includes("app.html");

  const isLoginPage =
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/";

  if (user) {
    console.log("Currently logged in user:", user.email);

    if (isLoginPage) {
      window.location.href = "app.html";
    }
  } else {
    console.log("No user is logged in.");

    if (isAppPage) {
      window.location.href = "index.html";
    }
  }
});

const buttonSignOut = document.getElementById("buttonSignOut");

if (buttonSignOut) {
  buttonSignOut.onclick = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Error signing out ", error);
      });
  };
}

//----------------------------------------------------------------------
//THE LOGIC OF THE DIV THAT WILL APPEAR TO ADD NEW LISTS IS DOWN BELLOW
//----------------------------------------------------------------------

let lists = JSON.parse(localStorage.getItem("lists")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const buttonCreateList = document.getElementById("buttonCreateList");

  const creatingDiv = document.getElementById("creatingDiv");

  const container = document.createElement("div");
  container.classList.add("divForCreation");
  container.style.display = "none";

  buttonCreateList.onclick = () => {
    if (container.style.display === "none") {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  };

  const textArea = document.createElement("textarea");
  textArea.classList.add("textArea");
  textArea.rows = 5;
  textArea.maxLength = 100;
  textArea.placeholder = "List shall be a name";

  const labelCheckbox = document.createElement("label");
  labelCheckbox.append("Choose a List Type");

  const divCheckbox = document.createElement("div");
  divCheckbox.classList.add("divCheckbox");

  const divError = document.createElement("div");
  divError.classList.add("divError");

  const buttonSave = document.createElement("button");
  buttonSave.classList.add("buttonSave");
  buttonSave.innerHTML = "Salvar";

  const options = ["for Day", "for Year", "for Life"];

  container.appendChild(textArea);
  container.appendChild(document.createElement("br"));
  container.appendChild(labelCheckbox);

  options.forEach((option) => {
    const label = document.createElement("label");

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "typeOfList";
    radioInput.value = option;

    label.appendChild(radioInput);
    label.append(" " + option);

    divCheckbox.appendChild(label);
  });

  container.appendChild(divCheckbox);
  container.appendChild(divError);
  container.appendChild(buttonSave);

  creatingDiv.appendChild(container);

  // SAVING A LIST
  buttonSave.addEventListener("click", (event) => {
    event.preventDefault();

    const name = textArea.value.trim();

    divError.innerHTML = "";
    if (!name) {
      const error = document.createElement("p");
      error.innerHTML = "Please, give a name to your list";

      divError.appendChild(error);
      return;
    }

    const selectedRadio = container.querySelector(
      'input[name="typeOfList"]:checked',
    );

    const type = selectedRadio ? selectedRadio.value : null;

    const newList = { listId: Date.now(), name, type, tasks: [] };

    lists.push(newList);

    localStorage.setItem("lists", JSON.stringify(lists));

    showAllLists();

    textArea.value = "";

    if (selectedRadio) {
      selectedRadio.checked = false;
    }

    container.style.display = "none";
  });
});

//--------------------------------------------------
//HERE  WILL START THE LOGIC FOR THE LISTS AND TASKS.
//---------------------------------------------------

//SHOW ALL LISTS
function showAllLists() {
  const divToShowLists = document.getElementById("divToShowLists");
  divToShowLists.innerHTML = "";

  const imageMap = {
    "for Day": "https://www.emojiall.com/images/240/openmoji/16.0/1f7e3.png",
    "for Year": "https://www.emojiall.com/images/240/openmoji/16.0/1f7e2.png",
    "for Life": "https://www.emojiall.com/images/240/openmoji/16.0/1f535.png",
    default: "https://www.emojiall.com/images/240/openmoji/16.0/26aa.png",
  };

  lists.forEach((list) => {
    const divToShowSingleList = document.createElement("div");
    divToShowSingleList.classList.add("divToShowSingleList");

    const divToShowSingleListImage = document.createElement("img");
    divToShowSingleListImage.src = imageMap[list.type] || imageMap.default;

    const divToShowSingleListP = document.createElement("p");
    divToShowSingleListP.textContent = list.name;

    divToShowSingleList.appendChild(divToShowSingleListImage);
    divToShowSingleList.appendChild(divToShowSingleListP);

    divToShowLists.prepend(divToShowSingleList);

    divToShowSingleList.addEventListener("click", () => {
      localStorage.setItem("selectedListId", list.listId);
      window.location.href = "list.html";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  showAllLists();
});

//MODAL MODAL --------------------------------------------------------------
const modalDeleteList = document.createElement("div");
modalDeleteList.id = "modalDeleteList";

const modalDeleteListContent = document.createElement("div");
modalDeleteListContent.id = "modalDeleteListContent";

const modalDeleteListText = document.createElement("p");

const modalDeleteListButtons = document.createElement("div");
modalDeleteListButtons.id = "modalDeleteListButtons";

const modalButtonYes = document.createElement("button");
modalButtonYes.id = "modalButtonYes";
modalButtonYes.textContent = "Yes";
const modalButtonNo = document.createElement("button");
modalButtonNo.id = "modalButtonNo";
modalButtonNo.textContent = "No";

modalDeleteListButtons.appendChild(modalButtonYes);
modalDeleteListButtons.appendChild(modalButtonNo);

modalDeleteListContent.appendChild(modalDeleteListText);
modalDeleteListContent.appendChild(modalDeleteListButtons);

modalDeleteList.appendChild(modalDeleteListContent);

document.body.appendChild(modalDeleteList);

modalDeleteList.style.display = "none";

//SHOWING A LIST
function showSingleList(id) {
  const divListsAndTaks = document.getElementById("listsAndTasks");
  if (!divListsAndTaks) return;
  divListsAndTaks.innerHTML = "";

  const index = lists.findIndex((list) => list.listId === Number(id));

  if (index === -1) {
    console.log("List not found");
    return;
  }
  if (index !== -1) {
    const divShowing = document.createElement("div");
    divShowing.classList.add("divShowing");

    const listName = document.createElement("h2");
    listName.innerText = lists[index].name;

    const spanForButton = document.createElement("span");

    const buttonEditList = document.createElement("button");
    buttonEditList.id = "editList";
    buttonEditList.textContent = "Edit List";

    const buttonSaveChangesList = document.createElement("button");
    buttonSaveChangesList.id = "buttonSaveChangesList";
    buttonSaveChangesList.textContent = "Save Changes";
    buttonSaveChangesList.style.display = "none";

    const buttonCancelEditList = document.createElement("button");
    buttonCancelEditList.textContent = "Cancel";
    buttonCancelEditList.style.display = "none";
    buttonCancelEditList.id = "buttonCancelEditList";

    const buttonDeleteList = document.createElement("button");
    buttonDeleteList.id = "deleteList";
    buttonDeleteList.textContent = "Delete";

    const divCreateTask = document.createElement("div");
    divCreateTask.classList.add("divCreateTask");

    const listInput = document.createElement("input");
    listInput.placeholder = "Type here your new task";
    listInput.maxLength = 100;

    const buttonCreateTask = document.createElement("button");
    buttonCreateTask.id = "buttonCreateTask";
    buttonCreateTask.innerHTML = "Create";

    const divDeleteAllTasks = document.createElement("div");
    divDeleteAllTasks.id = "divDeleteAllTasks";
    const buttonDeleteAllTasks = document.createElement("button");
    buttonDeleteAllTasks.id = "buttonDeleteAllTasks";
    buttonDeleteAllTasks.innerText = "Delete all Tasks";

    const divAllTasks = document.createElement("div");
    divAllTasks.classList.add("divAllTasks");

    //DELETE LIST
    buttonDeleteList.addEventListener("click", () => {
      modalDeleteList.style.display = "flex";

      modalDeleteListText.textContent =
        "Are you sure you want to delete this list? Will not be possible to recuperate after that";

      modalButtonNo.onclick = () => {
        modalDeleteList.style.display = "none";
      };

      modalButtonYes.onclick = () => {
        lists = lists.filter((list) => list.listId !== Number(id));

        localStorage.setItem("lists", JSON.stringify(lists));

        window.location.href = "app.html";

        modalDeleteList.style.display = "none";
      };
    });

    //EDIT LIST
    buttonEditList.addEventListener("click", () => {
      //const editListIsClicked = false;

      if (buttonEditList) {
        listName.contentEditable = true;
        listName.focus();

        buttonEditList.style.display = "none";
        buttonDeleteList.style.display = "none";
        buttonSaveChangesList.style.display = "inline-block";
        buttonCancelEditList.style.display = "inline-block";

        buttonSaveChangesList.addEventListener("click", () => {
          lists[index].name = listName.textContent;

          listName.contentEditable = false;

          localStorage.setItem("lists", JSON.stringify(lists));

          buttonEditList.style.display = "inline-block";
          buttonDeleteList.style.display = "inline-block";
          buttonSaveChangesList.style.display = "none";
          buttonCancelEditList.style.display = "none";

          showSingleList(Number(id));
        });

        buttonCancelEditList.addEventListener("click", () => {
          listName.textContent = lists[index].name;
          listName.contentEditable = false;
          buttonEditList.style.display = "inline-block";
          buttonDeleteList.style.display = "inline-block";
          buttonSaveChangesList.style.display = "none";
          buttonCancelEditList.style.display = "none";
        });
      }
    });

    //SAVING TASK

    buttonCreateTask.addEventListener("click", () => {
      if (!listInput.value.trim()) return;

      const newTask = { id: Date.now(), taskName: listInput.value.trim() };

      lists[index].tasks = lists[index].tasks || [];
      lists[index].tasks.push(newTask);

      localStorage.setItem("lists", JSON.stringify(lists));

      listInput.value = "";

      showSingleList(Number(id));
    });

    spanForButton.appendChild(buttonEditList);
    spanForButton.appendChild(buttonDeleteList);
    spanForButton.appendChild(buttonSaveChangesList);
    spanForButton.appendChild(buttonCancelEditList);

    divShowing.appendChild(listName);
    divShowing.appendChild(spanForButton);

    divCreateTask.appendChild(listInput);
    divCreateTask.appendChild(buttonCreateTask);

    divDeleteAllTasks.append(buttonDeleteAllTasks);

    divListsAndTaks.appendChild(divShowing);
    divListsAndTaks.appendChild(divCreateTask);
    divListsAndTaks.appendChild(divDeleteAllTasks);
    divListsAndTaks.appendChild(divAllTasks);

    lists[index].tasks.forEach((thisTask, count) => {
      const divTask = document.createElement("div");
      divTask.classList.add("divTask");
      const spanForTask = document.createElement("span");
      spanForTask.classList.add("spanForTask");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("thecheckbox");

      const numberTaskP = document.createElement("p");
      numberTaskP.id = "numberTaskP";
      numberTaskP.innerText = count + 1 + "-";

      if ((count + 1) % 2 !== 0) {
        divTask.id = "divTaskColor1";
      } else {
        divTask.id = "divTaskColor2";
      }

      const theTaskP = document.createElement("p");
      theTaskP.textContent = thisTask.taskName;
      theTaskP.classList.add("pTask");

      const spanForButton = document.createElement("span");
      spanForButton.classList.add("spanForButton");

      const buttonEditTask = document.createElement("button");
      buttonEditTask.id = "buttonEditTask";
      buttonEditTask.innerHTML = "Edit";

      const buttonDeleteTask = document.createElement("button");
      buttonDeleteTask.id = "buttonDeleteTask";
      buttonDeleteTask.innerHTML = "Delete";

      const buttonToSaveEdit = document.createElement("button");
      buttonToSaveEdit.innerHTML = "Save Changes";
      buttonToSaveEdit.id = "buttonToSaveEdit";
      buttonToSaveEdit.style.display = "none";

      // EDIT TASK

      let editTaskClicked = false;

      buttonEditTask.addEventListener("click", () => {
        const pagePosition = window.scrollY;

        const taskId = thisTask.id;

        const taskIndex = lists[index].tasks.findIndex(
          (task) => task.id === taskId,
        );

        if (!editTaskClicked) {
          editTaskClicked = true;

          theTaskP.contentEditable = true;
          theTaskP.focus();

          buttonEditTask.style.display = "none";
          buttonDeleteTask.style.display = "none";

          buttonToSaveEdit.style.display = "inline-block";

          buttonToSaveEdit.onclick = () => {
            lists[index].tasks[taskIndex].taskName = theTaskP.textContent;

            localStorage.setItem("lists", JSON.stringify(lists));

            theTaskP.contentEditable = false;

            buttonEditTask.style.display = "inline-block";
            buttonDeleteTask.style.display = "inline-block";

            buttonToSaveEdit.style.display = "none";

            editTaskClicked = false;

            showSingleList(lists[index].listId);
          };

          setTimeout(() => {
            window.scrollTo(0, pagePosition);
          }, 0);
        }
      });

      //REMOVE TASK

      buttonDeleteTask.onclick = () => {
        const pagePosition = window.scrollY;

        lists[index].tasks = lists[index].tasks.filter(
          (task) => task.id !== thisTask.id,
        );

        localStorage.setItem("lists", JSON.stringify(lists));

        showSingleList(lists[index].listId);

        setTimeout(() => {
          window.scrollTo(0, pagePosition);
        }, 0);
      };

      spanForButton.appendChild(buttonEditTask);
      spanForButton.appendChild(buttonDeleteTask);

      spanForTask.appendChild(checkbox);
      spanForTask.appendChild(numberTaskP);
      spanForTask.appendChild(theTaskP);

      divTask.appendChild(spanForTask);
      divTask.appendChild(spanForButton);
      divTask.appendChild(buttonToSaveEdit);

      divAllTasks.appendChild(divTask);

      //divListsAndTaks.appendChild(divAllTasks);
    });

    //REMOVE ALL TASKS ----------------------------------------------------------------------------

    buttonDeleteAllTasks.onclick = () => {
      if (lists[index].tasks && lists[index].tasks.length > 0) {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent =
          "Are you sure you want to remove all the tasks? It will not be possible to recover them after that.";

        modalButtonNo.onclick = () => {
          modalDeleteList.style.display = "none";
        };
        modalButtonYes.onclick = () => {
          lists[index].tasks = [];
          localStorage.setItem("lists", JSON.stringify(lists));

          modalDeleteList.style.display = "none";

          showSingleList(lists[index].listId);
        };
      } else {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent = "This list has no tasks.";
        modalButtonNo.style.display = "none";
        modalButtonYes.innerText = "Ok";

        modalButtonYes.onclick = () => {
          modalDeleteList.style.display = "none";
          modalButtonNo.style.display = "inline-block";
          modalButtonYes.innerText = "Yes";
        };
      }
    };
  }
  if (index !== -1) {
    // todo o código da lista
    console.log(lists[index]);
  } else {
    console.log("List not found");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const selectedListId = localStorage.getItem("selectedListId");

  if (selectedListId) {
    showSingleList(Number(selectedListId));
  }
});

/*
TODO

NEXT STEPS:

* Add a new category type with options to create lists based on hours or days
* Add functionality to check if radio inputs exist
* Fix null pointer bugs on lines 192, and 291 (null).

* Implement data separation by user.
* Move the logic to Firebase Database
* Try to implement notifications based on task time and day
* Improve the design
* Add media queries :)
  */

//----------------------------------------------------------------
//DEALING WITH TASKS
//-----------------------------------------------------------------
