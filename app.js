
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged ,
    signOut
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
    measurementId: "G-SW1X07D2RV"
};

// inicia o firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


//to create nice advices
function advices(advice,type){
const adviceDiv = document.getElementById('advices');
if (adviceDiv.firstChild) {
        adviceDiv.removeChild(adviceDiv.firstChild);
    }
const message = document.createElement("p");
message.innerText=advice;

if(type === "success"){
    message.classList.add("success-color");
}else if(type === "error"){
    message.classList.add("error-color")
}


adviceDiv.appendChild(message);

}

//to register
const buttonRegister = document.getElementById("buttonRegister")
if(buttonRegister){
    buttonRegister.onclick=(event)=>{
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        window.createAccount(email,password,confirmPassword);
    }
}


window.createAccount = (email, password, confirmPassword) => {
    
    if (password !== confirmPassword) {

        

        const message="Passwords must match!";
        advices(message,"success");
        return;
    }

    
    if (password.length < 6) {
        const errorMessage="Please use at least 6 characters for your password.";
        advices(errorMessage,"error")
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const message ="Account created successfully!";
            advices(message,"success");
            console.log("User:", userCredential.user);
            setTimeout(()=>{
            window.location.href = "app.html";
            },1700);
        })
        .catch((error) => {
            console.error(error.code);
            const errorMessage ="Error: Account couldn't be created"
            advices(errorMessage,"error");
            console.log(error.message);
        });
};

// --- login ---
const buttonLogin = document.getElementById("buttonLogin");
if(buttonLogin){
    buttonLogin.onclick= (event)=>{
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        window.LogIn(email,password);

    }
}



window.LogIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const message="Login successful!";
            advices(message,"success");
            setTimeout(()=>{
                window.location.href = "app.html"; // Vai para a página 
            },2000);
        })
        .catch((error) => {
            const errorMessage="Login failed: Please check your email and password.";
            advices(errorMessage,"error");
        });
};

// --- to knoe if user is loged in---

onAuthStateChanged(auth, (user) => {
    const isAppPage = window.location.pathname.includes("app.html");
    const isLoginPage = window.location.pathname.includes("index.html") || window.location.pathname === "/";

    if (user) {
        console.log("Currently logged in user:", user.email);
        if (isLoginPage) {
            window.location.href = "app.html";
        }
    } else {
        console.log("No user is logged in.");
        // SÓ expulsa se ele estiver tentando acessar a página restrita (app.html)
        if (isAppPage) {
            window.location.href = "index.html";
        }
    }
});

const buttonSignOut =document.getElementById("buttonSignOut");

if(buttonSignOut){
    buttonSignOut.onclick=()=>{
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

const buttonCreateList = document.getElementById("buttonCreateList");

const creatingDiv = document.getElementById("creatingDiv");
let isClicked = false;
let container = null;
let lists=[];
let listId=0;



 buttonCreateList.onclick=(event)=>{

    
    if(!isClicked){
    event.preventDefault();

     container = document.createElement("div");
     container.classList.add("divForCreation");
    

    const textArea = document.createElement("textarea");
    textArea.classList.add("textArea");
    textArea.rows = 5;
    textArea.maxLength=100;
    textArea.placeholder="A lista deve ter um nome";

    const labelCheckbox = document.createElement("label");
    
    labelCheckbox.append("Choose a List Type");

    const divCheckbox=document.createElement('div');
    divCheckbox.classList.add("divCheckbox")

    const divError=document.createElement('div');
    divError.classList.add("divError");


    const buttonSave = document.createElement("button");
    buttonSave.classList.add("buttonSave");
    buttonSave.innerHTML="Salvar";

    const options = ["for Day", "for Year", "for Life"];




    container.appendChild(textArea);
    container.appendChild(document.createElement("br"))
    
    container.appendChild(labelCheckbox)
        options.forEach(option => {
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
    

    



buttonSave.addEventListener('click',(event)=>{
    event.preventDefault();


    const name = textArea.value;

    if(!name){
      const error = document.createElement("p");
      error.innerHTML="Você deve dar um nome para sua Lista";
      divError.appendChild(error);


      return;
    }
    const selectedRadio = container.querySelector('input[name="typeOfList"]:checked');
    const type = selectedRadio ? selectedRadio.value : null;

    listId++;


    const newList = {listId,name,type,tasks:[]};
    lists.push(newList);
    showAllLists();

    textArea.value="";
    if(selectedRadio)selectedRadio.checked = false;

    

   

});
isClicked=true;
}else {
       container.remove();
       isClicked=false;
       container=null;
    }
}

//---------------------------------------------------
//HERE  WILL START THE LOGIC FOR THE LISTS AND TASKS.
//---------------------------------------------------

//DEALING WITH LISTS

//SHOW ALL LISTS
function showAllLists(){
    const divToShowLists = document.getElementById("divToShowLists");
    divToShowLists.innerHTML = "";

        const imageMap = {
        "for Day": "https://www.emojiall.com/images/240/openmoji/16.0/1f7e3.png",
        "for Year": "https://www.emojiall.com/images/240/openmoji/16.0/1f7e2.png",
        "for Life": "https://www.emojiall.com/images/240/openmoji/16.0/1f535.png",
        "default": "https://www.emojiall.com/images/240/openmoji/16.0/26aa.png"
    };
    
   lists.forEach(list=>{
    const divToShowSingleList = document.createElement("div");
    divToShowSingleList.classList.add("divToShowSingleList");


    const divToShowSingleListImage = document.createElement("img");
    divToShowSingleListImage.src=imageMap[list.type] || imageMap.default;

    const divToShowSingleListP = document.createElement('p');
    divToShowSingleListP.textContent=list.name;

    divToShowSingleList.appendChild(divToShowSingleListImage);
    divToShowSingleList.appendChild(divToShowSingleListP)

    divToShowLists.appendChild(divToShowSingleList);

   });

};

document.addEventListener('DOMContentLoaded',()=>{
    showAllLists();
})

function showList(id){

    const divToShowListAndTaks=document.getElementById("listsAndTasks");
    divToShowListAndTaks.innerHTML = "";


   const index = lists.findIndex((list)=>list.listId === id);


   if(index !== -1){
    const divShowing=document.createElement('div');
    const listName = document.createElement('h2');
    listName.innerText = lists[index].name;

    

    const divCreateTask = document.createElement('div');
    divCreateTask.classList.add("divCreateTask")
     const listInput = document.createElement('input');
    listInput.placeholder = "Type here your new task";
    const buttonSaveTask = document.createElement('button');
    buttonSaveTask.innerHTML="Save";


    buttonSaveTask.addEventListener('click',()=>{

      let lastId;
      if(lists[index].tasks.length === 0){
          lastId = 0;
      }else{
         lastId = lists[index].tasks[list.tasks.length-1].id;
      }
      const newTask = {id:lastId+1,task:listInput.value};
      lists[index].tasks.push(newTask);

    })



    divShowing.appendChild(listName);

    divCreateTask.appendChild(listInput);
    divCreateTask.appendChild(buttonSaveTask);

    
    divToShowListAndTaks.appendChild(divShowing);
    divToShowListAndTaks.appendChild(divCreateTask);


    
    let amount =0;
    

    lists[index].tasks.forEach(thisTask=>{
     const divTask = document.createElement('div');
    divTask.classList.add('divTask');

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";


    const numberTaskP = document.createElement('p');
    numberTaskP.innerText = amount + 1;
    amount ++;


    const theTaskP = document.createElement('p');
    theTaskP.textContent=thisTask.task;


    const buttonEditTask = document.createElement('button');
    buttonEditTask.classList.add('buttonEditTask');
    buttonEditTask.innerHTML="Edit";

    //buttonEditTask.addEventListener('click', ()=>{


      
    //  })

    //})

    
    const buttonDeleteTask = document.createElement('button');
    buttonDeleteTask.classList.add('buttonDeleteTask');
    buttonDeleteTask.innerHTML="Delete"

    
    divTask.appendChild(checkbox);
    divTask.appendChild(numberTaskP);
    divTask.appendChild(theTaskP);
    divTask.appendChild(buttonEditTask);
    divTask.appendChild(buttonDeleteTask);

    divToShowListAndTaks.appendChild(divTask);

    })

      console.log(lists[index])
   }

}

function editList(id,changes){
   const index = lists.find((list)=>list.listId ===id);
   if(index){
      if(changes.name) index.name = changes.name;
      if(changes.type) index.type = changes.type;
   }
   console.log(lists)
}

function removeList(id){
   const index = lists.findIndex((list)=>list.listId===id);
   if(index !== -1){
      lists.splice(index,1);
   }
   console.log(lists);
}


//----------------------------------------------------------------
//DEALING WITH TASKS
//-----------------------------------------------------------------



   function editTask(id,idTask,task){
      const list = lists.find((list)=>list.listId === id);
      if(!list) return;
      const taskToEdit = list.tasks.findIndex((taskToEdit)=> taskToEdit.id === idTask);

      if(taskToEdit !== -1){
         list.tasks[taskToEdit].task = task;

      }
   }

   function removeTask(id,idTask){
   const list = lists.find((list)=>list.listId === id);
   if(!list) return;

      const taskToRemove= list.tasks.findIndex((task)=> task.id ===idTask);
      if(taskToRemove === -1) return;

      list.tasks.splice(taskToRemove,1);

      console.log(list.tasks);

   }
   function removeAllTasks(id){
      const list = lists.find((list)=>list.listId === id);
      if(!list)return;
      list.tasks.length = 0;
   }

   function showTasks(id){
      const list = lists.findIndex((list)=>list.listId === id);
      if(list !== -1) console.log(lists[list].tasks);

   }

      