let currentCars = cars;
let currentIndex = 0;


// 자동차 보여주기
function showCar() {

  if (currentCars.length === 0) return;

  const car = currentCars[currentIndex];

  const image = document.getElementById("carImage");
  const name = document.getElementById("carName");
  const category = document.getElementById("carCategory");
  const counter = document.getElementById("counter");

  // 아직 실제 사진을 넣기 전에는 이모지를 보여줌
  image.src = "";
  image.alt = car.name;
  image.style.display = "none";

  // 이모지 표시
  image.parentElement.innerHTML = `
    <div class="big-emoji" onclick="speakCar()">
      ${car.emoji}
    </div>
  `;

  name.textContent = car.name;
  category.textContent = car.category;

  counter.textContent =
    `${currentIndex + 1} / ${currentCars.length}`;
}


// 카테고리 선택
function showCategory(categoryName) {

  currentCars = cars.filter(
    car => car.category === categoryName
  );

  currentIndex = 0;

  showCar();
}


// 다음 자동차
function nextCar() {

  currentIndex++;

  if (currentIndex >= currentCars.length) {
    currentIndex = 0;
  }

  showCar();
}


// 이전 자동차
function previousCar() {

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = currentCars.length - 1;
  }

  showCar();
}


// 랜덤 자동차
function randomCar() {

  if (currentCars.length <= 1) return;

  let newIndex;

  do {
    newIndex = Math.floor(
      Math.random() * currentCars.length
    );
  } while (newIndex === currentIndex);

  currentIndex = newIndex;

  showCar();
}


// 자동차 이름 읽어주기
function speakCar() {

  if (currentCars.length === 0) return;

  const car = currentCars[currentIndex];

  if (!("speechSynthesis" in window)) {
    return;
  }

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(car.name);

  speech.lang = "ko-KR";
  speech.rate = 0.85;
  speech.pitch = 1.1;

  speechSynthesis.speak(speech);
}


// 처음 실행
showCar();