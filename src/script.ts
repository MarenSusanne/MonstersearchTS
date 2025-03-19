import axios from "axios";
const monsterInput = document.getElementById("monsterInput")! as HTMLInputElement;
const searchButton = document.getElementById("searchButton")!;
const monsterResult = document.getElementById("monsterResult")!;
const autocompleteList = document.getElementById("autocompleteList") as HTMLDivElement;

interface Monster {
  name: string;
  url: string;
}

interface MonsterDetails {
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { value: number; type: string }[];
  hit_points: number;
  hit_points_roll: string;
  speed: {
    walk?: string;
    swim?: string;
    fly?: string;
    burrow?: string;
    climb?: string;
  };
  image?: string;
}

let allMonsters: Monster[] = [];

window.onload = async function () {
  try {
    const response = await axios.get<{ results: Monster[] }>(
      "https://www.dnd5eapi.co/api/monsters"
    );
    allMonsters = response.data.results;
  } catch (error) {
    console.error("Error fetching monsters", error);
  }
};

  monsterInput.addEventListener("input", () => {
    const query = monsterInput.value.toLowerCase();
    updateAutocompleteList(query);
});

function updateAutocompleteList(query: string): void {
  autocompleteList.innerHTML = "";
  if (!query) return;

  const filteredMonsters = allMonsters.filter((monster) =>
      monster.name.toLowerCase().startsWith(query)
  );

  filteredMonsters.forEach((monster) => addAutocompleteItem(monster));
}

function addAutocompleteItem(monster: Monster): void {
  const item = document.createElement("div");
  item.classList.add("autocomplete-item");
  item.textContent = monster.name;

  item.addEventListener("click", () => {
      monsterInput.value = monster.name;
      autocompleteList.innerHTML = "";
  });

  autocompleteList.appendChild(item);
}

searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    monsterResult.innerHTML = "Please enter a monster name.";
  }
});

async function searchMonster(monsterName: string): Promise<void> {
  monsterResult.innerHTML = "Searching...";
  try {
      const matchedMonster = await findMonster(monsterName);
      if (!matchedMonster) {
          monsterResult.innerHTML = "Monster not found.";
          return;
      }
      const monsterData = await fetchMonsterDetails(matchedMonster.url);
      displayMonsterDetails(monsterData);
  } catch (error) {
      monsterResult.innerHTML = "Error fetching monster details.";
      console.error("Error fetching monster details", error);
  }
}

async function findMonster(monsterName: string): Promise<Monster | undefined> {
  try {
      const response = await axios.get<{ results: Monster[] }>(
          "https://www.dnd5eapi.co/api/monsters"
      );
      return response.data.results.find(
          (monster) => monster.name.toLowerCase() === monsterName
      );
  } catch (error) {
      console.error("Error fetching monsters", error);
      return undefined;
  }
}

async function fetchMonsterDetails(url: string): Promise<MonsterDetails> {
  const response = await axios.get<MonsterDetails>(`https://www.dnd5eapi.co${url}`);
  return response.data;
}

function displayMonsterDetails(monsterData: MonsterDetails): void {
  let speedHTML = generateSpeedHTML(monsterData.speed);
  const imageUrl = `https://www.dnd5eapi.co${monsterData.image}`;
  const imageHTML = monsterData.image
      ? `<img class="monster-image" src="${imageUrl}" alt="an image depicting the Dungeons and Dragons monster: ${monsterData.name}" />`
      : "";

  monsterResult.innerHTML = `
  <h2>${monsterData.name}</h2>
  <div>
    <p><strong>Size:</strong> ${monsterData.size}</p>
    <p><strong>Type:</strong> ${monsterData.type}, ${monsterData.alignment}</p>
    <p><strong>Armour Class:</strong> ${monsterData.armor_class[0]?.value ?? "N/A"} ${monsterData.armor_class[0]?.type ?? ""}</p>
    <p><strong>Hit Points:</strong> ${monsterData.hit_points}</p>
    <p><strong>Hit Dice:</strong> ${monsterData.hit_points_roll}</p>
    <p>${speedHTML.trim()}</p>
  </div>
  <div class="monster-image-container">${imageHTML}</div>
`;
}

function generateSpeedHTML(speed: MonsterDetails["speed"]): string {
  let speedHTML = `<strong>Speed: </strong>`;
  if (speed.walk) speedHTML += `Walking: ${speed.walk} `;
  if (speed.swim) speedHTML += `| Swimming: ${speed.swim} `;
  if (speed.fly) speedHTML += `| Flying: ${speed.fly} `;
  if (speed.burrow) speedHTML += `| Burrowing: ${speed.burrow} `;
  if (speed.climb) speedHTML += `| Climbing: ${speed.climb} `;
  return speedHTML;
}
