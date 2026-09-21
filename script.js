let currentCategory = "소방차";

let photos = [];

let currentIndex = 0;

let touchStartX = 0;
let touchStartY = 0;


// --------------------------------------------------
// DOM
// --------------------------------------------------

const carImage = document.getElementById("carImage");

const carName = document.getElementById("carName");

const carCategory = document.getElementById("carCategory");

const counter = document.getElementById("counter");

const loading = document.getElementById("loading");

const errorBox = document.getElementById("error");

const credit = document.getElementById("credit");

const photoBox = document.getElementById("photoBox");

const emojiBox = document.getElementById("emojiBox");


// --------------------------------------------------
// API 키 확인
// --------------------------------------------------

function hasApiKey() {

  return (

    typeof PEXELS_API_KEY !== "undefined" &&

    PEXELS_API_KEY !== "" &&

    PEXELS_API_KEY !== "YOUR_PEXELS_API_KEY"

  );

}


// --------------------------------------------------
// 로딩
// --------------------------------------------------

function showLoading() {

  loading.classList.remove("hidden");

}


function hideLoading() {

  loading.classList.add("hidden");

}


// --------------------------------------------------
// 에러
// --------------------------------------------------

function showError(message) {

  errorBox.textContent = message;

  errorBox.classList.remove("hidden");

}


function hideError() {

  errorBox.classList.add("hidden");

}


// --------------------------------------------------
// 카테고리 변경
// --------------------------------------------------

async function selectCategory(category) {

  currentCategory = category;

  currentIndex = 0;

  photos = [];

  hideError();

  showLoading();

  carName.textContent = "자동차를 찾고 있어요!";

  carCategory.textContent = category;

  counter.textContent = "";

  credit.textContent = "";


  updateCategoryButtons();


  if (!hasApiKey()) {

    hideLoading();

    showEmoji();

    carName.textContent =
      CAR_CATEGORIES[category].name;

    showError(
      "config.js에 Pexels API 키를 넣어주세요."
    );

    return;
  }


  try {

    const search =
      CAR_CATEGORIES[category].search;


    const url =
      "https://api.pexels.com/v1/search" +

      "?query=" +

      encodeURIComponent(search) +

      "&per_page=20" +

      "&page=1" +

      "&orientation=landscape";


    const response = await fetch(

      url,

      {

        headers: {

          Authorization: PEXELS_API_KEY

        }

      }

    );


    if (!response.ok) {

      throw new Error(
        "Pexels API 오류"
      );

    }


    const data =
      await response.json();


    photos =
      data.photos || [];


    if (photos.length === 0) {

      throw new Error(
        "사진이 없습니다."
      );

    }


    hideLoading();

    showPhoto();

  }

  catch (error) {

    console.error(error);

    hideLoading();

    showEmoji();

    carName.textContent =
      CAR_CATEGORIES[category].name;

    showError(
      "사진을 불러오지 못했어요."
    );

  }

}


// --------------------------------------------------
// 사진 보여주기
// --------------------------------------------------

function showPhoto() {

  if (photos.length === 0) {

    showEmoji();

    return;

  }


  emojiBox.classList.add("hidden");

  photoBox.classList.remove("hidden");


  const photo =
    photos[currentIndex];


  carImage.src =
    photo.src.large;


  carImage.alt =
    CAR_CATEGORIES[currentCategory].name;


  carName.textContent =
    CAR_CATEGORIES[currentCategory].name;


  carCategory.textContent =
    currentCategory;


  counter.textContent =
    `${currentIndex + 1} / ${photos.length}`;


  if (photo.photographer) {

    credit.innerHTML =
      `📷 Photo by ` +

      `<a href="${photo.photographer_url}" ` +

      `target="_blank" ` +

      `rel="noopener">` +

      escapeHtml(photo.photographer) +

      `</a> on Pexels`;

  }


}


// --------------------------------------------------
// 이모지 화면
// --------------------------------------------------

function showEmoji() {

  photoBox.classList.add("hidden");

  emojiBox.classList.remove("hidden");


  emojiBox.textContent =
    CAR_CATEGORIES[currentCategory].emoji;


  carName.textContent =
    CAR_CATEGORIES[currentCategory].name;


  carCategory.textContent =
    currentCategory;

}


// --------------------------------------------------
// 다음 자동차
// --------------------------------------------------

function nextCar() {

  if (photos.length === 0) {

    return;

  }


  currentIndex++;


  if (currentIndex >= photos.length) {

    currentIndex = 0;

  }


  showPhoto();

}


// --------------------------------------------------
// 이전 자동차
// --------------------------------------------------

function previousCar() {

  if (photos.length === 0) {

    return;

  }


  currentIndex--;


  if (currentIndex < 0) {

    currentIndex =
      photos.length - 1;

  }


  showPhoto();

}


// --------------------------------------------------
// 랜덤
// --------------------------------------------------

function randomCar() {

  if (photos.length <= 1) {

    return;

  }


  let newIndex;


  do {

    newIndex =
      Math.floor(
        Math.random() * photos.length
      );

  }

  while (
    newIndex === currentIndex
  );


  currentIndex = newIndex;


  showPhoto();

}


// --------------------------------------------------
// 음성
// --------------------------------------------------

function speakCar() {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  speechSynthesis.cancel();


  const text =
    CAR_CATEGORIES[currentCategory].name;


  const speech =
    new SpeechSynthesisUtterance(text);


  speech.lang = "ko-KR";

  speech.rate = 0.8;

  speech.pitch = 1.1;


  speechSynthesis.speak(
    speech
  );

}


// --------------------------------------------------
// 카테고리 버튼 표시
// --------------------------------------------------

function updateCategoryButtons() {

  const buttons =
    document.querySelectorAll(
      ".categories button"
    );


  buttons.forEach(button => {

    if (
      button.dataset.category ===
      currentCategory
    ) {

      button.classList.add("active");

    }

    else {

      button.classList.remove("active");

    }

  });

}


// --------------------------------------------------
// HTML 문자 처리
// --------------------------------------------------

function escapeHtml(text) {

  return String(text)
    .replace(
      /[&<>"']/g,

      function(character) {

        return {

          "&": "&amp;",

          "<": "&lt;",

          ">": "&gt;",

          '"': "&quot;",

          "'": "&#039;"

        }[character];

      }

    );

}


// --------------------------------------------------
// 사진 터치
// --------------------------------------------------

photoBox.addEventListener(
  "click",

  function() {

    photoBox.classList.remove(
      "pop"
    );


    void photoBox.offsetWidth;


    photoBox.classList.add(
      "pop"
    );


    speakCar();

  }

);


// --------------------------------------------------
// 스와이프 시작
// --------------------------------------------------

photoBox.addEventListener(

  "touchstart",

  function(event) {

    const touch =
      event.changedTouches[0];


    touchStartX =
      touch.clientX;


    touchStartY =
      touch.clientY;

  },

  {
    passive: true
  }

);


// --------------------------------------------------
// 스와이프 끝
// --------------------------------------------------

photoBox.addEventListener(

  "touchend",

  function(event) {

    const touch =
      event.changedTouches[0];


    const deltaX =
      touch.clientX -
      touchStartX;


    const deltaY =
      touch.clientY -
      touchStartY;


    if (

      Math.abs(deltaX) > 55 &&

      Math.abs(deltaX) >
      Math.abs(deltaY)

    ) {

      if (deltaX < 0) {

        nextCar();

      }

      else {

        previousCar();

      }

    }

  },

  {
    passive: true
  }

);


// --------------------------------------------------
// 버튼
// --------------------------------------------------

document
  .querySelectorAll(
    ".categories button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",

      function() {

        selectCategory(
          this.dataset.category
        );

      }

    );

  });


document
  .getElementById("nextButton")
  .addEventListener(
    "click",
    nextCar
  );


document
  .getElementById("prevButton")
  .addEventListener(
    "click",
    previousCar
  );


document
  .getElementById("randomButton")
  .addEventListener(
    "click",
    randomCar
  );


document
  .getElementById("speakButton")
  .addEventListener(
    "click",
    speakCar
  );


// --------------------------------------------------
// 처음 실행
// --------------------------------------------------

selectCategory("소방차");