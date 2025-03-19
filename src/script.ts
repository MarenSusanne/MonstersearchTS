import axios from "axios";
const monsterInput = document.getElementById("monsterInput")! as HTMLInputElement;
const searchButton = document.getElementById("searchButton")!;
const monsterResult = document.getElementById("monsterResult")!;
const autocompleteList = document.getElementById("autocompleteList") as HTMLDivElement;

let allMonsters: Monster[] = [];

type Monster = {
  name: string;
  
};

window.onload = function() {
    axios
      .get(`https://www.dnd5eapi.co/api/monsters`)
      .then((response) => {
        allMonsters = response.data.results;
      })
      .catch((error) => {
        console.error("Error fetching monsters");
      });
  };

  monsterInput.addEventListener("input", () => {
    const query = monsterInput.value.toLowerCase();
    updateAutocompleteList(query);
});

function updateAutocompleteList(query : string) {
  autocompleteList.innerHTML = '';

  if (!query) return;

  const filteredMonsters = allMonsters.filter(monster =>
    monster.name.toLowerCase().startsWith(query)
  );

  filteredMonsters.forEach(monster => {
    const item = document.createElement("div");
    item.classList.add("autocomplete-item");
    item.textContent = monster.name;

    item.addEventListener("click", () => {
      monsterInput.value = monster.name;
      autocompleteList.innerHTML = ''; 
    });

    autocompleteList.appendChild(item);
  });
}

searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    monsterResult.innerHTML = "Please enter a monster name.";
  }
});

function searchMonster(monsterName) {
  monsterResult.innerHTML = "Searching...";

  axios
    .get(`https://www.dnd5eapi.co/api/monsters`)
    .then((response) => {
      const monsters = response.data.results;
      const matchedMonster = monsters.find(
        (monster) => monster.name.toLowerCase() === monsterName
      );

      if (matchedMonster) {
        axios
          .get(`https://www.dnd5eapi.co${matchedMonster.url}`)
          .then((monsterResponse) => {
            const monsterData = monsterResponse.data;
            let speedHTML = `<strong>Speed: </strong> `;
            if (monsterData.speed.walk) {
              speedHTML += `Walking: ${monsterData.speed.walk} `;
            }
            if (monsterData.speed.swim) {
              speedHTML += `| Swimming: ${monsterData.speed.swim} `;
            }
            if (monsterData.speed.fly) {
              speedHTML += `| Flying: ${monsterData.speed.fly} `;
            }
            if (monsterData.speed.burrow) {
              speedHTML += `| Burrowing: ${monsterData.speed.burrow} `;
            }
            if (monsterData.speed.climb) {
              speedHTML += `| Climbing: ${monsterData.speed.climb} `;
            }
            const imageUrl = `https://www.dnd5eapi.co${monsterData.image}`;
            const imageHTML = monsterData.image 
            ? `<img class="monster-image" src="${imageUrl}" alt="an image depicting the Dungeons and Dragons monster: ${monsterData.name}" />` 
            : '';
            monsterResult.innerHTML = `
              <h2>${monsterData.name}</h2>
              <div>
              <p><strong>Size:</strong> ${monsterData.size}</p>
              <p><strong>Type:</strong> ${monsterData.type + ", " + monsterData.alignment}</p>
              <p><strong>Armour Class:</strong> ${monsterData.armor_class[0].value + " " + monsterData.armor_class[0].type}</p>
              <p><strong>Hit Points:</strong> ${monsterData.hit_points}</p>
              <p><strong>Hit Dice:</strong> ${monsterData.hit_points_roll}</p>
              <p>${speedHTML.trim()}</p>
              <!-- You can display more monster details here -->
              </div>
              <div class="monster-image-container">${imageHTML}</div>
            `;
          })
          .catch((error) => {
            monsterResult.innerHTML = "Error fetching monster details.";
          });
      } else {
        monsterResult.innerHTML = "Monster not found.";
      }
    })
    .catch((error) => {
      monsterResult.innerHTML = "Error fetching monsters.";
    });
}