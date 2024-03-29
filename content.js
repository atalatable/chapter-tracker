function setListeners() {
    document.querySelectorAll(".minus").forEach(button => {
        button.addEventListener('click', (e) => {
            let input = e.target.parentNode.children[1];
            updateCount(e.target.parentNode.parentNode, parseInt(input.value)-1, parseInt(input.value))
            input.value = (parseInt(input.value) - 1).toString();
        });
    });

    document.querySelectorAll(".plus").forEach(button => {
        button.addEventListener('click', (e) => {
            let input = e.target.parentNode.children[1];
            updateCount(e.target.parentNode.parentNode, parseInt(input.value) + 1, parseInt(input.value))
            input.value = (parseInt(input.value) + 1).toString();
        });
    });

    document.querySelectorAll(".episode-number").forEach(counter => {
        counter.addEventListener('input', (e) => {
            updateCount(counter.parentNode.parentNode, parseInt(counter.value), 0);
        })
    });

    document.querySelectorAll(".delete:not(.text-button)").forEach(button => {
        button.addEventListener('focus', (e) => {
            e.target.innerHTML = "v";
            e.target.addEventListener('mousedown', (e) => {
                chrome.storage.sync.remove(e.target.parentNode.children[0].children[0].innerHTML);
                e.target.parentNode.remove();
                loadFromStorage();
            }, true);
        });
        button.addEventListener('blur', (e) => {
            e.target.innerHTML = "x";
        });
    });
}

document.querySelector("#add-button").addEventListener('click', addLogic);


function updateCount(e, v, previous) {
    let name = e.children[0].children[0].innerHTML;
    chrome.storage.sync.get(name, function(result) {
        let strg = result[name].split("/-~")
        let url = ""
        let obj = {};

        if(previous != 0) {
            if(strg[1].includes((previous).toString())) {
                url = strg[1].substring(0, strg[1].lastIndexOf((previous.toString()))) 
                    + (v).toString() 
                    + strg[1].substring(strg[1].lastIndexOf((previous.toString()))+(previous).toString().length, strg[1].length)
            } else {
                url = strg[1] 
            }
        } else {
            url = strg[1]
        }

        e.children[0].href = url        

        obj[name] = (v).toString() + "/-~" + url
        chrome.storage.sync.set(obj);
    });
}

function addLogic(e) {
    document.querySelector("form").classList.remove("hide");
    document.querySelector("#add-button").classList.add("hide");

    document.querySelector("#name").focus();

    document.querySelector("form").addEventListener('submit', (e) => {
        e.preventDefault();

        const name = e.target.children[0].value;
        const link = e.target.children[1].value;
        
        if(name != "") {
            let obj = {};
            obj[name] = "0/-~"+link;
            chrome.storage.sync.set(obj);
        }

        document.querySelector("#name").value = ""
        document.querySelector("#link").value = ""
        
        loadFromStorage();

        document.querySelector("#add-button").classList.remove("hide");
        document.querySelector("form").classList.add("hide");
    })

    document.querySelector("#cancel-button").addEventListener('click', (e) => {
        document.querySelector("form").classList.add("hide")
        document.querySelector("#add-button").classList.remove("hide");
    });
}

document.querySelector("#close").addEventListener('click', (e) => {
    window.close();
});

function loadFromStorage() {
    chrome.storage.sync.get(function(result) {
        const epc = document.querySelector("#episodes-container");;
        epc.textContent = "";
        if(Object.keys(result).length == 0) {
            document.querySelector("#episodes-container").innerHTML += "<p>Start by adding an Anime/Manga/Serie/...</p>"
        } else {
            Object.keys(result).forEach(key => {
                if(key != "") {
                    document.querySelector("#episodes-container").innerHTML += `<div class="episode">
                        <a href="${result[key].split("/-~")[1]}" target="_blank">
                        <div class="episode-title">${key}</div>
                        </a>
                        <div class="count">
                            <button class="minus">-</button>
                            <input class="episode-number" type="number" value="${result[key].split("/-~")[0]}">
                            <button class="plus">+</button>
                        </div>
                        <button class="delete">x</button>
                    </div>`;
                }
            });
            setListeners()
        }
    });
}

document.onload = loadFromStorage();