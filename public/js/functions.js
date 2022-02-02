//show status message to the user
function showStatusMsg(error, msg){
    //getting DOM element for status message
    var status = document.getElementById("statusMsg");
    status.innerHTML = msg;
    status.classList.remove("errorClass");
    status.classList.remove("okClass");

    //if error occured
    if(error){
        status.classList.add("errorClass");
    }else{
        status.classList.add("okClass");
    }

    status.style.display = "block";
    setTimeout(function(){
        status.style.display = "none";
    }, 5000);
}

//send data to the server using fetch()
async function sendData(url = "", data = {}, method = "GET", file = false){
    //if no files are being sent
    if(file == false){
        //if method is get no body can be present
        if(method == "GET"){
            var result = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }   
            });
        }else{
            var result = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)   
            });
        }
    }
    else if(file == true){
        var result = await fetch(url, {
            method: method,
            body: data
        });
    }

    return result.json();
}

//warning modal
function modalControl(msg, path, typeCall, elementHTML){
    //getting the modal element
    var modal = document.getElementById('myModal');

    //getting modal yes/no buttons
    var yesButton = modal.querySelector(".yesButton");
    var noButton = modal.querySelector(".noButton");

    //showing modal box with a message
    modal.getElementsByClassName("msg")[0].innerHTML = msg;
    modal.style.display = "block";

    //creating listener for yes button
    yesButton.addEventListener("click", asnwerYes, false);
    yesButton.path = path;
    yesButton.elementHTML = elementHTML;
    yesButton.typeCall = typeCall;

    //when yes button is clicked, handle the action
    function asnwerYes(e){
        if(e.currentTarget.typeCall == "delete"){
            handleDelete(e.currentTarget.elementHTML, e.currentTarget.path);
        }else if(e.currentTarget.typeCall == "edit"){
            handleEdit(e.currentTarget.elementHTML, e.currentTarget.path);
        }else if(e.currentTarget.typeCall == "add"){
            handleAdd(e.currentTarget.elementHTML, e.currentTarget.path);
        }

        //removing created listeners
        yesButton.removeEventListener("click", asnwerYes, false);
        noButton.removeEventListener("click", answerNo, false);

        //hiding modal box
        modal.style.display = "none";
    }

    //creating listener for no button
    noButton.addEventListener("click", answerNo, false);
    noButton.path = path;
    noButton.elementHTML = elementHTML;
    noButton.typeCall = typeCall;

    //when no button is clicked remove listeners and hide modal box
    function answerNo(e){
        yesButton.removeEventListener("click", asnwerYes, false);
        noButton.removeEventListener("click", answerNo, false);
        modal.style.display = "none";        
    }
  
}

//async delete
async function handleDelete(elementHTML, path){
    //getting the id of the element that should be deleted
    var elementID = elementHTML.split("-")[1];
    var dataObj = {dataID: elementID};

    //sending data to the server
    var result = await sendData(path, dataObj, "DELETE", false);

    //if no errors occured
    if(result.error == false){
        //getting the element
        var elementC = document.getElementById(elementHTML);

        //if the element contains class "card"
        if(elementC.classList.contains("card")){
            var parent = elementC.closest(".data-wrap");
            var parentSpan = parent.querySelector("span");
            var playerCount = parentSpan.innerHTML.split("/");
            parentSpan.innerHTML = (Number(playerCount[0]) - 1) + "/" + playerCount[1];
            elementC.remove();
        }
        else{
            var closestTR = elementC.closest("tr");
            closestTR.remove();
        }

    }
    else if(result.error == true){
        console.log(result.statusMessage);
    }

    //show message to the user
    showStatusMsg(result.error, result.statusMessage);
}

//async edit
async function handleEdit(elementHTML, path){
    //getting the closest <tr> to the delete button clicked to gather all the data
    var closestTR = document.getElementById(elementHTML).closest("tr");

    //getting all child inputs and selects
    var inputs = closestTR.querySelectorAll("input, select");

    const formData = new FormData();
    var arr = {};

    for (var i = 0; i < inputs.length; i++){
        //if input element type is file
        if(inputs[i].getAttribute("type") == "file"){ 
            formData.append(inputs[i].getAttribute("name"), inputs[i].files[0]);
            arr[inputs[i].getAttribute("name")] = inputs[i].files[0];
        }else{
            formData.append(inputs[i].getAttribute("name"), inputs[i].value);
            arr[inputs[i].getAttribute("name")] = inputs[i].value;
        }        
    }

    var x = path.split("/");
    x = x[x.length - 1];
    if(x === "manageGames"){
        var result = await sendData(path, arr, "PUT", false);
    }else{
        var result = await sendData(path, formData, "PUT", true);
    }
    
    //show message to the user
    showStatusMsg(result.error, result.statusMessage);
}

//async add
async function handleAdd(data, path){
    //abort if data object does not have elementHTML or dataInputs properties
    if(!data.elementHTML || !data.dataInputs){
        showStatusMsg(true, "Došlo je do greške prilikom citanja podataka!");
        return false;
    }

    var result = await sendData(path, data.dataInputs, "POST", false);
    if(!result){
        showStatusMsg(true, "Greska u komunikaciji!");
        return false;
    }

    //clearing the form and showing the response message
    clearForm(data.elementHTML);
    showStatusMsg(result.error, result.statusMessage);
    return true;
}

//clearing the form
function clearForm(elementHTML){
    var inputs = elementHTML.querySelectorAll("input, select");
    for(var i = 0; i < inputs.length; i++){
        if(inputs[i].tagName == "INPUT")
            inputs[i].value = "";

        if(inputs[i].tagName == "SELECT")
            inputs[i].selectedIndex = 0;
    }

    var fields = elementHTML.querySelectorAll(".team-name, img");
    if(!fields) return false;

    for(var i = 0; i < fields.length; i++){
        if(fields[i].getAttribute("class") == "team-name")
            fields[i].innerHTML = "-";
        
        if(fields[i].tagName == "IMG")
            fields[i].style.display = "none";
    }

    return true;
}

async function searchPlayersByClubId(e){
    var clubList = e.target.closest("div").querySelector("#clubList");
    var dataFields = e.target.closest("div").querySelector(".dataFields");

    //getting all players in club with an id
    var result = await sendData("/api/getPlayersByClubId/" + clubList.value, {}, "GET", false);

    //resetting the DOM element that holds the results
    dataFields.innerHTML = "";

    //abort if error occured and show the message
    if(result.error){
        showStatusMsg(result.error, result.data);
        return false;
    }

    //abort if returned data is a string (no players found)
    if(typeof result.data == "string"){
        dataFields.innerHTML = result.data;
        return false;
    }

    var html = "";
    var clubsDropdown, positionsDropdown;
    var clubs = result.clubs;
    var players = result.data;
    var positions = result.positions;

    //looping through all players
    for(var i = 0; i < players.length; i++){
        //creating dropdown elements
        clubsDropdown = "<select name='clubID' class='dy-input' id='clubs'>";
        positionsDropdown = "<select name='positionID' class='dy-input' id='positions'>";

        //looping through all clubs
        for(var y = 0; y < clubs.length; y++){
            //if current club is equal to the player's club make it a selected option in dropdown
            if(players[i].clubID == clubs[y].id){
                clubsDropdown += "<option value='"+ clubs[y].id +"' selected>"+ clubs[y].name +"</option>";
            }else{
                clubsDropdown += "<option value='"+ clubs[y].id +"'>"+ clubs[y].name +"</option>";
            }
        }

        //looping through all positions
        for(var y = 0; y < positions.length; y++){
            //if current position is equal to the player's position make it a selected option in dropdown
            if(players[i].positionID == positions[y].id){
                positionsDropdown += "<option value='"+ positions[y].id +"' selected>"+ positions[y].positionName +"</option>";
            }else{
                positionsDropdown += "<option value='"+ positions[y].id +"'>"+ positions[y].positionName +"</option>";
            }
        }

        positionsDropdown += "</select>";
        clubsDropdown += "</select>";

        //creating table data for each player
        html += "<tr><td>" + players[i].id + "<input type='hidden' name='id' value='"+ players[i].id +"'></td>"+
            "<td><img src='/images/"+ players[i].fileName +"' /></td>"+
            "<td><div class='form-item dy-fi'><input class='dy-input' type='text' name='name' value='"+ players[i].name +"'><span class='dy-slider'></span></div></td>"+
            "<td><div class='form-item dy-fi'><input class='dy-input' type='text' name='surname' value='"+ players[i].surname +"'><span class='dy-slider'></span></div></td>"+
            "<td><div class='form-item dy-fi'>"+ clubsDropdown +"<span class='dy-slider-select'></span></div></td>"+
            "<td><div class='form-item dy-fi'>"+ positionsDropdown +"<span class='dy-slider-select'></span></div></td>"+
            "<td><label for='fileToUpload-"+ players[i].id +"' class='center custom-file-upload'><i class='fa fa-cloud-upload'></i> Izaberi sliku</label><input class='dy-input file hiddenIn dy-file' type='file' id='fileToUpload-"+ players[i].id +"' name='pictureFile'><span class='picName'> No file</span></td>"+
            "<td><button class='center edit greenButton' id='edit-" + players[i].id + "'><i class='fas fa-edit' id='edit-" + players[i].id + "'></i></button>"+
            " <button class='center delete redButton' id='delete-" + players[i].id + "'><i class='far fa-trash-alt' id='delete-" + players[i].id + "'></i></button></td> </tr>";
    }
    
    //creating table
    var table = "<div class='dy-table'><table><tr><th>ID</th><th>Slika</th><th>Ime</th><th>Prezime</th><th>Klub</th>"+
    "<th>Pozicija</th><th>Izaberi sliku</th><th>Akcije</th></tr>"+
    html+"</table></div>"

    //populating DOM element that holds the data
    dataFields.innerHTML = table;

    //getting all dynamically created buttons
    var editButton = document.getElementsByClassName("edit");
    var deleteButton = document.getElementsByClassName("delete");
    var picName = document.getElementsByClassName("dy-file");

    //adding listeners to all dynamically created buttons
    for(var i = 0; i < editButton.length; i++){
        editButton[i].addEventListener("click", function(e){
            var msg = "Are you sure you want to edit a player with ID: " + e.target.id + " ?";
            modalControl(msg, "/admin/managePlayers", "edit", e.target.id);
        });

        deleteButton[i].addEventListener("click", function(e){
            var msg = "Are you sure you want to delete a player with ID: " + e.target.id + " ?";
            modalControl(msg, "/admin/managePlayers", "delete", e.target.id);
        });

        //adding file's name to the element when new file is chosen
        picName[i].addEventListener("change", function(e){
            var x = e.target.closest("td").querySelector(".picName");
            var fileName = e.target.value.split('\\');
            x.innerHTML = " " + fileName[fileName.length - 1];
            
        });
    }
}

//check user credentials
async function checkCreds(e){
    e.preventDefault();

    //getting all form elements
    var elements = e.target.elements;

    //getting all message elements
    var msg = document.getElementsByClassName("error-message");

    var data = {}, failed = false, trimmedText;

    //resetting all message elements
    for(var i = 0; i < msg.length; i++)
        msg[i].innerHTML = "";

    for(var i = 0; i < elements.length - 1; i++){
        //trimming user input
        trimmedText = elements[i].value.trim().replace(/\s+/g, " ");

        //if no text is inserted
        if(trimmedText === ""){
            failed = true;
            elements[i].closest("div").querySelector(".error-message").innerHTML = " *Ovo polje ne moze biti prazno";
            break;
        }else if(trimmedText.length < 3){ //if text is less than 3 characters in length
            failed = true;
            elements[i].closest("div").querySelector(".error-message").innerHTML = " *Ovo polje mora sadrzavati minimalno tri znaka";
            break;
        }

        //populating data object with user input
        data[elements[i].getAttribute("name")] = trimmedText;
    }

    if(failed == true){
        showStatusMsg(true, "Krivi format podataka!");
        return false;
    }

    var pws = e.target.querySelectorAll("input[type='password']");

    //if there are two password fields = registration
    if(pws.length === 2){
        //abort if passwords do not match
        if(pws[0].value !== pws[1].value){
            pws[0].closest("div").querySelector(".error-message").innerHTML = " *Passwordi moraju biti jednaki";
            pws[1].closest("div").querySelector(".error-message").innerHTML = " *Passwordi moraju biti jednaki";
            showStatusMsg(true, "Passwordi moraju biti jednaki!");
            return false;
        }

        //sending data to the server
        var result = await sendData("/api/checkRegistration", data, "POST", false);

        //abort if error occured
        if(result.error == true){
            showStatusMsg(result.error, result.data);
            return false;
        } 

        //submit the form
        e.target.submit();
        return true;
    }

    //sending data to the server
    var result = await sendData("/api/checkCreds", data, "POST", false);

    //abort if error occured
    if(result.error == true){
        showStatusMsg(result.error, result.data);
        return false;
    }        

    //submit the form
    e.target.submit();
    return true;
}

//adding club to the game preview
async function addClubToGame(e){
    //getting file name and club name from selected club index in dropdown list
    var fileName = e.target.options[e.target.selectedIndex].getAttribute("data-fileName");
    var clubName = e.target.options[e.target.selectedIndex].getAttribute("data-name");
    
    //setting the data from selected club
    var team = e.target.closest(".teams");
    team.querySelector(".team-name").innerHTML = clubName;
    team.querySelector("img").setAttribute("src", "/images/"+fileName);
    team.querySelector("img").style.display = "block";
    
    return true;
}

async function addGame(e){
    var elementHTML = e.target.closest(".game-wrapper");
    var failed = false, data = {}, trimmedInput;

    //getting all inputs
    var inputs = elementHTML.querySelectorAll("input, select");

    //check if all input data is valid
    for(var i = 0; i < inputs.length; i++){
        trimmedInput = inputs[i].value.trim().replace(/\s+/g, " ");
        if(trimmedInput === ""){
            failed = true;
            break;
        }

        //populating data object with trimmed values
        data[inputs[i].getAttribute("name")] = trimmedInput;
    }

    //if home club is the same as away club
    if(data.homeclubID === data.awayclubID) failed = true;

    //abort if something went wrong
    if(failed){
        showStatusMsg(true, "Sva polja moraju biti popunjena ili su klubovi jednaki!");
        return false;
    }
    
    //create modal
    var elData = {elementHTML: elementHTML, dataInputs: data};
    modalControl("Jeste li sigurni da želite kreirati utakmicu ?", "/admin/manageGames", "add", elData);
}

//open tabs on user's homepage
function openTab(e){
    var tabcontent = document.getElementsByClassName("tabcontent");

    //hiding all tab contents
    for(var i = 0; i < tabcontent.length; i++)
        tabcontent[i].style.display = "none";
    
    //removing active class from all tab links
    var tablinks = document.getElementsByClassName("tablinks");
    for(var i = 0; i < tablinks.length; i++)
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    
    //getting the clicked tab link and showing related tab content
    var tabID = e.currentTarget.getAttribute("data-tabcontent");
    document.getElementById(tabID).style.display = "block";
    e.currentTarget.className += " active";
}

async function editPicture(e){
    var img = document.getElementsByClassName("profilePicture")[0];
    img.src = URL.createObjectURL(e.currentTarget.files[0]);
    img.onload = function(){
        URL.revokeObjectURL(img.src);
    }
}

//creating new fantasy club
async function createFClub(e){
    //trimming user inputted name
    var name = e.target.closest("div").querySelector("input").value.trim();
    name = name.replace(/\s+/g, " ");
    
    //abort if name is 0 in length
    if(name.length == 0){
        showStatusMsg(true, "Ime kluba ne smije biti prazno!");
        return false;
    }

    //sending data to the server
    var data = {fClubName: name};
    var result = await sendData("/user/fantasyClub", data, "POST", false);
    showStatusMsg(result.error, result.statusMessage);
}

async function searchPlayers(e){
    //getting all player-input elements
    var elements = document.getElementsByClassName("player-input");

    //abort if there are no such elements
    if(!elements)
        return false;
    
    var cbList = [], j = 0, data = {}, html = "", playerListHTML = document.getElementById("player-list"), borderColor, addButtons;
    if(!playerListHTML)
        return false;

    //clearing and hiding DOM element that holds the results
    playerListHTML.style.display = "none";
    playerListHTML.innerHTML = "";

    //loop through all elements 
    for(var i = 0; i < elements.length; i++){
        //if input type is text trim the user inputted value
        if(elements[i].getAttribute("type") == "text")
            data[elements[i].getAttribute("name")] = elements[i].value.trim().replace(/\s+/g, " ");;
        
        //if input type is select dropdown
        if(elements[i].tagName == "SELECT")
            data[elements[i].getAttribute("name")] = elements[i].value;
        
        //if input type is a checkbox
        if(elements[i].getAttribute("type") == "checkbox"){
            //if checkbox is checked add it to the cbList array
            if(elements[i].checked)
                cbList[j++] = elements[i].value;
        }
    }

    //placing all checked checkboxes in data object
    data["checked"] = cbList;

    //abort if user inputted name is less than 3 chars in length and if no club is selected
    if(data.name.length < 3 && data.clubID === "default"){
        showStatusMsg(true, "Ime treba biti duze od 3 znaka i/ili trebate odabrati klub iz padajuce liste");
        return false;
    }
    
    //sending data to the server
    var result = await sendData("/api/getPlayers", data, "POST", false);

    //abort if error occured
    if(result.error){
        showStatusMsg(result.error, result.statusMessage);
        return false;
    }

    //if no players were found
    if(!result.data){
        playerListHTML.innerHTML = "Nije pronađen ni jedan igrač!";
        playerListHTML.style.display = "block";
        return false;
    }

    //looping through all results
    for(var i = 0; i < result.data.length; i++){
        //setting border colors according to player's position
        if(result.data[i].positionID === 1)
            borderColor = "yellow-image";
        else if(result.data[i].positionID === 2)
            borderColor = "blue-image";
        else if(result.data[i].positionID === 3)
            borderColor = "green-image";
        else if(result.data[i].positionID === 4)
            borderColor = "red-image";

        //add a new line every 5 players
        if(i % 5 === 0)
            html += "<br>";
        
        //creating html
        html += "<div class='card mg-left'>"
                    + "<input type='hidden' value='"+ result.data[i].id +"'/>"
                    + "<div class='player-name'>" + result.data[i].name + " " + result.data[i].surname + "</div>"
                    + "<div class='card-img "+ borderColor +"'>" + "<img src='/images/"+ result.data[i].fileName +"' /></div>"
                    + "<span>"+ result.data[i].clubName +"</span>"
                    + "<div class='player-actions'><button type='button' class='center player-add-button'><i class='fas fa-edit'></i> Dodaj</button></div>"
                + "</div>";
    }

    //populating DOM element with created html
    playerListHTML.innerHTML = html;
    playerListHTML.style.display = "block";

    //getting all dynamically created elements
    addButtons = document.getElementsByClassName("player-add-button");

    //abort if no elements were found
    if(!addButtons)
        return false;
    
    //creating listeners for every element found
    for(var i = 0; i < addButtons.length; i++)
        addButtons[i].addEventListener("click", savePlayerToFClub);
    
    return true;
}

//saving player to user's fantasy club
async function savePlayerToFClub(e){
    var closestCard, playerID, data, result;

    //getting the player's id
    closestCard = e.currentTarget.closest(".card");
    playerID = closestCard.querySelector("input").value;
    data = {playerID: playerID};

    //sending data to the server
    result = await sendData("/api/savePlayerToFClub", data, "POST", false);
    showStatusMsg(result.error, result.statusMessage);
    return true;
}

//delete player from user's fantasy club
async function deletePlayerFromFClub(e){
    //getting the player's id
    var cardID = e.target.closest(".card").id;
    modalControl("Jeste li sigurni da želite izbrisati igrača iz vašeg kluba ?", "/api/deletePlayerFromFClub", "delete", cardID);
}

//save new user's fantasy club name
async function saveFClubName(wrap){
    //getting the user inputted fantasy club name
    var input = wrap.querySelector("input");

    //abort if input field was not found
    if(!input)
        return false;

    //trimming user inputted name
    var cleanName = input.value.trim().replace(/\s+/g, " ");

    //abort if name is 0 in length
    if(cleanName.length == 0){
        showStatusMsg(true, "Ime kluba ne smije biti prazno!");
        return false;
    }

    //abort if name is less than 4 in length
    if(cleanName.length <= 3){
        showStatusMsg(true, "Ime kluba mora sadržavati minimalno 4 znaka!");
        return false;
    }

    var data = {fClubName: cleanName};

    //sending data to the server
    var result = await sendData("/api/saveFClubName", data, "PUT", false);

    //if no error occured
    if(!result.error){
        wrap.innerHTML = cleanName;
        wrap.dataset.name = cleanName;
        wrap.dataset.open = "0";
    }

    showStatusMsg(result.error, result.statusMessage);
}

//open the element for fantasy club name change
function openClubNameChange(e){
    //gettting the current DOM element
    var wrap = document.getElementById(e.currentTarget.id);

    //if element was not opened before create html
    if(wrap.dataset.open == "0"){
        var formData = "<input type='text' class='dy-input' value='"+ wrap.innerHTML +"' placeholder='Unesi ime svog kluba'> "+
                        "<button class='greenButton'>Spremi</button> <button class='grayButton'>Odustani</button>";
        wrap.innerHTML = formData;
        wrap.dataset.open = "1";
        return;
    }

    //if clicked element is a gray button (close the name change element)
    if(e.target.classList.contains("grayButton")){
        wrap.innerHTML = wrap.dataset.name;
        wrap.dataset.open = "0";
        return;
    }

    //if clicked element is a green button (change the club name)
    if(e.target.classList.contains("greenButton"))
        saveFClubName(wrap);
    
}



//DRAG & DROP
function dragCard(e){
    //cards contain information about the player: name, picture, position (player position id (eg. defender, attacker)), club

    //getting number of players in card's parent container
    var numOfPlayers = e.currentTarget.closest(".data-wrap").querySelector("span");

    //gathering data on card that is dragged
    e.dataTransfer.setData("cardID", e.currentTarget.id);
    e.dataTransfer.setData("positionID", e.currentTarget.dataset.positionid);
    e.dataTransfer.setData("numOfPlayersID", numOfPlayers.id);
}

function allowDragging(e){  
    e.preventDefault();
}

function dropCard(e){
    //if dragged card is dropped inside another card get info about that card
    if(!e.target.classList.contains("card") && !e.target.classList.contains("content-cards")){
        var currentCard = e.target.closest(".card");
        //getting information about the parent container
        var currentCardParent = currentCard.closest(".content-cards");
    }

    //if dragged card is dropped inside another card
    if(currentCard){
        //abort if dragged card do not have same position id as card it's dropped into
        if(currentCard.dataset.positionid !== e.dataTransfer.getData("positionID"))
            return false;
    }else{
        //abort if dragged card do not have same position id as containter it's dropped into, or if container is not for position id 0 (0 = bench)
        if(e.currentTarget.dataset.positionid !== e.dataTransfer.getData("positionID") && e.currentTarget.dataset.positionid !== "0")
            return false;
    }
    
    e.preventDefault();
    //getting info about dragged card and it's parent container
    var data = e.dataTransfer.getData("cardID");
    var draggedCard = document.getElementById(data);
    var draggedCardParent = draggedCard.closest(".content-cards");

    //getting number of players in dragged card's parent container, used to increment/decrement number
    var numOfPlayersID = e.dataTransfer.getData("numOfPlayersID");

    //swapping the cards
    if(currentCard){   
        draggedCardParent.removeChild(draggedCard);
        currentCardParent.removeChild(currentCard);

        draggedCardParent.appendChild(currentCard);
        currentCardParent.appendChild(draggedCard);
        return true;
    }

    //abort if card is dropped to the same location from where it was dragged
    if(draggedCardParent.id === e.currentTarget.id)
        return false;

    var firstTeamCount = document.getElementsByClassName("firstTeamCount"), count = 0, klupaCount = document.getElementById("k-number");

    //counting the number of players in first team
    for(var i = 0; i < firstTeamCount.length; i++)
        count += Number(firstTeamCount[i].innerHTML.split("/")[0]);
    
    //abort if first team is full (>= 11) and card is not dropped on bench container
    if(count >= 11 && e.currentTarget.dataset.positionid !== "0")
        return false;

    klupaCount = klupaCount.innerHTML.split("/");
    //abort if bench is full and card is dropped on bench container
    if(Number(klupaCount[0]) >= Number(klupaCount[1]) && e.currentTarget.dataset.positionid === "0")
        return false;

    //getting information about container's player count
    var draggedNumOfPlayers = document.getElementById(numOfPlayersID), splitted = {}, num = {}, currentNumOfPlayers = e.currentTarget.closest(".data-wrap").querySelector("span");

    splitted.dragged = draggedNumOfPlayers.innerHTML.split("/");
    splitted.current = currentNumOfPlayers.innerHTML.split("/");
    num.dragged = Number(splitted.dragged[0]);
    num.current = Number(splitted.current[0]);

    //abort if container the card is dropped into has maximum amount of players
    if((num.current + 1) > Number(splitted.current[1]))
        return false;
    
    //incrementing/decrementing player count in both parent containers (old parent and new parent)
    draggedNumOfPlayers.innerHTML = --num.dragged + "/" + splitted.dragged[1];    
    currentNumOfPlayers.innerHTML = ++num.current + "/" + splitted.current[1];

    //dropping the dragged card into a new container
    e.currentTarget.appendChild(document.getElementById(data));
    return true;
}

function dragOverEffectEnter(e){
    e.target.style.boxShadow = "rgba(212, 212, 212, 0.2) 0px 0px 6px";
}

function dragOverEffectLeave(e){
    e.target.style.boxShadow = "none";
}