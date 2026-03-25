import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  where,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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
const db = getFirestore(app);

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
    loadLists();
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

let lists = [];

async function saveListToFirestore(list) {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "lists"), {
    userId: user.uid,
    name: list.name,
    color: list.color,
    tasks: list.tasks || [],
    createdAt: serverTimestamp(),
  });
}

async function loadLists() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "lists"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  lists = [];

  snapshot.forEach((doc) => {
    lists.push({
      listId: doc.id,
      ...doc.data(),
    });
  });
  lists.reverse();
  showAllLists();

  const selectedListId = localStorage.getItem("selectedListId");
  if (selectedListId) {
    showSingleList(selectedListId);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const buttonCreateList = document.getElementById("buttonCreateList");

  if (!buttonCreateList) return;

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
  textArea.placeholder = "List shall have a name";

  const labelCheckbox = document.createElement("p");

  labelCheckbox.append("Choose a List Color");

  const divCheckbox = document.createElement("div");
  divCheckbox.classList.add("divCheckbox");

  const divError = document.createElement("div");
  divError.classList.add("divError");

  const buttonSave = document.createElement("button");
  buttonSave.classList.add("buttonSave");
  buttonSave.innerHTML = "Save";

  const colorOptions = [
    "Lime",
    "Aqua",
    "Yellow",
    "Purple",
    "CherryRed",
    "Pink",
    "Orange",
    "Blue",
  ];

  container.appendChild(textArea);
  container.appendChild(labelCheckbox);

  colorOptions.forEach((color) => {
    const label = document.createElement("label");

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "colorOfList";
    radioInput.value = color;

    label.appendChild(radioInput);
    label.append(" " + color);

    divCheckbox.appendChild(label);
  });

  container.appendChild(divCheckbox);

  container.appendChild(divError);
  container.appendChild(buttonSave);

  creatingDiv.appendChild(container);

  // SAVING A LIST
  buttonSave.addEventListener("click", async (event) => {
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
      'input[name="colorOfList"]:checked',
    );

    const color = selectedRadio ? selectedRadio.value : "default";

    const newList = {
      name,
      color,
      tasks: [],
    };

    await saveListToFirestore(newList);

    loadLists();

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

  if (!divToShowLists) return;

  divToShowLists.innerHTML = "";

  const imageMap = {
    Lime: "ToDoListImgs/yellowpink.png",
    Aqua: "ToDoListImgs/orange.png",
    Yellow: "ToDoListImgs/pink.png",
    Purple: "ToDoListImgs/yellow.png",
    CherryRed: "ToDoListImgs/blue2.png",
    Pink: "ToDoListImgs/green2.png",
    Orange: "ToDoListImgs/green.png",
    Blue: "ToDoListImgs/pink.png",
    default: "ToDoListImgs/yellow.png",
  };

  lists.forEach((list) => {
    const divToShowSingleList = document.createElement("div");

    switch (list.color) {
      case "Lime":
        divToShowSingleList.classList.add("LimeList");
        break;

      case "Aqua":
        divToShowSingleList.classList.add("AquaList");
        break;

      case "Yellow":
        divToShowSingleList.classList.add("YellowList");
        break;

      case "Purple":
        divToShowSingleList.classList.add("PurpleList");
        break;

      case "CherryRed":
        divToShowSingleList.classList.add("CherryRedList");
        break;

      case "Pink":
        divToShowSingleList.classList.add("PinkList");
        break;

      case "Orange":
        divToShowSingleList.classList.add("OrangeList");
        break;

      case "Blue":
        divToShowSingleList.classList.add("BlueList");
        break;

      default:
        divToShowSingleList.classList.add("DefaultColorList");
        break;
    }

    const divToShowSingleListImage = document.createElement("img");
    divToShowSingleListImage.src = imageMap[list.color] || imageMap.default;

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

function formatDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  const date = new Date(year, month - 1, day); // 👈 AQUI MUDA TUDO

  const dayFormatted = String(date.getDate()).padStart(2, "0");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthName = months[date.getMonth()];
  const yearFormatted = date.getFullYear();

  return ` ${dayFormatted} - ${monthName} - ${yearFormatted}`;
}

function showSingleList(id) {
  const divListsAndTaks = document.getElementById("listsAndTasks");
  if (!divListsAndTaks) return;
  divListsAndTaks.innerHTML = "";

  const index = lists.findIndex((list) => list.listId === id);

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
    buttonSaveChangesList.textContent = "Save";
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
    listInput.id = "listInput";
    listInput.placeholder = "Type here your new task";
    listInput.maxLength = 100;

    const buttonCreateTask = document.createElement("button");
    buttonCreateTask.id = "buttonCreateTask";
    buttonCreateTask.innerHTML = "Create";

    const divDeleteAllTasks = document.createElement("div");
    divDeleteAllTasks.classList.add("divDeleteAllTasks");
    const buttonDeleteAllTasks = document.createElement("button");
    buttonDeleteAllTasks.id = "buttonDeleteAllTasks";
    buttonDeleteAllTasks.innerText = "Delete all Tasks";

    const divOrganizeTask = document.createElement("div");
    divOrganizeTask.classList.add("divOrganizeTask");

    const divOrganizeTaskP = document.createElement("p");
    divOrganizeTaskP.innerText = "Show tasks by:";

    const divOrganizeTaskSpan = document.createElement("span");
    divOrganizeTaskSpan.id = "divOrganizeTaskSpan";

    const buttonOrganizeByCreation = document.createElement("button");
    buttonOrganizeByCreation.id = "buttonOrganizeByCreation";
    buttonOrganizeByCreation.innerText = "creation";

    const buttonOrganizeByDate = document.createElement("button");
    buttonOrganizeByDate.id = "buttonOrganizeByDate";
    buttonOrganizeByDate.innerText = "date";

    const divOrganizeTaskSpan2 = document.createElement("span");
    divOrganizeTaskSpan2.id = "divOrganizeTaskSpan2";

    const buttonOrganizeByMonth = document.createElement("button");
    buttonOrganizeByMonth.id = "buttonOrganizeByMonth";
    buttonOrganizeByMonth.innerText = "month";

    const buttonOrganizeByHour = document.createElement("button");
    buttonOrganizeByHour.id = "buttonOrganizeByHour";
    buttonOrganizeByHour.innerText = "hour";

    divOrganizeTaskSpan.appendChild(buttonOrganizeByCreation);
    divOrganizeTaskSpan.appendChild(buttonOrganizeByDate);
    divOrganizeTaskSpan2.appendChild(buttonOrganizeByMonth);
    divOrganizeTaskSpan2.appendChild(buttonOrganizeByHour);

    divOrganizeTask.appendChild(divOrganizeTaskP);

    divOrganizeTask.appendChild(divOrganizeTaskSpan);
    divOrganizeTask.appendChild(divOrganizeTaskSpan2);

    const colorClass = lists[index].color.trim();

    divShowing.classList.add("divShowing", colorClass);

    divCreateTask.classList.add("divCreateTask", colorClass);
    divDeleteAllTasks.classList.add("divDeleteAllTasks", colorClass);
    divOrganizeTask.classList.add("divOrganizeTask", colorClass);

    buttonOrganizeByCreation.onclick = () => {
      const tasks = lists[index].tasks || [];
      lists[index].tasks = [...tasks].sort((a, b) => a.id - b.id);
      showSingleList(lists[index].listId);
    };

    buttonOrganizeByMonth.onclick = () => {
      const tasks = lists[index].tasks || [];

      if (!tasks.every((t) => t.day && t.day.trim() !== "")) {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent =
          "To Organize tasks by Day and Month, all the tasks must have a defined date.";
        modalButtonNo.style.display = "none";
        modalButtonYes.innerText = "Ok";

        modalButtonYes.onclick = () => {
          modalDeleteList.style.display = "none";
          modalButtonNo.style.display = "inline-block";
          modalButtonYes.innerText = "Yes";
        };
        return;
      }

      lists[index].tasks = [...tasks].sort((a, b) => {
        const [yA, mA, dA] = a.day.split("-");
        const [yB, mB, dB] = b.day.split("-");

        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);

        const monthA = dateA.getMonth();
        const monthB = dateB.getMonth();

        if (monthA !== monthB) {
          return monthA - monthB;
        }

        const dayA = dateA.getDate();
        const dayB = dateB.getDate();

        return dayA - dayB;
      });

      showSingleList(lists[index].listId);
    };

    buttonOrganizeByDate.onclick = () => {
      const tasks = lists[index].tasks || [];
      if (!tasks.every((t) => t.day && t.day.trim() !== "")) {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent =
          "To Organize tasks by Date, all the tasks must have a defined date.";
        modalButtonNo.style.display = "none";
        modalButtonYes.innerText = "Ok";

        modalButtonYes.onclick = () => {
          modalDeleteList.style.display = "none";
          modalButtonNo.style.display = "inline-block";
          modalButtonYes.innerText = "Yes";
        };
        return;
      }
      lists[index].tasks = [...tasks].sort((a, b) => {
        const [yA, mA, dA] = a.day.split("-");
        const [yB, mB, dB] = b.day.split("-");

        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
      });
      showSingleList(lists[index].listId);
    };

    buttonOrganizeByHour.onclick = () => {
      const tasks = lists[index].tasks || [];
      if (
        !tasks.every(
          (t) => t.day && t.day.trim() !== "" && t.time && t.time.trim() !== "",
        )
      ) {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent =
          "To Organize tasks by Hour, all the tasks must have a defined hour.";
        modalButtonNo.style.display = "none";
        modalButtonYes.innerText = "Ok";

        modalButtonYes.onclick = () => {
          modalDeleteList.style.display = "none";
          modalButtonNo.style.display = "inline-block";
          modalButtonYes.innerText = "Yes";
        };
        return;
      }
      lists[index].tasks = [...tasks].sort((a, b) => {
        const [yA, mA, dA] = a.day.split("-");
        const [yB, mB, dB] = b.day.split("-");

        const [hA, minA] = a.time.split(":");
        const [hB, minB] = b.time.split(":");

        const dateA = new Date(yA, mA - 1, dA, hA, minA);
        const dateB = new Date(yB, mB - 1, dB, hB, minB);

        return dateA - dateB;
      });
      showSingleList(lists[index].listId);
    };

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

      modalButtonYes.onclick = async () => {
        await deleteDoc(doc(db, "lists", id));

        lists = lists.filter((list) => list.listId !== id);

        window.location.href = "app.html";

        modalDeleteList.style.display = "none";
      };
    });

    //EDIT LIST
    buttonEditList.addEventListener("click", () => {
      if (buttonEditList) {
        listName.contentEditable = true;
        listName.focus();

        buttonEditList.style.display = "none";
        buttonDeleteList.style.display = "none";
        buttonSaveChangesList.style.display = "inline-block";
        buttonCancelEditList.style.display = "inline-block";

        buttonSaveChangesList.addEventListener("click", async () => {
          lists[index].name = listName.textContent;

          await updateDoc(doc(db, "lists", id), {
            name: listName.textContent,
          });

          listName.contentEditable = false;

          buttonEditList.style.display = "inline-block";
          buttonDeleteList.style.display = "inline-block";
          buttonSaveChangesList.style.display = "none";
          buttonCancelEditList.style.display = "none";

          showSingleList(id);
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
    const spanForTime = document.createElement("span");
    spanForTime.id = "spanForTime";

    const labelForTime = document.createElement("label");
    labelForTime.innerText = "Select Hour";
    labelForTime.htmlFor = "inputForTime";

    const inputForTime = document.createElement("input");
    inputForTime.id = "inputForTime";
    inputForTime.type = "time";
    inputForTime.addEventListener("click", () => {
      inputForTime.showPicker();
    });

    const spanForDay = document.createElement("span");
    spanForDay.id = "spanForDay";

    const labelForDay = document.createElement("label");
    labelForDay.innerText = "Select Date";
    labelForDay.htmlFor = "inputForDay";

    const inputForDay = document.createElement("input");
    inputForDay.id = "inputForDay";
    inputForDay.type = "date";
    inputForDay.addEventListener("click", () => {
      inputForDay.showPicker();
    });

    buttonCreateTask.addEventListener("click", async () => {
      if (!listInput.value.trim()) return;
      const day = inputForDay.value;
      const time = inputForTime.value;

      let newTask = {
        id: Date.now(),
        taskName: listInput.value.trim(),
        completed: false,
        day,
        time,
      };

      lists[index].tasks = lists[index].tasks || [];

      lists[index].tasks.push(newTask);

      await updateDoc(doc(db, "lists", id), {
        tasks: lists[index].tasks,
      });
      listInput.value = "";

      inputForDay.value = "";
      inputForTime.value = "";

      showSingleList(id);
    });

    spanForButton.appendChild(buttonEditList);
    spanForButton.appendChild(buttonDeleteList);
    spanForButton.appendChild(buttonSaveChangesList);
    spanForButton.appendChild(buttonCancelEditList);

    divShowing.appendChild(listName);
    divShowing.appendChild(spanForButton);

    divCreateTask.appendChild(listInput);

    const divForTime = document.createElement("div");
    divForTime.id = "divForTime";

    spanForTime.appendChild(labelForTime);
    spanForTime.appendChild(inputForTime);

    spanForDay.appendChild(labelForDay);
    spanForDay.appendChild(inputForDay);

    divForTime.appendChild(spanForDay);
    divForTime.appendChild(spanForTime);

    divCreateTask.appendChild(divForTime);

    divCreateTask.appendChild(buttonCreateTask);

    divDeleteAllTasks.append(buttonDeleteAllTasks);

    divListsAndTaks.appendChild(divShowing);
    divListsAndTaks.appendChild(divCreateTask);
    divListsAndTaks.appendChild(divDeleteAllTasks);
    divListsAndTaks.appendChild(divOrganizeTask);
    divListsAndTaks.appendChild(divAllTasks);

    (lists[index].tasks || []).forEach((thisTask, count) => {
      const divTask = document.createElement("div");
      divTask.classList.add("divTask");
      const spanForTask = document.createElement("span");
      spanForTask.classList.add("spanForTask");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("thecheckbox");
      checkbox.checked = thisTask.completed || false;

      checkbox.addEventListener("change", async () => {
        thisTask.completed = checkbox.checked;
        await updateDoc(doc(db, "lists", lists[index].listId), {
          tasks: lists[index].tasks,
        });
      });

      const numberTaskP = document.createElement("p");
      numberTaskP.id = "numberTaskP";
      numberTaskP.innerText = count + 1 + "-";

      const divTimeHourTask = document.createElement("div");
      divTimeHourTask.id = "divTaskHourTask";

      const hourP = document.createElement("p");
      hourP.innerText = thisTask.time || "";

      const dayP = document.createElement("p");
      dayP.innerText = formatDate(thisTask.day);

      const inputForChangeDay = document.createElement("input");
      inputForChangeDay.id = "inputForChangeDay";
      inputForChangeDay.type = "date";
      inputForChangeDay.style.display = "none";
      inputForChangeDay.value = thisTask.day || "";
      inputForChangeDay.addEventListener("click", () => {
        inputForChangeDay.showPicker();
      });

      const inputForChangeHour = document.createElement("input");
      inputForChangeHour.id = "inputForChangeHour";
      inputForChangeHour.type = "time";
      inputForChangeHour.style.display = "none";
      inputForChangeHour.value = thisTask.time || "";

      divTimeHourTask.appendChild(inputForChangeDay);
      divTimeHourTask.appendChild(dayP);
      divTimeHourTask.appendChild(inputForChangeHour);
      divTimeHourTask.appendChild(hourP);
      if ((count + 1) % 2 !== 0) {
        divTask.classList.add("divTaskColor1", colorClass);
      } else {
        divTask.classList.add("divTaskColor2", colorClass);
      }
      inputForChangeHour.addEventListener("click", () => {
        inputForChangeHour.showPicker();
      });

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

      const spanToSaveEdit = document.createElement("span");
      spanToSaveEdit.id = "spanToSaveEdit";
      spanToSaveEdit.display = "none";

      const buttonToSaveEdit = document.createElement("button");
      buttonToSaveEdit.innerHTML = "Save Changes";
      buttonToSaveEdit.id = "buttonToSaveEdit";
      buttonToSaveEdit.style.display = "none";

      spanToSaveEdit.appendChild(buttonToSaveEdit);

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

          if (hourP) {
            hourP.style.display = "none";
            inputForChangeHour.style.display = "inline-block";
          }
          if (dayP) {
            dayP.style.display = "none";
            inputForChangeDay.style.display = "inline-block";
          }

          buttonEditTask.style.display = "none";
          buttonDeleteTask.style.display = "none";
          spanToSaveEdit.style.display = "inline-block";
          buttonToSaveEdit.style.display = "inline-block";

          buttonToSaveEdit.onclick = async () => {
            lists[index].tasks[taskIndex].taskName = theTaskP.textContent;
            lists[index].tasks[taskIndex].time = inputForChangeHour.value;
            lists[index].tasks[taskIndex].day = inputForChangeDay.value;

            await updateDoc(doc(db, "lists", lists[index].listId), {
              tasks: lists[index].tasks,
            });

            theTaskP.contentEditable = false;

            hourP.style.display = "inline-block";
            inputForChangeHour.style.display = "none";

            dayP.style.display = "inline-block";
            inputForChangeDay.style.display = "none";

            buttonEditTask.style.display = "inline-block";
            buttonDeleteTask.style.display = "inline-block";

            buttonToSaveEdit.style.display = "none";
            spanToSaveEdit.style.display = "none";

            editTaskClicked = false;

            showSingleList(lists[index].listId);
          };

          setTimeout(() => {
            window.scrollTo(0, pagePosition);
          }, 0);
        }
      });

      //REMOVE TASK

      buttonDeleteTask.onclick = async () => {
        const pagePosition = window.scrollY;

        lists[index].tasks = lists[index].tasks.filter(
          (task) => task.id !== thisTask.id,
        );

        await updateDoc(doc(db, "lists", lists[index].listId), {
          tasks: lists[index].tasks,
        });

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

      divTask.appendChild(divTimeHourTask);
      divTask.appendChild(spanForTask);
      divTask.appendChild(spanForButton);
      divTask.appendChild(spanToSaveEdit);

      divAllTasks.appendChild(divTask);
    });

    //REMOVE ALL TASKS ----------------------------------------------------------------------------

    buttonDeleteAllTasks.onclick = async () => {
      if (lists[index].tasks && lists[index].tasks.length > 0) {
        modalDeleteList.style.display = "flex";
        modalDeleteListText.textContent =
          "Are you sure you want to remove all the tasks? It will not be possible to recover them after that.";

        modalButtonNo.onclick = () => {
          modalDeleteList.style.display = "none";
        };
        modalButtonYes.onclick = async () => {
          lists[index].tasks = [];
          await updateDoc(doc(db, "lists", lists[index].listId), {
            tasks: [],
          });

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
    console.log(lists[index]);
  } else {
    console.log("List not found");
  }
}
